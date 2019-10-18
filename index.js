require("dotenv");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const knex = require("knex");
const dbConfig = require("./knexfile.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const server = express();
const db = knex(dbConfig.development);

server.use(cors());
server.use(helmet());
server.use(express.json());

server.set("port", process.env.PORT || 8000);

const secret = process.env.SECRET_KEY;

const generateToken = user => {
  return jwt.sign({ user: user.email }, secret, { expiresIn: "1hr" });
};

const decodeToken = token => {
  return jwt.verify(token, secret);
};

const getSearches = userId => {
  db("searches")
    .where({ user_id: userId })
    .then(data => {
      return data;
    })
    .catch(err => console.error(err));
};

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
        const token = generateToken(newUser.email);
        res
          .status(201)
          .json({ response, message: "User created", token: token });
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
            const token = generateToken(user.email);
            const saved = getSearches(user.id);

            res.status(200).json({ message: "Logged in", token: token });
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
