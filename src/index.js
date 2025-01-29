/**
 * index.js: 애플리케이션의 진입점(Entry Point)
 * 역할:
 *  - 애플리케이션의 실행을 시작하는 파일로, 서버의 초기화와 실행을 담당.
 *  - 서버의 환경설정, 데이터베이스 연결, 포트 설정, WebSocket 초기화 등을 관리.
 *  - 서버 전체의 큰 그림을 잡는 "조율자" 역할.
 * 책임범위:
 *  - 서버 실행
 *  - 데이터 베이스 연결
 *  - WebSocket 서버 초기화
 *  - app.js에서 설정된 Express 애플리케이션을 가져와 HTTP 서버와 연결
 */

const { createServer } = require('http');
const logger = require('./config/logger.js');
const config = require('./config/config.js');
const app = require('./app.js');
const { initializeWebSocket } = require('./services/websoketService.js'); 
const sessionMiddleware = require('./middlewares/sessionMiddleware.js');

// HTTP 서버 생성
let server= createServer(app);

// WebSocket 서버 초기화
const io = initializeWebSocket(server);
io.engine.use(sessionMiddleware);


let connectDB = require('./models/mongodb');
let db
connectDB.then((client)=>{
  logger.info('Connected to MongoDB');
  db = client.db('forum');
  
  // Run a server
  server.listen(config.port, () => {
    logger.info(`Server is running on http://localhost:${config.port}`); 
  })
}).catch((err)=>{
  logger.error(err);
});
