const router = require('express').Router();

const checkLogin = (req, res, next) => {
  if( req.isAuthenticated() ) {
    next();
  } else {
    res.redirect("/login");
  }
}

router.get('/sub/sports', checkLogin, (요청, 응답) => {
  응답.send('스포츠 게시판')
});
router.get('/sub/game', checkLogin, (요청, 응답) => {
  응답.send('게임 게시판')
});

module.exports = router; 