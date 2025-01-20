// 1. Import router
const router = require('express').Router();
// const { ObjectId } = require('mongodb'); // DB

// 2. Import DB
const connectDB = require('../models/mongodb.js');
let db
connectDB.then((client)=>{
  db = client.db('forum').collection('post');
}).catch((err)=>{
  console.log(err)
}); 


// 3. Middleware
const isLoggedin = (req, res, next) => {
  if( req.isAuthenticated() ) {
    next();
  } else {
    res.redirect("/login");
  }
}


// 4. Router
// Posts list
router.get('/', async (req, res) => {
  let result = await db.find().toArray();
  res.render('list.ejs', {글목록: result, user: req.user});
});

// search index를 활용한 검색
router.get('/search', async (req, res)=>{
  let searchOption = [
    {$search: {
      index: "title_index",
      text: { query: req.query.searchTerm, path: { wildcard: "*" }}
    }}
  ]

  let result = await db.aggregate(searchOption).toArray();
  res.render("list.ejs", {글목록: result, user: req.user});
});

// skip() && limit() 사용
router.get("/:page", async (req, res) => {
  const page = req.params.page;
  const pageSize = 5;
  
  let result = await db.find().skip((page-1)*pageSize).limit(pageSize).toArray();
  res.render('list.ejs', {글목록: result, user: req.user});
});

// find(이전의 아이디) && limit() 사용
router.get("/next/:page", async (req, res) => {
  const page = req.params.page;
  const pageSize = 5;

  let result = await db.find().skip((page-1)*pageSize).limit(pageSize).toArray();
  res.render('list.ejs', {글목록: result, user: req.user});
})

// 게시글 작성 페이지로 이동
router.get("/write", isLoggedin, (req, res) => {
  console.log('1111');
  res.render('write.ejs', {user: req.user});
});


module.exports = router; 