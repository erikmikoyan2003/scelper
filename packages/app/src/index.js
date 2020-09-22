const fs = require("fs");

const http = require("http");
const https = require("https");
const express = require("express");
const app = express();

const bot = require("@scelper/bot");
const { error } = require("console");

// Получение json-а из body
app.use(express.json());

// Обработка запросов боту
app.post("/vkapi", async (req, res) => {
  await bot.listen(req.body, res);
});

const httpServer = http.createServer(app);
const httpsServer = https.createServer(
  {
    key: fs.readFileSync(__dirname + "/../certificates/privkey.pem", "utf8"),
    cert: fs.readFileSync(__dirname + "/../certificates/fullchain.pem", "utf8"),
  },
  app
);

httpServer.listen(80, () => console.log("http запущен"));
httpsServer.listen(443, () => console.log("https запущен"));
