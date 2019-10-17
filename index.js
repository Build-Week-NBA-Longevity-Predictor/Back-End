require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const knex = require("knex");
const dbConfig = require("./knexfile.js");
const bcrypt = require("bcrypt");

const server = express();
const db = knex(dbConfig.development);

server.use(cors());
server.use(helmet());
server.use(express.json());

server.set("port", process.env.PORT || 8000);

server.get("/", (req, res) => {
  res.status(200).json({ message: "server is good" });
});

server.post("/register", (req, res) => {
  let newUser = req.body;

  if (newUser.email && newUser.password) {
    newUser.password = bcrypt.hashSync(newUser.password, 10);

    db("users")
      .insert(newUser)
      .then(response => {
        res.status(201).json(response);
      })
      .catch(err => {
        res.status(500).json(err);
      });
  } else {
    res.status(400).json({ error: "Request missing one or more parameters" });
  }
});

server.post("/login", (req, res) => {
  const creds = req.body;
  if (creds.email) {
    db("users")
      .where({ email: creds.email })
      .first()
      .then(user => {
        if (user) {
          if (bcrypt.compareSync(creds.password, user.password)) {
            res.status(200).json({ message: "Logged in" });
          } else {
            res.status(401).json({ message: "Incorrect username or password" });
          }
        } else {
          res.status(401).json({ message: "Incorrect username or password" });
        }
      });
  } else {
    res.status(401).json({ message: "Incorrect username or password" });
  }
});

server.listen(server.get("port"), () => {
  console.log("=== Listening on port", server.get("port"), " ===");
});
