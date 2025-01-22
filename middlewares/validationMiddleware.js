// 유저 입력 유효성 검사
const userNullCheck = (req, res, next) => {
  if( req.body.username && req.body.password ) {
    next();
  } else {
    res.send("아이디 또는 비번을 입력해주세요");
  }
};

module.exports = { userNullCheck };