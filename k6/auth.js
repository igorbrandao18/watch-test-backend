import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp up to 5 users
    { duration: '20s', target: 5 },  // Stay at 5 users
    { duration: '10s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1s
    'http_req_duration{endpoint:login}': ['p(95)<500'],
    'http_req_duration{endpoint:register}': ['p(95)<800'],
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  const email = `test.${randomString(8)}@example.com`;
  const password = 'password123';

  // Test registration
  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'register' },
    }
  );

  check(registerRes, {
    'register successful': (r) => r.status === 201,
    'register returns user': (r) => JSON.parse(r.body).id !== undefined,
  });

  sleep(1);

  // Test login
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'login' },
    }
  );

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'login returns token': (r) => JSON.parse(r.body).access_token !== undefined,
  });

  sleep(1);
} 