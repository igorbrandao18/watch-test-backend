import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },    // Ramp up to 5 users
    { duration: '20s', target: 5 },    // Stay at 5 users
    { duration: '10s', target: 0 },    // Scale down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Less than 10% of requests can fail
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

  // Test multiple endpoints in sequence
  const requests = [
    // Popular movies
    {
      method: 'GET',
      url: `${BASE_URL}/movies/popular`,
      params: params,
    },
    // Movie details
    {
      method: 'GET',
      url: `${BASE_URL}/movies/550`,
      params: params,
    },
    // Search movies
    {
      method: 'GET',
      url: `${BASE_URL}/movies/search?query=matrix`,
      params: params,
    },
  ];

  requests.forEach(request => {
    const response = http.request(request.method, request.url, null, request.params);
    
    check(response, {
      'status is 200': (r) => r.status === 200,
      'response is json': (r) => r.headers['Content-Type'].includes('application/json'),
    });

    sleep(0.5);
  });
} 