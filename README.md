# Back-End

## [Product Canvas](https://docs.google.com/document/d/1z3BFj_7hLsaiud0UPYfc6-ig1RH5ubZBf_IOrjp3jy0/edit)

---

The url for the back end is <https://nba-predictor-ptbw.herokuapp.com/>

## User routes

### **Register**

Send POST request to `/register` with `{ email: <email>, password: <password> }` in the body.
Successful login returns `{ message: "User created", token: <generated JWT with 1 hr expiration> }`

### **Login**

Send POST request to `/login` with `{ email: <email>, password: <password> }` in the body.
Successful login returns `{ message: "Logged in", token: <generated JWT with 1 hr expiration> }`

## Search routes

### **Add search**

Send POST request to `/search` with `{ player: <player name>, token: <JWT token>}` in the request body. Will return `{ player: <player's name>, id: <id for the record>, stats: <player's stats(includes stats for the nearest matching player)>}`

### **Get searches**

Send POST request to `/history` with `{ token: <JWT token> }` in the request body.
Will return `{ history: [array of search results] }`. Shape of search results is `{ player: <player's name>, id: <id for the record>, stats: <player's stats(includes stats for the nearest matching player)>}`

### **Delete a search record**

Send POST request to `/delete` with `{ token: <JWT token>, searchId: <id number of search record to delete>}`.
Will return `{ message: "Record deleted" }` on success or if given a non existent id will return status 404, `{ error: "Search record not found" }`

### **Update a search record**

Send PUT request to `/update` with `{ token: <JWT token>, searchId: <id number of search record to update>}`.
Will return `{ message: "Record updated", record: <updated search results> }` on success or if given a non existent id will return status 404, `{ error: "Search record not found" }`. Updates player's statistics and nearest matching player.
