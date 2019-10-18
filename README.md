# Back-End

## [Product Canvas](https://docs.google.com/document/d/1z3BFj_7hLsaiud0UPYfc6-ig1RH5ubZBf_IOrjp3jy0/edit)

---

## User routes

The url for the back end is <https://nba-predictor-ptbw.herokuapp.com/>

### Register

Send POST request to `/register` with `email` and `password` in the body.
Successful login returns `{ message: "User created", token: <generated JWT with 1 hr expiration> }`

### Login

Send POST request to `/login` with `email` and `password` in the body.
Successful login returns `{ message: "Logged in", token: <generated JWT with 1 hr expiration> }`

## Search routes

### Add search

Send POST request to `/search` with `player` in the request body.
No data is currently available, so for now this will return `player`

### Get searches

Send POST request to `/history` with `{ token: <JWT Token here> }` in the request body.
Will return `{ history: [array of search names] }`
