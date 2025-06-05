import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp up to 5 users
    { duration: '20s', target: 5 },  // Stay at 5 users
    { duration: '10s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests must complete below 800ms
    'http_req_duration{endpoint:search}': ['p(95)<600'],
  },
};

const BASE_URL = 'http://localhost:3000';
const SEARCH_TERMS = ['matrix', 'star wars', 'lord of the rings', 'avengers', 'inception'];

export function setup() {
  // Login to get token
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
    tags: { endpoint: 'search' },
  };

  // Random search term
  const searchTerm = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  
  // Test search endpoint
  const searchRes = http.get(
    `${BASE_URL}/movies/search?query=${encodeURIComponent(searchTerm)}`,
    params
  );

  check(searchRes, {
    'search status is 200': (r) => r.status === 200,
    'search returns results': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(1);
} 