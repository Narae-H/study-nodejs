const express = require('express');

const postsRoutes = require('./postsRoutes');
const chatRoutes = require('./chatRoutes');
const usersRoutes = require('./usersRoutes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/posts',
    route: postsRoutes,
  },
  {
    path: '/chat',
    route: chatRoutes,
  },
  {
    path: '/users',
    route: usersRoutes,
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;