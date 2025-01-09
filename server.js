// 1. Settings
// 1-1. Import modules
const express = require('express');
const methodOverride = require('method-override');
const { MongoClient, ObjectId } = require('mongodb');

// 1-2. Create an Express instance
const app = express();

// 1-3. Set global middleware
app.use(express.static(__dirname + '/public')); // Static folders
app.use(express.json());                        // req.body
app.use(express.urlencoded({extended:true}));   // req.body
app.use(methodOverride('_method'));

// 1-4. Set template engine
app.set('view engine', 'ejs');                  // EJS

// 2. DB connection
let db
const url = 'mongodb+srv://@cluster0.tuq6e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('Successfully DB connected')
  db = client.db('forum')
  
  // Run a server
  app.listen(8080, () => {
      console.log('Server is running on http://localhost:8080');
  })
}).catch((err)=>{
  console.log(err);
});


// 3. Routing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.get("/list", async (req, res) => {
  let result = await db.collection('post').find().toArray();
  res.render('list.ejs', {글목록: result});
})

// skip() && limit() 사용
app.get("/list/:page", async (req, res) => {
  const page = req.params.page;
  const pageSize = 5;
  
  let result = await db.collection('post').find().skip((page-1)*pageSize).limit(pageSize).toArray();
  res.render('list.ejs', {글목록: result});
})

// find(이전의 아이디) && limit() 사용
app.get("/list/next/:page", async (req, res) => {
  const page = req.params.page;
  const pageSize = 5;

  let result = await db.collection('post').find().skip((page-1)*pageSize).limit(pageSize).toArray();
  res.render('list.ejs', {글목록: result});
})

app.get("/write", (req, res) => {
  res.render('write.ejs');
})

// Insert data
app.post("/add", async (req, res) => {
  try {
    if( req.body.title == '') {
      res.send("No title!");
    } else {
      // 1. Insert the data into the DB
      await db.collection('post').insertOne(req.body);
    
      // 2. Handing Request 
      res.redirect('/list'); // redirect
    }
  } catch(e) {
    console.log(e);
    res.status(500).send('Server error!');
  }
})

app.get("/detail/:id", async (req, res) => {
  try {
    // 1. Get URL parameter
    let id = req.params.id;

    // 2. Find data from DB
    let result = await db.collection('post').findOne({_id: new ObjectId(id)});
    
    // 3. Rendering
    if( result == null) {
      res.status(404).send("The item doesn't exsit");
    } else {
      res.render("detail.ejs", result);
    }
    
  } catch(e) {
    res.status(404).send('Undefined URL');
  }
})

app.get("/edit/:id", async (req, res) => {
  // 1. Find data from DB
  let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)});
  
  // 2. Render
  res.render("edit.ejs", result);
})

// Update data
// app.post("/edit/:id", async (res, req) => {
  //   // 1. Update
  //   await db.collection('post').updateOne({_id: new ObjectId(res.params.id)}, {$set: res.body});
  
  //   // 2. Render
  //   req.redirect("list.ejs");
// })

// Update data
app.put("/edit/:id", async (req, res) => {
  // 1. Update
  const post = await db.collection('post').updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: res.body }
  );
  
  // 2. Render
  res.redirect("/list");
})

// delete
app.delete("/delete", async (req, res)=> {
  await db.collection('post').deleteOne(
    { _id: new ObjectId(req.body._id) }
  )

  res.send("삭제완료");
})