import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EventsService } from '../events/events.service';
import { Movie, MovieResponse, MovieDetails } from './interfaces/movie.interface';

@Injectable()
export class MoviesService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventsService: EventsService,
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
      return cachedData;
    }

    const url = `${this.apiUrl}/movie/popular?api_key=${this.apiKey}&language=pt-BR`;
    
    try {
      const response = await firstValueFrom(this.httpService.get<MovieResponse>(url));
      const movies = response.data.results;
      
      await this.cacheManager.set(cacheKey, movies, 1800000); // 30 minutes
      return movies;
    } catch (error) {
      throw new Error('Failed to fetch popular movies from TMDb');
    }
  }

  async getMovieDetails(id: number): Promise<MovieDetails> {
    const cacheKey = `movie_${id}`;
    const cachedData = await this.cacheManager.get<MovieDetails>(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const url = `${this.apiUrl}/movie/${id}?api_key=${this.apiKey}&language=pt-BR`;
    
    try {
      const response = await firstValueFrom(this.httpService.get<MovieDetails>(url));
      const movie = response.data;
      
      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      await this.cacheManager.set(cacheKey, movie, 3600000); // 1 hour
      return movie;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('Movie not found');
      }
      throw new Error('Failed to fetch movie details from TMDb');
    }
  }

  async getMovieById(movieId: string, userId: string) {
    const cacheKey = `movie_${movieId}`;
    const cachedMovie = await this.cacheManager.get(cacheKey);

    if (cachedMovie) {
      await this.eventsService.publishMovieViewed(userId, movieId);
      return cachedMovie;
    }

    const url = `${this.apiUrl}/movie/${movieId}?api_key=${this.apiKey}`;
    const response = await firstValueFrom(this.httpService.get(url));

    if (response.data.success === false) {
      throw new NotFoundException('Movie not found');
    }

    const movie = response.data;
    await this.cacheManager.set(cacheKey, movie, 3600000); // 1 hour
    await this.eventsService.publishMovieViewed(userId, movieId);

    return movie;
  }
} 