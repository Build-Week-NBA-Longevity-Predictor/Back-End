# Back-End

## [Product Canvas](https://docs.google.com/document/d/1z3BFj_7hLsaiud0UPYfc6-ig1RH5ubZBf_IOrjp3jy0/edit)

---

## User routes

The url for the back end is <https://nba-predictor-ptbw.herokuapp.com/>

### ... Register

Send POST request to `/register` with `Email` and `Password` in the body.
Successful login returns `{ message: "User created", token: <generated JWT with 1 hr expiration> }`

### ... Login

Send POST request to `/login` with `Email` and `Password` in the body.
Successful login returns `{ message: "Logged in", token: <generated JWT with 1 hr expiration> }`
