// 1. Import router
const router = require('express').Router();
const passport = require('passport'); // login: authentication middleware
const bcrypt = require('bcrypt');     // password encryption

const { userNullCheck } = require('./../middlewares/validationMiddleware.js');
const { isLoggedIn } = require('./../middlewares/authMiddleware.js');


// 2. Import DB
const connectDB = require('../models/mongodb.js');
let userCollection
connectDB.then((client)=>{
  userCollection = client.db('forum').collection('user');
}).catch((err)=>{
  console.log(err)
}); 


// 3. Router

// 로그인 페이지로 이동
router.get("/login", (req, res) => {
  res.render("login.ejs");
});

// 서버로 로그인 데이터 제출
router.post("/login", userNullCheck, async (req, res, next) =>{
  passport.authenticate('local', (error, user, info) => {
    if(error) return res.status(500).json(error);
    if(!user) return res.status(401).json(info.message);
    
    //로그인
    req.login(user, (err) => {
       
      if(err) return next(err);
      res.redirect('/posts'); 
    })
  })(req, res, next);
});

// 회원가입 페이지로 이동
// Join
router.get("/signup", (req, res)=> {
  res.render("signup.ejs");
});

// 회원가입
router.post("/signup", userNullCheck, async (req, res) => {
  let user = await userCollection.findOne({ username : req.body.username});
  if( user ) {
    return res.send("중복된 유저가 있습니다. 새로운 username을 입력해주세요");
  }

  if( req.body.password != req.body.password1 ) {
    return res.send("비밀번호가 일치하지않습니다. 다시 확인해주세요");
  }

  let hashedPW = await bcrypt.hash(req.body.password, 10);
  await userCollection.insertOne({
    username: req.body.username, 
    password: hashedPW
  });

  res.redirect("/users/mypage");
});

// 마이페이지로 이동
router.get("/mypage", isLoggedIn, (req, res)=>{
  res.render("mypage.ejs", {user: req.user});
});


module.exports = router; 