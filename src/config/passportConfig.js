/**
 * passportConfig.js: 사용자 인증(Authentication)
 * 역할:
 *  - 사용자 인증 처리: 로그인 시 사용자가 입력한 아이디와 비밀번호를 확인하고, 올바르면 인증 진행
 *  - 세션관리: 사용자가 로그인에 성공하면 세션을 통해 인증상태를 유지하고, 세션에서 사용자 정보를 복원
 *  - 비밀번호 보안: 비밀번호를 암호화
 * 책임범위:
 *  - DB와의 상호작용
 *  - 사용자 로그인 인증
 *  - 세션 관리
 */

const passport = require('passport');                 // login: authentication middleware
const LocalStrategy = require('passport-local');      // login: local strategy
const { ObjectId } = require('mongodb');              // DB
const bcrypt = require('bcrypt');                     // password encryption
const logger = require('./logger.js');

// DB
const connectDB = require('../models/mongodb.js');
let userCollection; 
connectDB.then((client)=>{
  userCollection = client.db('forum').collection('user');
}).catch((err)=>{
  logger.error(err)
}); 

// LocalStrategy
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let user = await userCollection.findOne({ username : 입력한아이디})
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

// Create a session: When the login is successful, save the user's information to the session.
passport.serializeUser((user, done) => { 
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username }); 
  })
});

// Authenticate the session: After successfully logging in, every time a user makes a request to the server, do this process.
passport.deserializeUser( async (user, done) => { 
  let result = await userCollection.findOne({_id : new ObjectId(user.id) })
  delete result.password; // Remove password for security

  process.nextTick(() => {
    return done(null, result); // Return user info after successful authentication
  })
});

module.exports = passport;