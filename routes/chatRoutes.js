// 1. Import router
const router = require('express').Router();
const { ObjectId } = require('mongodb'); // DB

// 2. Import DB
const connectDB = require('./../models/mongodb.js');
let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  // db = client.db('forum');
  db = client.db('forum').collection('chatroom');
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
// Create a chatroom
router.get("/request", (req, res) => {
  // db.collection('chatroom').insertOne({ 
  db.insertOne({ 
    member: [req.user._id, new ObjectId(req.query.writerId)],
    date: new Date(),
    // postId: new ObjectId(req.params.id)
  });
  res.redirect("/chat/myChatList");
});

// Chat list
router.get('/myChatList', isLoggedin, async (req, res) => {
  let chatlist = await db.find({ 
  // let chatlist = await db.collection('chatroom').find({ 
    member: req.user._id 
  }).toArray();

  res.render("chatlist.ejs", {chatlist: chatlist});
});

// Details of a chat
router.get("/detail/:id", isLoggedin, async (req, res)=> {
  let chatDetail = await db.findOne({
  // let chatDetail = await db.collection('chatroom').findOne({
    _id: new ObjectId(req.params.id)
  });

  res.render("chatDetail.ejs", {chatDetail: chatDetail});
});

module.exports = router; 