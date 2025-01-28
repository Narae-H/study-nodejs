const passport = require('passport');                 // login: authentication middleware
const LocalStrategy = require('passport-local');      // login: local strategy
const { ObjectId } = require('mongodb');              // DB
const bcrypt = require('bcrypt');                     // password encryption

// DB
const connectDB = require('./../models/mongodb.js');
let db;
connectDB.then((client)=>{
  db = client.db('forum');
}).catch((err)=>{
  console.log(err)
}); 


// LocalStrategy 설정: 아이디/비번이 DB와 일치하는지 전략을 생성하는 객체
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let user = await db.collection('user').findOne({ username : 입력한아이디})
  if ( !user ) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }

  // bcrypt.compare()를 이용하여 입력한비번과 db의 비번을 비교
  if ( await bcrypt.compare(입력한비번, user.password)) {
    return cb(null, user); // 로그인 성공
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}));
passport.serializeUser((user, done) => { // When login is successful, save the data to the session
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username }); 
  })
});
passport.deserializeUser( async (user, done) => { // After succeefully loggedin, every time a user makes a request to the server
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password; // 비밀번호는 보안상 삭제

  process.nextTick(() => {
    return done(null, result); // 쿠키 이상 없으면 유저 정보 반환
  })
});

module.exports = passport;