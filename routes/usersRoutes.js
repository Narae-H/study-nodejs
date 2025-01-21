// 1. Import router
const router = require('express').Router();
const { ObjectId } = require('mongodb'); // DB

// 2. Import DB
const connectDB = require('../models/mongodb.js');
let userCollection
connectDB.then((client)=>{
  userCollection = client.db('forum').collection('user');
}).catch((err)=>{
  console.log(err)
}); 

// 3. Middleware


// 4. Router

module.exports = router; 