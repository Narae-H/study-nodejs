
// 1. DB 설정
const { MongoClient } = require('mongodb');
const url = process.env.DB_URL;
let connectDB = new MongoClient(url).connect();

// 2. DB 연결부분 export
module.exports = connectDB; 