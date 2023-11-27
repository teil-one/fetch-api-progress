import fs from "fs";
import handler from "serve-handler";
import http from "http";

const server = http.createServer((request, response) => {
  if (request.url.endsWith("no-content")) {
    response.statusCode = 204;
    response.end();
    return;
  }

  if (request.url.endsWith("leo-gzip")) {
    const stat = fs.statSync("tests/node/leo.txt.gz");

    response.writeHead(200, {
      "content-encoding": "gzip ",
      "content-type": "text/plain; charset=UTF-8",
      "content-length": stat.size
    });

    const compressedRead = fs.createReadStream("tests/node/leo.txt.gz");
    compressedRead.pipe(response);
    return;
  }

  // https://github.com/vercel/serve-handler
  return handler(request, response);
});

server.listen(3000, () => {
  console.log("Running at http://localhost:3000");
});
