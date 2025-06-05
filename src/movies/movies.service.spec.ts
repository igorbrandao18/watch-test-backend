import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventsService } from '../events/events.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

describe('MoviesService', () => {
  let service: MoviesService;
  let httpService: HttpService;
  let cacheManager: any;
  let eventsService: EventsService;
  let configService: ConfigService;

  const mockMovie = {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac...',
    poster_path: '/path/to/poster.jpg',
    release_date: '1999-10-15',
    vote_average: 8.4,
  };

  const mockMovieResponse = {
    data: mockMovie,
  };

  const mockPopularMoviesResponse = {
    data: {
      results: [mockMovie],
      page: 1,
      total_pages: 500,
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
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    httpService = module.get<HttpService>(HttpService);
    cacheManager = module.get(CACHE_MANAGER);
    eventsService = module.get<EventsService>(EventsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPopularMovies', () => {
    const cacheKey = 'popular_movies';

    it('should return cached popular movies if available', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue([mockMovie]);

      const result = await service.getPopularMovies();

      expect(result).toEqual([mockMovie]);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch and cache popular movies if not cached', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockPopularMoviesResponse));

      const result = await service.getPopularMovies();

      expect(result).toEqual([mockMovie]);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(httpService.get).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, [mockMovie], 1800000);
    });
  });

  describe('getMovieById', () => {
    const movieId = '550';
    const cacheKey = `movie_${movieId}`;
    const userId = 'user123';

    it('should return cached movie if available', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockMovie);

      const result = await service.getMovieById(movieId, userId);

      expect(result).toEqual(mockMovie);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(httpService.get).not.toHaveBeenCalled();
      expect(eventsService.publishMovieViewed).toHaveBeenCalledWith(userId, movieId);
    });

    it('should fetch and cache movie if not cached', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockMovieResponse));

      const result = await service.getMovieById(movieId, userId);

      expect(result).toEqual(mockMovie);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(httpService.get).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, mockMovie, 3600000);
      expect(eventsService.publishMovieViewed).toHaveBeenCalledWith(userId, movieId);
    });

    it('should throw NotFoundException for non-existent movie', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          data: {
            success: false,
            status_code: 34,
            status_message: 'The resource you requested could not be found.',
          },
        }),
      );

      await expect(service.getMovieById('999999', userId)).rejects.toThrow(NotFoundException);
    });
  });
}); 