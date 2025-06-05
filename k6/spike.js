import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 2 },    // Baseline
    { duration: '10s', target: 5 },    // Spike to 5 users
    { duration: '20s', target: 5 },    // Stay at 5 users
    { duration: '10s', target: 2 },    // Scale down to baseline
    { duration: '10s', target: 0 },    // Scale down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests must complete below 3s
    http_req_failed: ['rate<0.15'],     // Less than 15% of requests can fail
  },
};

const BASE_URL = 'http://localhost:3000';

export function setup() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const token = JSON.parse(loginRes.body).access_token;
  return { token };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  // Randomly select an endpoint to test
  const endpoints = [
    () => {
      // Popular movies
      const res = http.get(`${BASE_URL}/movies/popular`, params);
      check(res, {
        'popular status is 200': (r) => r.status === 200,
        'popular has results': (r) => JSON.parse(r.body).length > 0,
      });
    },
    () => {
      // Movie details
      const movieIds = ['550', '551', '552', '553', '554'];
      const randomId = movieIds[Math.floor(Math.random() * movieIds.length)];
      const res = http.get(`${BASE_URL}/movies/${randomId}`, params);
      check(res, {
        'details status is 200': (r) => r.status === 200,
        'details has title': (r) => JSON.parse(r.body).title !== undefined,
      });
    },
    () => {
      // Search movies
      const queries = ['action', 'drama', 'comedy', 'sci-fi', 'thriller'];
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      const res = http.get(`${BASE_URL}/movies/search?query=${encodeURIComponent(randomQuery)}`, params);
      check(res, {
        'search status is 200': (r) => r.status === 200,
        'search has results': (r) => JSON.parse(r.body).length > 0,
      });
    },
  ];

  // Execute random endpoint test
  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  randomEndpoint();

  sleep(1);
} 