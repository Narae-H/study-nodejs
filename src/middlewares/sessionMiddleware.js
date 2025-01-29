/**
 * sessionMiddleware.js: 세션관리
 * 역할:
 *  - 사용자 세션을 관리하는 미들웨어 실행
 *  - 세션데이터를 서버가 아닌 DB에 저장하여 지속성 유지
 *  - 사용자 로그인 상태를 유지 및 관리
 * 책임범위:
 *  - 세션 생성 및 관리
 *  - 세션을 MonogoDB에 저장: 서버가 재시작되어도 로그인 정보 유지
 *  - 세션 보안 설정
 */
const session = require('express-session');  // login: session management middleware
const MongoStore = require('connect-mongo'); // Automatically save login info to db
const config = require('./config/config');

const sessionMiddleware = session({
  secret: 'ThisIsSecretChangeIt',
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : 60 * 60 * 1000 }, // 1시간
  store: MongoStore.create({
    mongoUrl : config.mongo.url,
    dbName: 'forum',
  })
});

module.exports = sessionMiddleware;