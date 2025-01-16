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
const { red } = require('gulp-cli/lib/shared/ansi');

// 1-2. Create an Express instance
const app = express();

// 1-3. custom middleware
const today = (req, res, next) => {
  console.log( new Date() );
  next();
}

const userNullCheck = (req, res, next) => {
  console.log( req.body );
  if( !req.body.username.trim() || !req.body.password.trim() ) {
    res.send("아이디 또는 비번은 필수값입니다");
  } else {
    next();
  }
}

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
app.use(passport.initialize())
app.use(passport.session()); 

// Passport authentication strategy
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디});

  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }

  if (await bcrypt.compare(입력한비번, result.password)) {
    return cb(null, result); // 로그인 성공
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}));

// When login is successful, save the data to the session
passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username }); 
  })
})

// After succeefully loggedin, every time a user makes a request to the server
passport.deserializeUser( async (user, done) => {
  console.log("deserializeUser!!!");
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password; // 비밀번호는 보안상 삭제

  process.nextTick(() => {
    return done(null, result); // 쿠키 이상 없으면 유저 정보 반환
  })
})

// Set custom middleware by router
app.use('/list', today);

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
let db
new MongoClient(process.env.DB_URL).connect().then((client)=>{
  console.log('Successfully DB connected')
  db = client.db('forum')
  
  // Run a server
  app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
  })
}).catch((err)=>{
  console.log(err);
});


// 3. Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.get("/list", async (req, res) => {
  console.log("111");
  let result = await db.collection('post').find().toArray();
  console.log(result[12].user);
  console.log(req.user._id);
  console.log("-------------");

  res.render('list.ejs', {글목록: result, user: req.user});
})

// search index를 활용한 검색
app.get("/list/search", async (req, res)=>{
  let searchOption = [
    {$search: {
      index: "title_index",
      text: { query: req.query.searchTerm, path: { wildcard: "*" }}
    }}
  ]

  let result = await db.collection("post").aggregate(searchOption).toArray();
  res.render("list.ejs", {글목록: result});
});

// 그냥검색
// app.post("/list/search", async (req, res)=>{
//   let result = await db.collection("post").find({ title : { $regex: req.body.searchTerm} } ).toArray();
//   res.render("list.ejs", {글목록: result});
// });

// skip() && limit() 사용
app.get("/list/:page", async (req, res) => {
  console.log("222");
  const page = req.params.page;
  const pageSize = 5;
  
  let result = await db.collection('post').find().skip((page-1)*pageSize).limit(pageSize).toArray();
  res.render('list.ejs', {글목록: result});
})

// find(이전의 아이디) && limit() 사용
app.get("/list/next/:page", async (req, res) => {
  const page = req.params.page;
  const pageSize = 5;

  let result = await db.collection('post').find().skip((page-1)*pageSize).limit(pageSize).toArray();
  res.render('list.ejs', {글목록: result});
})

app.get("/write", (req, res) => {
  if( req.isAuthenticated() ) {
    res.render('write.ejs', {user: req.user});
  } else {
    res.redirect("/login")
  }
})

// Insert data
app.post("/add", upload.single("img1"), async (req, res) => {
  try {
    if( req.body.title == '') {
      res.send("No title!");
    } else {
      // 1. Insert the data into the DB
      await db.collection('post').insertOne({
        title: req.body.title,
        content: req.body.content,
        img: req.file? req.file.location : '',
        user: req.user._id,
        username: req.user.username // RDB와 다르게 user, username 전부 다 저장
      });
    
      // 2. Handing Request 
      res.redirect('/list'); // redirect
    }
  } catch(e) {
    console.log(e);
    res.status(500).send('Server error!');
  }
})

app.get("/detail/:id", async (req, res) => {
  try {
    // 1. Get URL parameter
    let id = req.params.id;

    // 2. Find data from DB
    let result = await db.collection('post').findOne({_id: new ObjectId(id)});
    
    // 3. Rendering
    if( result == null) {
      res.status(404).send("The item doesn't exsit");
    } else {
      let reformData = {
        title: result.title,
        content: result.content, 
        imgURL: result.imgURL
      }
      res.render("detail.ejs", reformData);
    }
    
  } catch(e) {
    res.status(404).send('Undefined URL');
  }
})

app.get("/edit/:id", async (req, res) => {
  // 1. Find data from DB
  let result = await db.collection('post').findOne(
    { _id: new ObjectId(req.params.id),
      user: req.user? new ObjectId(req.user._id) : ""
    }
  );

  // 2. Render
  if( req.user && result) {
    res.render("edit.ejs", result);
  } else {
    res.send("수정할 수 없는 게시물입니다");
  }
})

// Update data
// app.post("/edit/:id", async (res, req) => {
  //   // 1. Update
  //   await db.collection('post').updateOne({_id: new ObjectId(res.params.id)}, {$set: res.body});
  
  //   // 2. Render
  //   req.redirect("list.ejs");
// })

// Update data
app.put("/edit/:id", async (req, res) => {
  // 1. Update
  const post = await db.collection('post').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: {
      title: req.body.title,
      content: req.body.content
    } }
  );
  
  // 2. Render
  res.redirect("/list");
})

// delete
app.delete("/delete", async (req, res)=> {

  const result = await db.collection('post').deleteOne(
    { _id: new ObjectId(req.body._id)
      ,user: req.user? new ObjectId(req.user._id) : ""
     }
  )

  res.send(result);
})

app.get("/login", (req, res) => {
  res.render("login.ejs");
})

app.post("/login", userNullCheck, async (req, res, next) =>{
  passport.authenticate('local', (error, user, info) => {
    if(error) return res.status(500).json(error);
    if(!user) return res.status(401).json(info.message);
    
    //로그인
    req.login(user, (err) => {
       
      if(err) return next(err);
      res.redirect('/'); 
    })
  })(req, res, next);
});

app.get("/mypage", (req, res)=>{
  if( req.isAuthenticated() ) {
    res.render("mypage.ejs", {user: req.user});
  } else {
    res.redirect("/login")
  }

});

// Join
app.get("/register", (req, res)=> {
  res.render("register.ejs");
}) 

// Join
app.post("/register", userNullCheck, async (req, res) => {
  console.log(req.body);
  if( !req.body.username.trim() || !req.body.password.trim() ) {
     return res.send("Username 또는 password를 입력해주세요");
  }

  let result = await db.collection('user').findOne({ username : req.body.username});
  if( result ) {
    return res.send("중복된 유저가 있습니다. 새로운 username을 입력해주세요");
  }

  if( req.body.password != req.body.password1 ) {
    return res.send("비밀번호가 일치하지않습니다. 다시 확인해주세요");
  }

  let hashedPW = await bcrypt.hash(req.body.password, 10);
  await db.collection("user").insertOne({
    username: req.body.username, 
    password: hashedPW
  });

  res.redirect("/login");
});

app.use("/board", require("./routes/boardRoutes"));