// 1. Import router
const router = require('express').Router();
const { ObjectId } = require('mongodb'); // DB
const { isLoggedIn } = require('./../middlewares/authMiddleware.js');

// 2. Import DB
const connectDB = require('./../models/mongodb.js');
let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum').collection('chatroom');
}).catch((err)=>{
  console.log(err)
}); 

// 3. Middleware


// 4. Router
// Create a chatroom
router.get("/request", (req, res) => {
  console.log(req.user._id);
  console.log(req.query.writerId);
  
  db.insertOne({ 
    member: [req.user._id, new ObjectId(req.query.writerId)],
    date: new Date(),
    // postId: new ObjectId(req.params.id)
  });
  res.redirect("/chat/myChatList");
});

// Chat list
router.get('/myChatList', isLoggedIn, async (req, res) => {
  let chatlist = await db.find({ 
    member: req.user._id 
  }).toArray();

  res.render("chatlist.ejs", {chatlist: chatlist});
});

// Details of a chat
router.get("/detail/:id", isLoggedIn, async (req, res)=> {
  let chatDetail = await db.findOne({
    _id: new ObjectId(req.params.id)
  });

  res.render("chatDetail.ejs", {chatDetail: chatDetail});
});

module.exports = router; 