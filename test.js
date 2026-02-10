const http = require('http');
const app = require('./index.js');

function requestJson(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method: 'GET',
        timeout: 5000
      },
      (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, json: JSON.parse(data) });
          } catch {
            reject(new Error(`Invalid JSON response from ${path}: ${data}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out for ${path}`));
    });

    req.on('error', (err) => {
      reject(new Error(`Connection failed for ${path}: ${err.message}`));
    });

    req.end();
  });
}

async function runTests(port) {
  const statusRes = await requestJson(port, '/status');
  if (statusRes.statusCode !== 200 || statusRes.json.status !== 'ok') {
    throw new Error('Status endpoint returned wrong data');
  }

  const secretRes = await requestJson(port, '/secret');
  if (secretRes.statusCode !== 200 || !secretRes.json.message) {
    throw new Error('Secret endpoint missing message field');
  }
}

console.log('Running tests...');
const server = app.listen(0, async () => {
  const address = server.address();
  const port = address && typeof address === 'object' ? address.port : null;

  if (!port) {
    console.error('Test failed: could not determine test server port');
    server.close(() => process.exit(1));
    return;
  }

  try {
    await runTests(port);
    console.log('Status endpoint test passed');
    console.log('Secret endpoint test passed');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error(`Test failed: ${err.message}`);
    server.close(() => process.exit(1));
  }
});
