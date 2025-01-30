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

const express = require('express');                  
const path = require('path');
const methodOverride = require('method-override');
const passport = require('./config/passportConfig');
const sessionMiddleware = require('./middlewares/sessionMiddleware');

const app = express();

// HTTP requets
app.use(express.json());                        // req.body
app.use(express.urlencoded({extended:true}));   // req.body
app.use(methodOverride('_method'));             // HTTP methods 

// Login (session, authentication)
app.use(sessionMiddleware);     // initialize session 
app.use(passport.initialize()); // initialize passport
app.use(passport.session());    // use the session in the passport

// Static folders
app.use(express.static(__dirname + '/public'));

// Template engine
app.set('view engine', 'ejs'); // EJS
app.set('views', path.join(__dirname, 'views')); // __dirname은 현재 디렉토리 경로

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