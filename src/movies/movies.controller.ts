import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
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
} 