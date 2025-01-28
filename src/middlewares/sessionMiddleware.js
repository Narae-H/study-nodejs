const session = require('express-session');           // login: session management middleware

// websocket
const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});

module.exports = sessionMiddleware;