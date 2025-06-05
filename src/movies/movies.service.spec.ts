import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventsService } from '../events/events.service';
import { of, throwError } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { PrismaService } from '../common/prisma.service';
import { TMDbRateLimitError, TMDbInvalidApiKeyError } from './interfaces/tmdb-error.interface';

describe('MoviesService', () => {
  let service: MoviesService;
  let httpService: HttpService;
  let cacheManager: any;
  let eventsService: EventsService;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'TMDB_API_KEY':
          return 'mock-api-key';
        case 'TMDB_API_URL':
          return 'http://mock-tmdb-api';
        default:
          return null;
      }
    }),
  };

  const mockHeaders = new AxiosHeaders();

  const mockAxiosConfig: InternalAxiosRequestConfig = {
    url: 'mock-url',
    method: 'get',
    headers: mockHeaders,
    transformRequest: [],
    transformResponse: [],
    timeout: 0,
    adapter: undefined as any,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    env: undefined as any,
    validateStatus: undefined as any,
  };

  const mockPopularMoviesResponse: AxiosResponse = {
    status: 200,
    statusText: 'OK',
    headers: mockHeaders,
    config: mockAxiosConfig,
    data: {
      results: [
        {
          id: 1,
          title: 'Test Movie',
          overview: 'Test Overview',
          poster_path: '/test.jpg',
          release_date: '2024-01-01',
          vote_average: 8.5,
        },
      ],
      page: 1,
      total_pages: 10,
    },
  };

  const mockMovieResponse: AxiosResponse = {
    status: 200,
    statusText: 'OK',
    headers: mockHeaders,
    config: mockAxiosConfig,
    data: {
      id: 1,
      title: 'Test Movie',
      overview: 'Test Overview',
      poster_path: '/test.jpg',
      release_date: '2024-01-01',
      vote_average: 8.5,
    },
  };

  const mockErrorResponse: AxiosResponse = {
    status: 404,
    statusText: 'Not Found',
    headers: mockHeaders,
    config: mockAxiosConfig,
    data: {
      success: false,
      status_code: 34,
      status_message: 'The resource you requested could not be found.',
    },
  };

  const mockMovie = {
    id: 550,
    title: 'Fight Club',
    overview: 'Test overview',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
  };

  const mockMovieWithFullPaths = {
    ...mockMovie,
    poster_path: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
  };

  const mockMovieDetails = {
    ...mockMovie,
    genres: [{ id: 18, name: 'Drama' }],
    runtime: 139,
    tagline: 'Test tagline',
    status: 'Released',
    budget: 63000000,
    revenue: 101200000,
  };

  const mockMovieDetailsWithFullPaths = {
    ...mockMovieDetails,
    poster_path: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                TMDB_API_URL: 'https://api.tmdb.org/3',
                TMDB_API_KEY: 'test-key',
              };
              return config[key];
            }),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: EventsService,
          useValue: {
            publishMovieViewed: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            favorite: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            movieView: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get(CACHE_MANAGER);
    eventsService = module.get<EventsService>(EventsService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPopularMovies', () => {
    const cacheKey = 'popular_movies';

    it('should return cached movies if available', async () => {
      const cachedMovies = [mockMovie];
      cacheManager.get.mockResolvedValue(cachedMovies);

      const result = await service.getPopularMovies();

      expect(result).toEqual([mockMovieWithFullPaths]);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch movies from TMDb if not cached', async () => {
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: { results: [mockMovie] },
        } as any),
      );

      const result = await service.getPopularMovies();

      expect(result).toEqual([mockMovieWithFullPaths]);
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should handle different languages', async () => {
      const language = 'en-US';
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: { results: [mockMovie] },
        } as any),
      );

      await service.getPopularMovies(language);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`language=${language}`),
      );
    });
  });

  describe('getMovieDetails', () => {
    it('should return cached movie details if available', async () => {
      cacheManager.get.mockResolvedValue(mockMovieDetails);

      const result = await service.getMovieDetails(550);

      expect(result).toEqual(mockMovieDetailsWithFullPaths);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent movie', async () => {
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: { status: 404 },
        })),
      );

      await expect(service.getMovieDetails(999999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('error handling', () => {
    it('should throw TMDbRateLimitError on rate limit exceeded', async () => {
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: {
            status: 429,
            data: {
              status_message: 'Rate limit exceeded',
              status_code: 429,
            },
          },
        })),
      );

      await expect(service.getPopularMovies()).rejects.toThrow(TMDbRateLimitError);
    });

    it('should throw TMDbInvalidApiKeyError on invalid API key', async () => {
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(
        throwError(() => ({
          response: {
            status: 401,
            data: {
              status_message: 'Invalid API key',
              status_code: 401,
            },
          },
        })),
      );

      await expect(service.getPopularMovies()).rejects.toThrow(
        TMDbInvalidApiKeyError,
      );
    });
  });

  describe('searchMovies', () => {
    it('should return cached search results if available', async () => {
      const cachedMovies = [mockMovie];
      cacheManager.get.mockResolvedValue(cachedMovies);

      const result = await service.searchMovies('fight club');

      expect(result).toEqual([mockMovieWithFullPaths]);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should search movies with different languages', async () => {
      const query = 'clube da luta';
      const language = 'pt-BR';
      cacheManager.get.mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: { results: [mockMovie] },
        } as any),
      );

      await service.searchMovies(query, language);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`language=${language}`),
      );
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`query=${encodeURIComponent(query)}`),
      );
    });
  });
}); 