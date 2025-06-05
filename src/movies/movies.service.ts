import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { EventsService } from '../events/events.service';
import {
  Movie,
  MovieResponse,
  MovieDetails,
  TMDbError
} from './interfaces/movie.interface';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MoviesService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

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
      return cachedData;
    }

    const url = `${this.apiUrl}/movie/popular?api_key=${this.apiKey}&language=pt-BR`;
    
    try {
      const response = await firstValueFrom(
        this.httpService.get<MovieResponse>(url),
      );
      const movies = response.data.results;
      
      await this.cacheManager.set(cacheKey, movies, 1800000); // 30 minutes
      return movies;
    } catch (error: unknown) {
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
      const response = await firstValueFrom(
        this.httpService.get<MovieDetails>(url),
      );
      const movie = response.data;
      
      if (!movie) {
        throw new NotFoundException('Movie not found');
      }

      await this.cacheManager.set(cacheKey, movie, 3600000); // 1 hour
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

      await this.cacheManager.set(cacheKey, movie, 3600000); // 1 hour
      await this.eventsService.publishMovieViewed(userId, movieId);

      return movie;
    } catch (error: unknown) {
      if (this.isTMDbError(error) && error.response?.status === 404) {
        throw new NotFoundException('Movie not found');
      }
      throw error;
    }
  }

  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addToFavorites(movieId: string, userId: string) {
    // Verifica se o filme existe
    await this.getMovieById(movieId, userId);

    // Verifica se já é favorito
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (existingFavorite) {
      return existingFavorite;
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        movieId,
      },
    });
  }

  async removeFromFavorites(movieId: string, userId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
    });

    return { message: 'Favorite removed successfully' };
  }

  async getViewHistory(userId: string) {
    return this.prisma.movieView.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
    });
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