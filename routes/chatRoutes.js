const router = require('express').Router();

// 채팅방 생성
router.get("/:id", (req, res) => {
  console.log( '채팅방이 생성되었습니다' );
  console.log( req.params.id );

  res.send("채팅방");
})

// 내가 속한 채팅방 목록
router.get('/myChatList', (res, req) => {
  res.send('내가 속한 채팅방 목록');
});

module.exports = router; 