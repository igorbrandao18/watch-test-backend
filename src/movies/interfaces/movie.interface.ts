import { ApiProperty } from '@nestjs/swagger';

export class Movie {
  @ApiProperty({
    description: 'ID do filme no TMDb',
    example: 550,
  })
  id: number;

  @ApiProperty({
    description: 'Título do filme',
    example: 'Fight Club',
  })
  title: string;

  @ApiProperty({
    description: 'Sinopse do filme',
    example: 'Um homem deprimido que sofre de insônia conhece um estranho vendedor...',
  })
  overview: string;

  @ApiProperty({
    description: 'URL do poster do filme',
    example: 'https://image.tmdb.org/t/p/w500/poster.jpg',
    nullable: true,
  })
  poster_path: string | null;

  @ApiProperty({
    description: 'URL da imagem de fundo do filme',
    example: 'https://image.tmdb.org/t/p/w500/backdrop.jpg',
    nullable: true,
  })
  backdrop_path: string | null;

  @ApiProperty({
    description: 'Data de lançamento',
    example: '1999-10-15',
  })
  release_date: string;

  @ApiProperty({
    description: 'Nota média',
    example: 8.4,
  })
  vote_average: number;
}

export interface MovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export class Genre {
  @ApiProperty({
    description: 'ID do gênero',
    example: 18,
  })
  id: number;

  @ApiProperty({
    description: 'Nome do gênero',
    example: 'Drama',
  })
  name: string;
}

export class MovieDetails extends Movie {
  @ApiProperty({
    description: 'Lista de gêneros do filme',
    type: [Genre],
  })
  genres: Genre[];

  @ApiProperty({
    description: 'Duração em minutos',
    example: 139,
  })
  runtime: number;

  @ApiProperty({
    description: 'Slogan do filme',
    example: 'Mischief. Mayhem. Soap.',
    nullable: true,
  })
  tagline: string | null;

  @ApiProperty({
    description: 'Status do filme',
    example: 'Released',
  })
  status: string;

  @ApiProperty({
    description: 'Orçamento do filme em dólares',
    example: 63000000,
  })
  budget: number;

  @ApiProperty({
    description: 'Receita do filme em dólares',
    example: 101200000,
  })
  revenue: number;
}

export interface TMDbError {
  response?: {
    status: number;
    data?: {
      status_message: string;
      status_code: number;
    };
  };
} 