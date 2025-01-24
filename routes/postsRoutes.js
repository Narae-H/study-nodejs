// 1. Import router
const router = require('express').Router();
const { ObjectId } = require('mongodb');    // DB
const { isLoggedIn } = require('./../middlewares/authMiddleware.js');

// 2. Import DB
const connectDB = require('../models/mongodb.js');
let postCollection, commentCollection;
connectDB.then((client)=>{
  postCollection = client.db('forum').collection('post');
  commentCollection = client.db('forum').collection('comment');
}).catch((err)=>{
  console.log(err)
}); 


// 3. Middleware


// 4. Router
// Posts list
router.get('/', async (req, res) => {
  const pageSize = 5;
  const { page } = req.query;
  let posts;

  if( page ) {
    // 페이지네이션 방법 1.
    // skip() && limit(): skip()은 성능 이슈가 있음. 100만 이상의 숫자를 넣으면 엄청 오래걸림.
    posts = await postCollection.find().skip((page-1)*pageSize).limit(pageSize).toArray();

    // 페이지네이션 방법 2.
    // find(조건) && limit(): skip()을 안써서 속도는 빠르나, 이전 페이지 다음페이지만 가져올 수 있음.
    // await postCollection.find({_id : {$gt : 방금본 마지막게시물_id}}).limit(pageSize).toArray(); 
  } else {
    posts = await postCollection.find().toArray();
  }

  res.render('list.ejs', {글목록: posts, user: req.user});
});

// 게시글 작성
router.post('', async (req, res) => {
// 나중에 이미지 업로드 되는 부분 모듈 import하고 수정해야 함.
// router.post('', upload.single('img1'), async (req, res) => {
  try {
    if( req.body.title == '') {
      res.send("No title!");
    } else {
      // 1. Insert the data into the DB
      await postCollection.insertOne({
        title: req.body.title,
        content: req.body.content,
        img: req.file? req.file.location : '',
        user: req.user._id,
        username: req.user.username // RDB와 다르게 user, username 전부 다 저장
      });
    
      // 2. Handing Request 
      res.redirect('/posts'); // redirect
    }
  } catch(e) {
    console.log(e);
    res.status(500).send('Server error!');
  }
});

// 게시글 작성 페이지로 이동
router.get('/write', isLoggedIn, (req, res) => {
  res.render('write.ejs', {user: req.user});
});

// search index를 활용한 검색
router.get('/search', async (req, res)=>{
  let searchOption = [
    {$search: {
      index: "title_index",
      text: { query: req.query.searchTerm, path: { wildcard: "*" }}
    }}
  ]

  let result = await postCollection.aggregate(searchOption).toArray();
  res.render("list.ejs", {글목록: result, user: req.user});
});

// 특정 게시물 조회
router.get("/:id", async (req, res) => {
  try {
    // 1. Get URL parameter
    const { id } = req.params;
    console.log(id);

    // 2. Find data from DB
    let post = await postCollection.findOne({_id: new ObjectId(id)});
    let commentList = await commentCollection.find( { postId: id }).toArray();
    
    // 3. Rendering
    if( post ) {
      let postData = {
        _id: post._id,
        title: post.title,
        content: post.content,
        imgURL: post.imgURL,
        postId: id, 
        userId: post.user,
        username: post.username
      }
      res.render("detail.ejs", {postData: postData, commentList: commentList});
    } else {
      res.status(404).send("The item doesn't exsit");
    }
    
  } catch(e) {
    console.log(e);
    res.status(404).send('Undefined URL');
  }
});

// 댓글 
// 생성: POST /posts/:postId/comments
// 조회: GET /posts/:postId/comments
// 수정: PUT /posts/:postId/comments/:commentId
// 삭제: DELETE /posts/:postId/comments/:commentId
router.post("/:postId/comments", async (req, res) => {
  try {
    await commentCollection.insertOne({
      postId: req.params.postId,
      userId: req.user._id,
      username: req.user.username,
      comment: req.body.comment,
      date: new Date()
    })
    res.redirect("back");

  } catch (e) {
    console.log(e);
    res.status(500).send("failed");
  }
});

// 수정페이지로 이동
router.get("/:id/edit", async (req, res) => {
  // 1. Find data from DB
  let post = await postCollection.findOne(
    { _id: new ObjectId(req.params.id),
      user: req.user? new ObjectId(req.user._id) : ""
    }
  );

  // 2. Render
  if( req.user && post ) {
    res.render('edit.ejs', post);
  } else {
    res.send("수정할 수 없는 게시물입니다");
  }
});

// 특정 게시글 수정
router.put('/:id', async (req, res) => {
  // 1. Update
  const post = await postCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: {
      title: req.body.title,
      content: req.body.content
    } }
  );
  
  // 2. Render
  res.redirect('/posts');
});

// 특정 게시물 삭제
router.delete('/', async (req, res)=> {
  const result = await postCollection.deleteOne(
    { _id: new ObjectId(req.body._id)
      ,user: req.user? new ObjectId(req.user._id) : ''
     }
  )
  res.send(result);
})

module.exports = router; 