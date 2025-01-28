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

const { createServer } = require('http');
const { initializeWebSocket } = require('./src/services/websoket');

// 1-2. Create an Express instance
const app = express();
const server = createServer(app);
const io = initializeWebSocket(server);

// websocket
const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

// Set static folders
app.use(express.static(__dirname + '/public')); // Static folders
app.use(express.json());                        // req.body
app.use(express.urlencoded({extended:true}));   // req.body
app.use(methodOverride('_method'));

// passport library
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
let connectDB = require('./src/models/mongodb');
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

// 3. Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.use("/posts", require("./src/routes/postsRoutes"));
app.use("/chat", require("./src/routes/chatRoutes"));
app.use("/users", require("./src/routes/usersRoutes"));