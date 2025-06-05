import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  NotFoundException,
  Request,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
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
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Código do idioma (ex: pt-BR, en-US)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de filmes populares retornada com sucesso',
    type: [Movie],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha na API do TMDb',
  })
  async getPopularMovies(
    @Query('language') language?: string,
  ): Promise<Movie[]> {
    return this.moviesService.getPopularMovies(language);
  }

  @Get('now-playing')
  @ApiOperation({
    summary: 'Get movies now playing',
    description: 'Retorna uma lista dos filmes em cartaz nos cinemas.',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Código do idioma (ex: pt-BR, en-US)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de filmes em cartaz retornada com sucesso',
    type: [Movie],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha na API do TMDb',
  })
  async getNowPlaying(
    @Query('language') language?: string,
  ): Promise<Movie[]> {
    return this.moviesService.getNowPlaying(language);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search movies',
    description: 'Busca filmes pelo título ou palavras-chave.',
  })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Termo de busca',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Código do idioma (ex: pt-BR, en-US)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de filmes encontrados',
    type: [Movie],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha na API do TMDb',
  })
  async searchMovies(
    @Query('query') query: string,
    @Query('language') language?: string,
  ): Promise<Movie[]> {
    return this.moviesService.searchMovies(query, language);
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
    type: Number,
    required: true,
  })
  @ApiQuery({
    name: 'language',
    required: false,
    type: String,
    description: 'Código do idioma (ex: pt-BR, en-US)',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do filme retornados com sucesso',
    type: MovieDetails,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - Token JWT inválido ou ausente',
  })
  @ApiResponse({
    status: 404,
    description: 'Filme não encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor ou falha na API do TMDb',
  })
  async getMovieDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('language') language?: string,
    @Request() req?: any,
  ): Promise<MovieDetails> {
    return this.moviesService.getMovieDetails(id, language, req.user?.id);
  }
} 