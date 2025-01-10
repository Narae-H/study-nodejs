// 1. Settings
// 1-1. Import modules
const express = require('express');                   // express library
const methodOverride = require('method-override');    // HTTP methods
const { MongoClient, ObjectId } = require('mongodb'); // DB
const session = require('express-session');           // login: session management middleware
const passport = require('passport');                 // login: authentication middleware
const LocalStrategy = require('passport-local');      // login: local strategy

// 1-2. Create an Express instance
const app = express();

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
  // cookie : { maxAge : 60 * 60 * 1000 } // 1시간
}))
app.use(passport.initialize())
app.use(passport.session()); 

// Passport authentication strategy
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }
  if (result.password == 입력한비번) {
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

// 1-5. Set template engine
app.set('view engine', 'ejs'); // EJS

// 2. DB connection
let db
const url = 'mongodb+srv://@cluster0.tuq6e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('Successfully DB connected')
  db = client.db('forum')
  
  // Run a server
  app.listen(8080, () => {
      console.log('Server is running on http://localhost:8080');
  })
}).catch((err)=>{
  console.log(err);
});


// 3. Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.get("/list", async (req, res) => {
  let result = await db.collection('post').find().toArray();
  res.render('list.ejs', {글목록: result});
})

// skip() && limit() 사용
app.get("/list/:page", async (req, res) => {
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
  res.render('write.ejs');
})

// Insert data
app.post("/add", async (req, res) => {
  try {
    if( req.body.title == '') {
      res.send("No title!");
    } else {
      // 1. Insert the data into the DB
      await db.collection('post').insertOne(req.body);
    
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
      res.render("detail.ejs", result);
    }
    
  } catch(e) {
    res.status(404).send('Undefined URL');
  }
})

app.get("/edit/:id", async (req, res) => {
  // 1. Find data from DB
  let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});
  
  // 2. Render
  res.render("edit.ejs", result);
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
  await db.collection('post').deleteOne(
    { _id: new ObjectId(req.body._id) }
  )

  res.send("삭제완료");
})

app.get("/login", (req, res) => {
  res.render("login.ejs");
})

app.post("/login", async (req, res, next) =>{
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
  console.log(req.session);
  console.log(req.isAuthenticated())

  if( req.isAuthenticated() ) {
    res.render("mypage.ejs", {user: req.user});
  } else {
    res.redirect("/login")
  }

});