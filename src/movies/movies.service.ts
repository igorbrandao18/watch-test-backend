import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { EventsService } from '../events/events.service';
import {
  Movie,
  MovieDetails,
} from './interfaces/movie.interface';
import { 
  TMDbError, 
  TMDbApiError, 
  TMDbRateLimitError, 
  TMDbInvalidApiKeyError 
} from './interfaces/tmdb-error.interface';
import { PrismaService } from '../common/prisma.service';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class MoviesService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly imageBaseUrl: string = 'https://image.tmdb.org/t/p/w500';
  private readonly CACHE_TTL = 300; // 5 minutes in seconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventsService: EventsService,
    private readonly prisma: PrismaService,
  ) {
    const apiUrl = this.configService.get<string>('TMDB_API_URL');
    const apiKey = this.configService.get<string>('TMDB_API_KEY');

    if (!apiUrl || !apiKey) {
      throw new Error('TMDB_API_URL and TMDB_API_KEY must be defined');
    }

    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  private getCacheKey(key: string, language: string = 'pt-BR'): string {
    return `${key}_${language}`;
  }

  private addImageUrls<T extends { poster_path?: string | null; backdrop_path?: string | null }>(
    item: T
  ): T {
    return {
      ...item,
      poster_path: item.poster_path ? `${this.imageBaseUrl}${item.poster_path}` : null,
      backdrop_path: item.backdrop_path ? `${this.imageBaseUrl}${item.backdrop_path}` : null,
    };
  }

  async getPopularMovies(language: string = 'pt-BR'): Promise<Movie[]> {
    const cacheKey = this.getCacheKey('popular_movies', language);
    const cachedData = await this.cacheManager.get<Movie[]>(cacheKey);

    if (cachedData) {
      return cachedData.map(movie => this.addImageUrls(movie));
    }

    try {
      const url = `${this.apiUrl}/movie/popular?api_key=${this.apiKey}&language=${language}`;
      const { data } = await firstValueFrom(this.httpService.get<{ results: Movie[] }>(url));

      const moviesWithFullPaths = data.results.map(movie => this.addImageUrls(movie));
      await this.cacheManager.set(cacheKey, moviesWithFullPaths, this.CACHE_TTL);
      
      return moviesWithFullPaths;
    } catch (error: unknown) {
      this.handleTMDbError(error);
    }
  }

  async getMovieDetails(id: number, language: string = 'pt-BR', userId?: number): Promise<MovieDetails> {
    const cacheKey = `movie_details_${id}_${language}`;
    const cached = await this.cacheManager.get<MovieDetails>(cacheKey);

    if (cached) {
      if (userId) {
        await this.eventsService.publishMovieViewed({
          userId,
          movieId: id,
          timestamp: new Date(),
          language,
        });
      }
      return this.addImageUrls(cached);
    }

    try {
      const response = await firstValueFrom(
        this.httpService
          .get<MovieDetails>(`${this.apiUrl}/movie/${id}`, {
            params: {
              api_key: this.apiKey,
              language,
            },
          })
          .pipe(
            map((response) => response.data),
            catchError((error) => {
              if (error.response?.status === 404) {
                throw new NotFoundException(`Movie with ID ${id} not found`);
              }
              throw this.handleTMDbError(error);
            }),
          ),
      );

      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL);

      if (userId) {
        await this.eventsService.publishMovieViewed({
          userId,
          movieId: id,
          timestamp: new Date(),
          language,
        });
      }

      return this.addImageUrls(response);
    } catch (error) {
      throw this.handleTMDbError(error);
    }
  }

  async searchMovies(query: string, language: string = 'pt-BR'): Promise<Movie[]> {
    const cacheKey = this.getCacheKey(`search_${query}`, language);
    const cachedData = await this.cacheManager.get<Movie[]>(cacheKey);

    if (cachedData) {
      return cachedData.map(movie => this.addImageUrls(movie));
    }

    try {
      const url = `${this.apiUrl}/search/movie?api_key=${this.apiKey}&language=${language}&query=${encodeURIComponent(query)}`;
      const { data } = await firstValueFrom(this.httpService.get<{ results: Movie[] }>(url));

      const moviesWithFullPaths = data.results.map(movie => this.addImageUrls(movie));
      await this.cacheManager.set(cacheKey, moviesWithFullPaths, this.CACHE_TTL);
      
      return moviesWithFullPaths;
    } catch (error: unknown) {
      this.handleTMDbError(error);
    }
  }

  async getNowPlaying(language: string = 'pt-BR'): Promise<Movie[]> {
    const cacheKey = this.getCacheKey('now_playing', language);
    const cachedData = await this.cacheManager.get<Movie[]>(cacheKey);

    if (cachedData) {
      return cachedData.map(movie => this.addImageUrls(movie));
    }

    try {
      const url = `${this.apiUrl}/movie/now_playing?api_key=${this.apiKey}&language=${language}`;
      const { data } = await firstValueFrom(this.httpService.get<{ results: Movie[] }>(url));

      const moviesWithFullPaths = data.results.map(movie => this.addImageUrls(movie));
      await this.cacheManager.set(cacheKey, moviesWithFullPaths, this.CACHE_TTL);
      
      return moviesWithFullPaths;
    } catch (error: unknown) {
      this.handleTMDbError(error);
    }
  }

  private handleTMDbError(error: unknown): never {
    if (this.isTMDbError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.status_message;

      switch (status) {
        case 404:
          throw new NotFoundException('Movie not found');
        case 401:
          throw new TMDbInvalidApiKeyError();
        case 429:
          throw new TMDbRateLimitError();
        default:
          throw new TMDbApiError(status, message || 'Unknown TMDb API error');
      }
    }
    throw error;
  }

  private isTMDbError(error: unknown): error is TMDbError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as TMDbError).response === 'object' &&
      (error as TMDbError).response !== null &&
      'status' in (error as TMDbError).response
    );
  }
} 