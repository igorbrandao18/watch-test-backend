import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RequestWithUser } from './interfaces/request.interface';
import { Movie, MovieDetails } from './interfaces/movie.interface';

@ApiTags('movies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('popular')
  @ApiOperation({
    summary: 'Get popular movies',
    description:
      'Retorna uma lista dos filmes mais populares do momento usando dados do TMDb.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de filmes populares retornada com sucesso',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 550,
            description: 'ID do filme no TMDb',
          },
          title: {
            type: 'string',
            example: 'Fight Club',
            description: 'Título do filme',
          },
          overview: {
            type: 'string',
            example: 'Um homem deprimido...',
            description: 'Sinopse do filme',
          },
          poster_path: {
            type: 'string',
            example: '/poster.jpg',
            description: 'Caminho do poster',
          },
          release_date: {
            type: 'string',
            example: '1999-10-15',
            description: 'Data de lançamento',
          },
          vote_average: {
            type: 'number',
            example: 8.4,
            description: 'Nota média',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha na API do TMDb',
  })
  async getPopularMovies(): Promise<Movie[]> {
    return this.moviesService.getPopularMovies();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get movie details by ID',
    description:
      'Retorna detalhes completos de um filme específico usando seu ID do TMDb.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do filme no TMDb',
    example: '550',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do filme retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 550 },
        title: { type: 'string', example: 'Fight Club' },
        overview: { type: 'string', example: 'Um homem deprimido...' },
        poster_path: { type: 'string', example: '/poster.jpg' },
        release_date: { type: 'string', example: '1999-10-15' },
        vote_average: { type: 'number', example: 8.4 },
        genres: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 18 },
              name: { type: 'string', example: 'Drama' },
            },
          },
        },
        runtime: { type: 'number', example: 139 },
        budget: { type: 'number', example: 63000000 },
        revenue: { type: 'number', example: 101200000 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({ status: 404, description: 'Filme não encontrado' })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha na API do TMDb',
  })
  async getMovieDetails(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ): Promise<MovieDetails> {
    const movie = await this.moviesService.getMovieDetails(id);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }
} 