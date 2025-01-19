// 1. Import router
const router = require('express').Router();

// 2. Import DB
const connectDB = require('./../models/mongodb.js');
let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum');
}).catch((err)=>{
  console.log(err)
}); 

// 3. Router
// Create a chatroom
router.get("/:id", (req, res) => {
  console.log( '채팅방이 생성되었습니다' );
  console.log( req.params.id );

  res.send("채팅방");
})

// Chat list
router.get('/myChatList', (res, req) => {
  res.send('내가 속한 채팅방 목록');
});

module.exports = router; 