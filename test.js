// test.js
const http = require("http");
const app = require("./index.js");

function httpGetJson({ hostname, port, path }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname, port, path, method: "GET", timeout: 5000 },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve({ statusCode: res.statusCode, json });
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data}`));
          }
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Request timed out"));
    });

    req.on("error", (err) => reject(err));
    req.end();
  });
}

(async () => {
  console.log("Running tests...");

  // Starta testserver på en ledig port (0 => OS väljer port)
  const server = app.listen(0);

  // Om servern failar direkt (t.ex. portproblem), fånga det
  server.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

  // Vänta tills servern faktiskt lyssnar
  await new Promise((resolve) => server.once("listening", resolve));

  const port = server.address().port;

  let exitCode = 1;

  try {
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

    console.log("✓ Status endpoint test passed");
    exitCode = 0;
  } catch (err) {
    console.error("✗ Test failed:", err.message);
  } finally {
    server.close(() => process.exit(exitCode));
  }
})();
