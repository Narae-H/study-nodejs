// 1. Settings
// 1-1. Import modules
const express = require('express');                   // express library
const methodOverride = require('method-override');    // HTTP methods
const { MongoClient, ObjectId } = require('mongodb'); // DB
const session = require('express-session');           // login: session management middleware
const passport = require('passport');                 // login: authentication middleware
const LocalStrategy = require('passport-local');      // login: local strategy
const bcrypt = require('bcrypt');                     // password encryption
const MongoStore = require('connect-mongo');          // Automatically save login info to db
require('dotenv').config();                           // Environment variable
const { S3Client } = require('@aws-sdk/client-s3');   // AWS JavaScript library
const multer = require('multer');                     // Image upload middleware
const multerS3 = require('multer-s3');                // Connect between Multer and AWS

// 1-2. Create an Express instance
const app = express();

// websocket
// TODO
// [ ]: websocket 부분 다른 파일로 분리하기
// [ ]: require('http'), createServer(app) 부분을 다른파일로 분리할지 여기둘지 고민
const { createServer } = require('http');
const { Server } = require('socket.io');
const server = createServer(app);
const io = new Server(server);

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// 1-3. custom middleware
// const today = (req, res, next) => {
//   console.log( new Date() );
//   next();
// }

// const isLoggedin = (req, res, next) => {
//   if( req.isAuthenticated() ) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// }

// const userNullCheck = (req, res, next) => {
//   console.log( req.body );
//   if( !req.body.username.trim() || !req.body.password.trim() ) {
//     res.send("아이디 또는 비번은 필수값입니다");
//   } else {
//     next();
//   }
// }

// 1-3. Set global middleware
app.use(express.static(__dirname + '/public')); // Static folders
app.use(express.json());                        // req.body
app.use(express.urlencoded({extended:true}));   // req.body
app.use(methodOverride('_method'));

// 1-4. passport library setting
// session settings
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : 60 * 60 * 1000 }, // 1시간
  store: MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName: 'forum',
  })
}))
app.use(passport.initialize());
app.use(passport.session()); 

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

// When login is successful, save the data to the session
passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username }); 
  })
});

// After succeefully loggedin, every time a user makes a request to the server
passport.deserializeUser( async (user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password; // 비밀번호는 보안상 삭제

  process.nextTick(() => {
    return done(null, result); // 쿠키 이상 없으면 유저 정보 반환
  })
});

// 1-6. Setting for file upload
// Set AWS S3
const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
      accessKeyId: process.env.S3_KEY,
      secretAccessKey: process.env.S3_SECRET
  }
});

// Multer-S3 설정
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    key: function (요청, file, cb) {
      cb(null, `${Date.now().toString()}_${file.originalname}`) // 업로드시 파일명
    }
  })
})

// 1-7. Set template engine
app.set('view engine', 'ejs'); // EJS

// 2. DB connection
let connectDB = require('./models/mongodb');
let db
connectDB.then((client)=>{
  console.log('Successfully DB connected');
  db = client.db('forum');
  
  // Run a server
  server.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
  })
}).catch((err)=>{
  console.log(err);
});

// let db
// new MongoClient(process.env.DB_URL).connect().then((client)=>{
//   console.log('Successfully DB connected')
//   db = client.db('forum')
  
//   // Run a server
//   server.listen(process.env.PORT, () => {
//       console.log(`Server is running on http://localhost:${process.env.PORT}`);
//   })
// }).catch((err)=>{
//   console.log(err);
// });


// 3. Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});


io.on('connection', (socket) => {
  const user = socket.request.session.passport?.user;

  // 1. 클라이언트 -> 서버
  // 클라이언트가 'msg'라는 이름으로 보낸 데이터 수신
  socket.on('msg', (data) => {
    console.log('유저가 보낸거 : ', data);
  });

  // 2. 서버 -> 클라이언트
  // 서버가 'name'이라는 데이터 전송
  io.emit('name', 'Kim'); 

  // 3. 룸 조인
  // 누군가 'ask-join'이라는 이름으로 메세지 보내면 룸에 조인시켜줌.
  socket.on('ask-join', (data) => {
    if( user.id == data.userId) {
      socket.join(data.room);
    } else {
      console.log('잘못된 요청입니다');
    }
  }); 

  // 4. 클라이언트 -> 서버의 특정 룸에서만 데이터 전달
  socket.on('message', (data) => {
    // to(): 특정 룸에만 메시지 전달

    // db에 채팅내용 저장하기
    // 채팅내용, 날짜, 부모 document id, 작성자
    io.to( data.room ).emit( 'broadcast', data.msg );
  })
})

// app.use("/board", require("./routes/boardRoutes"));

app.use("/posts", require("./routes/postsRoutes"));
app.use("/chat", require("./routes/chatRoutes"));
app.use("/users", require("./routes/usersRoutes"));