export interface TMDbErrorResponse {
  status_message: string;
  status_code: number;
}

export interface TMDbError {
  response: {
    status: number;
    data: TMDbErrorResponse;
  };
}

export class TMDbApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'TMDbApiError';
  }
}

export class TMDbRateLimitError extends TMDbApiError {
  constructor() {
    super(429, 'TMDb API rate limit exceeded');
    this.name = 'TMDbRateLimitError';
  }
}

export class TMDbInvalidApiKeyError extends TMDbApiError {
  constructor() {
    super(401, 'Invalid TMDb API key');
    this.name = 'TMDbInvalidApiKeyError';
  }
} 