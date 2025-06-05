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
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete below 3s
  },
};

const BASE_URL = 'http://localhost:3000';

// Helper function to get authentication token
function getAuthToken() {
  const email = `test.${randomString(8)}@example.com`;
  const password = 'password123';

  // Register new user
  const registerRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  console.log(`Register response: ${registerRes.status} - ${registerRes.body}`);

  // Login to get token
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: email,
      password: password,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  console.log(`Login response: ${loginRes.status} - ${loginRes.body}`);

  const token = JSON.parse(loginRes.body).access_token;
  return token;
}

export default function () {
  const token = getAuthToken();
  sleep(1);
} 