// test.js - Comprehensive test suite for Silver level
const http = require("http");
const app = require("./index.js");

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
            const json = JSON.parse(data);
            resolve({ statusCode: res.statusCode, json });
          } catch (e) {
            // If not JSON, return as text
            resolve({ statusCode: res.statusCode, text: data });
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

function httpPostJson({ hostname, port, path, body }) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    
    const req = http.request(
      { 
        hostname, 
        port, 
        path, 
        method: "POST", 
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve({ statusCode: res.statusCode, json });
          } catch (e) {
            resolve({ statusCode: res.statusCode, text: data });
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });

    req.on("error", (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

(async () => {
  console.log("🧪 Running comprehensive test suite...\n");

  // Starta testserver på en ledig port (0 => OS väljer port)
  const server = app.listen(0);

  // Om servern failar direkt (t.ex. portproblem), fånga det
  server.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

  const secretRes = await requestJson(port, '/secret');
  if (secretRes.statusCode !== 200 || !secretRes.json.message) {
    throw new Error('Secret endpoint missing message field');
  }
}

  const port = server.address().port;
  console.log(`Test server started on port ${port}\n`);

  let passed = 0;
  let failed = 0;
  const testResults = [];

  // Helper function to run a test
  async function runTest(name, testFn) {
    try {
      await testFn();
      console.log(`✓ ${name}`);
      testResults.push({ name, status: 'PASS' });
      passed++;
    } catch (err) {
      console.log(`✗ ${name}`);
      console.log(`  Error: ${err.message}`);
      testResults.push({ name, status: 'FAIL', error: err.message });
      failed++;
    }
  }

  // Test 1: Status endpoint
  await runTest('Status endpoint returns ok', async () => {
    const res = await httpGetJson({
      hostname: "127.0.0.1",
      port,
      path: "/status",
    });

    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200 but got ${res.statusCode}`);
    }

    if (!res.json || res.json.status !== "ok") {
      throw new Error(`Expected { status: "ok" } but got ${JSON.stringify(res.json)}`);
    }

    if (!res.json.timestamp) {
      throw new Error('Expected timestamp field');
    }
  });

  // Test 2: Health check endpoint
  await runTest('Health check returns detailed info', async () => {
    const res = await httpGetJson({
      hostname: "127.0.0.1",
      port,
      path: "/health",
    });

    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200 but got ${res.statusCode}`);
    }

    if (res.json.status !== 'healthy') {
      throw new Error('Expected status: healthy');
    }

    if (!res.json.uptime) {
      throw new Error('Missing uptime field');
    }

    if (!res.json.memory || !res.json.memory.heapUsed) {
      throw new Error('Missing memory information');
    }
  });

  // Test 3: Ready endpoint
  await runTest('Ready endpoint returns readiness status', async () => {
    const res = await httpGetJson({
      hostname: "127.0.0.1",
      port,
      path: "/ready",
    });

    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200 but got ${res.statusCode}`);
    }

    if (res.json.ready !== true) {
      throw new Error('Expected ready: true');
    }
  });

  // Test 4: Live endpoint
  await runTest('Live endpoint confirms process is alive', async () => {
    const res = await httpGetJson({
      hostname: "127.0.0.1",
      port,
      path: "/live",
    });

    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200 but got ${res.statusCode}`);
    }

    if (res.json.alive !== true) {
      throw new Error('Expected alive: true');
    }
  });

  // Test 5: Version endpoint
  await runTest('Version endpoint returns version info', async () => {
    const res = await httpGetJson({
      hostname: "127.0.0.1",
      port,
      path: "/version",
    });

    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200 but got ${res.statusCode}`);
    }

    if (!res.json.version) {
      throw new Error('Missing version field');
    }

    if (!res.json.build) {
      throw new Error('Missing build field');
    }

    if (!res.json.commit) {
      throw new Error('Missing commit field');
    }
  });

  // Test 6: Root endpoint returns HTML
  await runTest('Root endpoint returns HTML', async () => {
    const res = await httpGetJson({
      hostname: "127.0.0.1",
      port,
      path: "/",
    });

    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200 but got ${res.statusCode}`);
    }

    if (!res.text || !res.text.includes('First Pipeline Challenge')) {
      throw new Error('Expected HTML with title');
    }
  });

  // Test 7: Echo API - success case
  await runTest('Echo API returns message', async () => {
    const res = await httpPostJson({
      hostname: "127.0.0.1",
      port,
      path: "/api/echo",
      body: { message: 'Hello World' }
    });

    if (res.statusCode !== 200) {
      throw new Error(`Expected status 200 but got ${res.statusCode}`);
    }

    if (res.json.echo !== 'Hello World') {
      throw new Error(`Expected echo: 'Hello World' but got ${res.json.echo}`);
    }

    if (!res.json.receivedAt) {
      throw new Error('Missing receivedAt field');
    }
  });

  // Test 8: Echo API - validation
  await runTest('Echo API validates required fields', async () => {
    const res = await httpPostJson({
      hostname: "127.0.0.1",
      port,
      path: "/api/echo",
      body: {}
    });

    if (res.statusCode !== 400) {
      throw new Error(`Expected status 400 but got ${res.statusCode}`);
    }

    if (res.json.error !== 'Message is required') {
      throw new Error('Expected error message about required field');
    }
  });

  // Test 9: 404 handling
  await runTest('Unknown routes return 404', async () => {
    const res = await httpGetJson({
      hostname: "127.0.0.1",
      port,
      path: "/nonexistent",
    });

    if (res.statusCode !== 404) {
      throw new Error(`Expected status 404 but got ${res.statusCode}`);
    }

    if (res.json.error !== 'Not Found') {
      throw new Error('Expected error: Not Found');
    }

    if (res.json.path !== '/nonexistent') {
      throw new Error('Expected path in error response');
    }
  });

  // Test 10: Multiple endpoints are accessible
  await runTest('All health endpoints are accessible', async () => {
    const endpoints = ['/status', '/health', '/ready', '/live', '/version'];
    
    for (const endpoint of endpoints) {
      const res = await httpGetJson({
        hostname: "127.0.0.1",
        port,
        path: endpoint,
      });

      if (res.statusCode !== 200) {
        throw new Error(`Endpoint ${endpoint} returned ${res.statusCode}`);
      }
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total tests: ${passed + failed}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);
  
  if (passed + failed > 0) {
    const coverage = Math.round((passed / (passed + failed)) * 100);
    console.log(`Coverage: ${coverage}%`);
  }
  
  console.log('='.repeat(50) + '\n');

  const exitCode = failed > 0 ? 1 : 0;

  if (exitCode === 0) {
    console.log('✅ All tests passed!\n');
  } else {
    console.log('❌ Some tests failed!\n');
  }

  server.close(() => process.exit(exitCode));
})();
