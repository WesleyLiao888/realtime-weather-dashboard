const http = require("node:http");
const path = require("node:path");
const { readFile } = require("node:fs/promises");
const { execFile } = require("node:child_process");

const port = Number(process.env.PORT) || 8765;
const dashboardUrl = `http://127.0.0.1:${port}/`;
const publicFiles = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"]
};

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, dashboardUrl);

  try {
    const file = publicFiles[requestUrl.pathname];
    if (!file) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const content = await readFile(path.join(__dirname, file[0]));
    response.writeHead(200, {
      "Content-Type": file[1],
      "Cache-Control": "no-store"
    });
    response.end(content);
  } catch (error) {
    console.error(error);
    response.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Unable to load dashboard");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`即時天氣儀錶板已啟動：${dashboardUrl}`);
  console.log("關閉此視窗即可停止儀錶板。");

  if (!process.env.NO_OPEN) {
    execFile("cmd.exe", ["/c", "start", "", dashboardUrl], { windowsHide: true });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`連接埠 ${port} 已被使用，請先關閉舊的儀錶板視窗。`);
  } else {
    console.error(error);
  }
  process.exit(1);
});
