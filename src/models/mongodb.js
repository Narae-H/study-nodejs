
const { MongoClient } = require('mongodb');
const config = require('./../config/config');

const url = config.mongo.url;
// const url = process.env.DB_URL;
let connectDB = new MongoClient(url).connect();

// 2. DB 연결부분 export
module.exports = connectDB; 