// 로그인 상태 확인
const isLoggedIn = (req, res, next) => {
  if( req.isAuthenticated() ) {
    next();
  } else {
    res.redirect("/login");
  }
};

module.exports = { isLoggedIn };
  