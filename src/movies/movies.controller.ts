import { Controller, Get, Param, UseGuards, Request, Post, Delete } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('movies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('popular')
  @ApiOperation({ summary: 'Get popular movies' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of popular movies',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          overview: { type: 'string' },
          poster_path: { type: 'string' },
          release_date: { type: 'string' },
          vote_average: { type: 'number' },
        },
      },
    },
  })
  getPopularMovies() {
    return this.moviesService.getPopularMovies();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get movie details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns movie details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string' },
        overview: { type: 'string' },
        poster_path: { type: 'string' },
        release_date: { type: 'string' },
        vote_average: { type: 'number' },
      },
    },
  })
  getMovieById(@Param('id') id: string, @Request() req: any) {
    return this.moviesService.getMovieById(id, req.user.id);
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorite movies' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of favorite movies',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          movieId: { type: 'number' },
          userId: { type: 'string' },
          createdAt: { type: 'string' },
        },
      },
    },
  })
  getFavorites(@Request() req: any) {
    return this.moviesService.getFavorites(req.user.id);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Add movie to favorites' })
  @ApiResponse({ status: 201, description: 'Movie added to favorites' })
  addToFavorites(@Param('id') id: string, @Request() req: any) {
    return this.moviesService.addToFavorites(id, req.user.id);
  }

  @Delete(':id/favorite')
  @ApiOperation({ summary: 'Remove movie from favorites' })
  @ApiResponse({ status: 200, description: 'Movie removed from favorites' })
  removeFromFavorites(@Param('id') id: string, @Request() req: any) {
    return this.moviesService.removeFromFavorites(id, req.user.id);
  }

  @Get('views')
  @ApiOperation({ summary: 'Get user movie view history' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of viewed movies',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          movieId: { type: 'number' },
          userId: { type: 'string' },
          viewedAt: { type: 'string' },
        },
      },
    },
  })
  getViewHistory(@Request() req: any) {
    return this.moviesService.getViewHistory(req.user.id);
  }
} 