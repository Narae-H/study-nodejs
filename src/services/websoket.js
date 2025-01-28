// 1. Import modules
const { Server } = require('socket.io');
let io; 

const initializeWebSocket = (server) => {
  io = new Server(server);

  io.on('connection', (socket) => {
    const user = socket.request.session.passport?.user;
  
    // 클라이언트 -> 서버: 클라이언트가 'msg'라는 이름으로 보낸 데이터 수신
    socket.on('msg', (data) => {
      console.log('유저가 보낸거 : ', data);
    });
  
    // 서버 -> 클라이언트: 서버가 'name'이라는 데이터 전송
    io.emit('name', 'Kim'); 
  
    // 룸 조인: 누군가 'ask-join'이라는 이름으로 메세지 보내면 룸에 조인시켜줌
    socket.on('ask-join', (data) => {
      if( user.id == data.userId) {
        socket.join(data.room);
      } else {
        console.log('잘못된 요청입니다');
      }
    }); 
  
    // 클라이언트 -> 서버: 특정 룸에서만 데이터 전달
    socket.on('message', (data) => {
      // to(): 특정 룸에만 메시지 전달
  
      // db에 채팅내용 저장하기
      // 채팅내용, 날짜, 부모 document id, 작성자
      io.to( data.room ).emit( 'broadcast', data.msg );
    })
  });

  return io;
};

const getWebSocketInstance = () => {
  if (!io) {
    throw new Error('WebSocket has not been initialized!');
  }
  return io;
};

module.exports = { initializeWebSocket, getWebSocketInstance };