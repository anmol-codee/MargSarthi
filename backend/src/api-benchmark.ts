import axios from 'axios';
import { performance } from 'perf_hooks';

async function run() {
  const url = 'http://localhost:5000/api';
  
  console.log('Logging in...');
  const loginRes = await axios.post(`${url}/auth/login`, {
    email: 'admin@margsarthi.edu.in',
    password: 'Admin123!'
  });
  
  const token = loginRes.data.data.accessToken;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  console.log('--- Admin API Benchmarks ---');
  let start = performance.now();
  await axios.get(`${url}/admin/dashboard`, config);
  let end = performance.now();
  console.log('Admin Dashboard API Time:', (end - start).toFixed(2), 'ms');

  start = performance.now();
  await axios.get(`${url}/tickets/all?page=1&limit=10`, config);
  end = performance.now();
  console.log('Admin Tickets API Time:', (end - start).toFixed(2), 'ms');
}

run().catch(console.error);
