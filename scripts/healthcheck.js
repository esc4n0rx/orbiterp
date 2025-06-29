const http = require('http');

const options = {
  hostname: '127.0.0.1', // Força IPv4 em vez de 'localhost'
  port: process.env.PORT || 3001,
  path: '/health',
  method: 'GET',
  timeout: 5000, // Aumenta timeout para 5s
  family: 4 // Força IPv4
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Health check passed');
    process.exit(0);
  } else {
    console.log(`Health check failed with status: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log(`Health check error: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.setTimeout(5000);
req.end();