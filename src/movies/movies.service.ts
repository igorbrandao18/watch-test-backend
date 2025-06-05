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
  TMDbError
} from './interfaces/movie.interface';
import { PrismaService } from '../common/prisma.service';

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

  async getPopularMovies(): Promise<Movie[]> {
    const cacheKey = 'popular_movies';
    const cachedData = await this.cacheManager.get<Movie[]>(cacheKey);

    if (cachedData) {
      return cachedData.map(movie => ({
        ...movie,
        poster_path: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : null,
        backdrop_path: movie.backdrop_path ? `${this.imageBaseUrl}${movie.backdrop_path}` : null
      }));
    }

    const url = `${this.apiUrl}/movie/popular?api_key=${this.apiKey}&language=pt-BR`;
    const { data } = await firstValueFrom(this.httpService.get<{ results: Movie[] }>(url));

    const moviesWithFullPaths = data.results.map(movie => ({
      ...movie,
      poster_path: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `${this.imageBaseUrl}${movie.backdrop_path}` : null
    }));

    await this.cacheManager.set(cacheKey, moviesWithFullPaths, this.CACHE_TTL);
    return moviesWithFullPaths;
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    const cacheKey = `movie_${id}`;
    const cachedData = await this.cacheManager.get<MovieDetails>(cacheKey);

    if (cachedData) {
      return {
        ...cachedData,
        poster_path: cachedData.poster_path ? `${this.imageBaseUrl}${cachedData.poster_path}` : null,
        backdrop_path: cachedData.backdrop_path ? `${this.imageBaseUrl}${cachedData.backdrop_path}` : null
      };
    }

    const url = `${this.apiUrl}/movie/${id}?api_key=${this.apiKey}&language=pt-BR`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.get<MovieDetails>(url),
      );
      const movie = {
        ...response.data,
        poster_path: response.data.poster_path ? `${this.imageBaseUrl}${response.data.poster_path}` : null,
        backdrop_path: response.data.backdrop_path ? `${this.imageBaseUrl}${response.data.backdrop_path}` : null
      };
      
      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      await this.cacheManager.set(cacheKey, movie, this.CACHE_TTL);
      return movie;
    } catch (error: unknown) {
      if (this.isTMDbError(error) && error.response?.status === 404) {
        throw new NotFoundException('Movie not found');
      }
      throw new Error('Failed to fetch movie details from TMDb');
    }
  }

  async getMovieById(movieId: string, userId: string): Promise<MovieDetails> {
    const cacheKey = `movie_${movieId}`;
    const cachedMovie = await this.cacheManager.get<MovieDetails>(cacheKey);

    if (cachedMovie) {
      await this.eventsService.publishMovieViewed(userId, movieId);
      return cachedMovie;
    }

    try {
      const url = `${this.apiUrl}/movie/${movieId}?api_key=${this.apiKey}`;
      const response = await firstValueFrom(
        this.httpService.get<MovieDetails>(url),
      );
      const movie = response.data;

      await this.cacheManager.set(cacheKey, movie, this.CACHE_TTL);
      await this.eventsService.publishMovieViewed(userId, movieId);

      return movie;
    } catch (error: unknown) {
      if (this.isTMDbError(error) && error.response?.status === 404) {
        throw new NotFoundException('Movie not found');
      }
      throw error;
    }
  }

  private isTMDbError(error: unknown): error is TMDbError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as TMDbError).response === 'object' &&
      (error as TMDbError).response !== null &&
      'status' in (error as TMDbError).response!
    );
  }
} 