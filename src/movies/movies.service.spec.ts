import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventsService } from '../events/events.service';
import { of } from 'rxjs';
import { NotFoundException } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { PrismaService } from '../common/prisma.service';

describe('MoviesService', () => {
  let service: MoviesService;
  let httpService: HttpService;
  let cacheManager: any;
  let eventsService: EventsService;
  let prisma: PrismaService;

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
          useValue: mockConfigService,
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPopularMovies', () => {
    const cacheKey = 'popular_movies';

    it('should return cached popular movies if available', async () => {
      const cachedMovies = [mockMovieResponse.data];
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedMovies);

      const result = await service.getPopularMovies();
      expect(result).toEqual(cachedMovies);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch and cache popular movies if not cached', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockPopularMoviesResponse));

      const result = await service.getPopularMovies();
      expect(result).toEqual(mockPopularMoviesResponse.data.results);
      expect(cacheManager.set).toHaveBeenCalled();
    });
  });

  describe('getMovieById', () => {
    const movieId = '1';
    const cacheKey = `movie_${movieId}`;
    const userId = 'user-1';

    it('should return cached movie if available', async () => {
      const cachedMovie = mockMovieResponse.data;
      jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedMovie);

      const result = await service.getMovieById(movieId, userId);
      expect(result).toEqual(cachedMovie);
      expect(httpService.get).not.toHaveBeenCalled();
      expect(eventsService.publishMovieViewed).toHaveBeenCalledWith(userId, movieId);
    });

    it('should fetch and cache movie if not cached', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockMovieResponse));

      const result = await service.getMovieById(movieId, userId);
      expect(result).toEqual(mockMovieResponse.data);
      expect(cacheManager.set).toHaveBeenCalled();
      expect(eventsService.publishMovieViewed).toHaveBeenCalledWith(userId, movieId);
    });

    it('should throw NotFoundException for non-existent movie', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw {
          response: {
            status: 404,
            data: {
              success: false,
              status_code: 34,
              status_message: 'The resource you requested could not be found.',
            },
          },
        };
      });

      await expect(service.getMovieById(movieId, userId)).rejects.toThrow(NotFoundException);
    });
  });
}); 