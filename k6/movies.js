import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = 'http://localhost:3000';
let token = '';

export function setup() {
  // Login to get token
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });

  token = JSON.parse(loginRes.body).access_token;
  return { token };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
      'Content-Type': 'application/json',
    },
  };

  // Test popular movies endpoint
  const popularRes = http.get(`${BASE_URL}/movies/popular`, params);
  check(popularRes, {
    'popular movies status is 200': (r) => r.status === 200,
    'has movies array': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(1);

  // Test movie details endpoint
  const movieId = '550'; // Fight Club
  const detailsRes = http.get(`${BASE_URL}/movies/${movieId}`, params);
  check(detailsRes, {
    'movie details status is 200': (r) => r.status === 200,
    'has movie title': (r) => JSON.parse(r.body).title !== undefined,
  });

  sleep(1);
} 