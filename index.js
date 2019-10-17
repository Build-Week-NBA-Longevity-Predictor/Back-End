require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const knex = require("knex");
const dbConfig = require("./knexfile");

const server = express();
const db = knex(dbConfig.development);

server.use(cors());
server.use(helmet());
server.use(express.json());

server.set("port", process.env.PORT || 8000);

server.get("/", (req, res) => {
  res.status(200).json({ message: "server is good" });
});

server.listen(server.get("port"), () => {
  console.log("=== Listening on port", server.get("port"), " ===");
});
