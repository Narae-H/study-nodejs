/**
 * app.js: 애플리케이션 설정
 * 역할: 
 *  - 미들웨어, 라우터, 에러처리 등 애플리케이션의 핵심 로직을 정의
 *  - 실제 HTTP 요청을 처리하는 중추적인 역할
 * 책임범위:
 *  - Express 인스턴스 생성
 *  - 요청/응답 처리 담당
 *  - 미들웨어 설정 ex) ex. express.json()
 *  - 라우터 추가
 *  - 에러 핸들러 설정
 */

const express = require('express');                   // express library
const path = require('path');
const methodOverride = require('method-override');    // HTTP methods
const session = require('express-session');           // login: session management middleware
const MongoStore = require('connect-mongo');          // Automatically save login info to db
const { S3Client } = require('@aws-sdk/client-s3');   // AWS JavaScript library
const multer = require('multer');                     // Image upload middleware
const multerS3 = require('multer-s3');                // Connect between Multer and AWS
const passport = require('./config/possport');
const config = require('./config/config');
const app = express();
const sessionMiddleware = require('./middlewares/sessionMiddleware');

// Passport configuration
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : 60 * 60 * 1000 }, // 1시간
  store: MongoStore.create({
    mongoUrl : config.mongo.url,
    dbName: 'forum',
  })
}));
app.use(passport.initialize());
app.use(passport.session()); 
app.use(sessionMiddleware);

// Set static folders
app.use(express.static(__dirname + '/public')); // Static folders
app.use(express.json());                        // req.body
app.use(express.urlencoded({extended:true}));   // req.body
app.use(methodOverride('_method'));

// Set template engine
app.set('view engine', 'ejs'); // EJS
app.set('views', path.join(__dirname, 'views')); // __dirname은 현재 디렉토리 경로

// Configure multer for S3
// [ ] s3 부분도 config 폴더 아래로 따로 빼야하지 않을까?
const s3 = new S3Client({
  region: config.s3.region,
  credentials: {
      accessKeyId: config.s3.key,
      secretAccessKey: config.s3.secret
  }

});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.s3.bucket,
    // bucket: process.env.S3_BUCKET,
    key: function (요청, file, cb) {
      cb(null, `${Date.now().toString()}_${file.originalname}`) // 업로드시 파일명
    }
  })
});


// Routing
const routes = require('./routes');
app.use('/', routes);

// [ ] send back a 404 error for any unknown api request
// app.use((req, res, next) => {
//   next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
// });

// [ ] convert error to ApiError, if needed
// app.use(errorConverter);

// [ ] handle error
// app.use(errorHandler);

module.exports = app;