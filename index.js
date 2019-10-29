require("dotenv").config();
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
const url = "https://nba-longevity.herokuapp.com/predict";

const generateToken = user => {
  return jwt.sign({ user: user.email, id: user.id }, secret, {
    expiresIn: "1hr"
  });
};

const decodeToken = token => {
  const decoded = jwt.verify(token, secret);

  return decoded;
};

server.get("/", (req, res) => {
  db("searches").then(data => {
    res.status(200).json({ data: data });
  });
});

server.post("/register", (req, res) => {
  let newUser = req.body;

  if (newUser.email && newUser.password) {
    newUser.password = bcrypt.hashSync(newUser.password, 10);

    db("users")
      .where({ email: newUser.email })
      .then(users => {
        if (users.length > 0) {
          res
            .status(400)
            .json({ error: "A user with this email already exists" });
        } else {
          db("users")
            .insert(newUser, ["id"])
            .then(response => {
              const token = generateToken({
                email: newUser.email,
                id: response
              });
              res
                .status(201)
                .json({ response, message: "User created", token: token });
            })
            .catch(err => {
              res.status(500).json(err);
            });
        }
      })
      .catch(err => console.error(err));
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
            const token = generateToken({ email: user.email, id: user.id });

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

server.post("/search", (req, res) => {
  const user = decodeToken(req.body.token);
  console.log("body", req.body);
  if (user.error) {
    res.status(401).json({ error: "Invalid token" });
  } else {
    axios
      .post(url, { Player: req.body.player })
      .then(results => {
        console.log("hi");
        let data = JSON.stringify(results.data);
        db("searches")
          .insert({
            user_id: user.id,
            player_name: req.body.player,
            data: data
          })
          .then(result => {
            res.status(201).json({ player: req.body.player });
          })
          .catch(error => console.error(error));
      })
      .catch(error => console.error(error));
  }
});

server.post("/history", (req, res) => {
  const user = decodeToken(req.body.token);
  if (user.error) {
    res.status(401).json({ error: "Invalid token" });
  } else {
    db("searches")
      .where({ user_id: user.id })
      .then(results => {
        let history = [];
        for (let result of results) {
          history.push({ ...result, stats: JSON.parse(result.stats) });
        }
        res.status(200).json({ history: history });
      })
      .catch(err => console.error(err));
  }
});

server.post("/delete", (req, res) => {
  const user = decodeToken(req.body.token);
  if (req.body.searchId === undefined) {
    res.status(400).json({ error: "Missing search id" });
  } else if (user.error) {
    res.status(401).json({ error: "Invalid token" });
  } else {
    db("searches")
      .where({ id: req.body.searchId })
      .del()
      .then(deleted => {
        if (deleted === 0) {
          res.status(404).json({ error: "Search record not found" });
        } else {
          res.status(200).json({ message: "Record deleted" });
        }
      })
      .catch(err => console.error(err));
  }
});

server.put("/update", (req, res) => {
  const user = decodeToken(req.body.token);
  if (req.body.searchId === undefined) {
    res.status(400).json({ error: "Missing search id" });
  } else if (user.error) {
    res.status(401).json({ error: "Invalid token" });
  } else {
    db("searches")
      .where({ id: req.body.searchId })
      .first()
      .then(record => {
        if (record === undefined) {
          res.status(404).json({ error: "Requested record not found" });
        } else if (user.id === record.user_id) {
          axios
            .post(url, { Player: record.player_name })
            .then(updated => {
              db("searches")
                .where({ id: req.body.searchId })
                .update({ stats: updated }, ["id"])
                .then(updated => {
                  if (updated === 1) {
                    res.status(200).json({
                      message: "Record updated",
                      record: updated
                    });
                  } else {
                    res.status(404).json({ error: "Search record not found" });
                  }
                })
                .catch(err => console.error(err));
            })
            .catch(err => console.error(err));
        } else {
          res
            .status(401)
            .json({ error: "You are not authorized to alter that record" });
        }
      })
      .catch(err => console.error(err));
  }
});

server.listen(server.get("port"), () => {
  console.log("=== Listening on port", server.get("port"), " ===");
});
