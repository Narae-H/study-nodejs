
해당 내용은 [코딩애플🍎](https://codingapple.com/) 수업을 듣고 정리한 글입니다.

# Node.js란?
웹서버를 개발하기 위한 JavaScript 라이브러리
크롬 브라우저에는 구글이 개발한 V8 이라는 자바스크립트 실행엔진이 있는데 하도 성능이 좋아서 독립적인 실행파일로 출시했는데 이게 `Node.js`.

## 사용이유
- 문법 짧고 쉬움
- JavaScript 할 줄 알면 Node.js로 백엔드 서버개발도 쉽게 배울 수 있음.
- Non-blocking I/O : 먼저 요청을 전부 접수하고 빨리완료된 순서대로 처리. (앞순서가 끝날 때까지 대기하는 상황은 blocking)
- Asynchronous(비동기): 요청의 완료여부를 따지지 않고 자신의 다음 작업 수행하여 빠름. 단점은 작업의 순서 보장이 안됨.
- CPU가 많이 사용되는 작업(이미지변환, 동영상압축 등)은 관련라이브러리도 적고 single thread라 성능도 좋지 않아서 무거운 작업보다는 가벼운 작업 여러개에 더 적합.
<br/>

## 설치 및 개발환경 설정
### 1. VS Code 설치
1. [Visual Studio Code](https://code.visualstudio.com/download) 다운로드
2. 설치

### 2. Node.js 설치 및 작업 폴더 생성
1. [Node.js](https://nodejs.org/en/download/current) 다운로드 및 설치
2. 작업용 폴더 생성 및 VS Code에서 열기
3. Node.js 프로젝트 초기화   
    ```sh
    # package.json 파일 자동 생성 및 기본값을 사용하여 프로젝트 정보 초기화
    npm init -y 
    ```
4. 작업용 폴더 안에 `server.js` 생성

### 3. 그 외 필요한 라이브러리 및 모듈 설치
- 라이브러리 및 모듈   

|**라이브러리** |**필수/선택**        | **사용 이유**                     | **설치 방법(터미널)**             |
|-------------|--------------------|----------------------------------|--------------------------------|
| [`Express`](#express)|<center>필수</center>| 웹 애플리케이션 서버 구축을 위한 라이브러리 | npm install express       |
| [`MongoDB`](#mongodb)|<center>필수</center>| 데이터베이스 저장소                      | npm install mongodb@5     |
| [`EJS`](#ejs)|<center>필수</center>| 동적으로 HTML 템플릿을 렌더링하여 데이터 바인딩 | npm install ejs       |
| [`method-override`](#method-override)|<center>필수</center>|  |       |
| [`nodemon`](#nodemon)|<center>선택</center>| 코드 수정시 서버 재시작 없이 반영 | npm install -g nodemon            |
| [`TypeScript`](#typescript)|<center>선택</center>| 타입지정하여 코드 안정성 제공     | npm install typescript --save-dev |


### 4. 최초 `server.js` 코드 셋팅
```js
// 1. Settings
// 1-1. Import modules
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb'); // ObjectId: DB에서 자동 생성되는 id는 ObjectId 타입이므로 id 검색 시 ObjectId 객체 생성 필요
const methodOverride = require('method-override')

// 1-2. Create an Express instance
const app = express();

// 1-3. Set middleware
app.use(express.static(__dirname + '/public')); // Static folders
app.use(express.json());                        // 클라이언트에서 데이터 보내면, req.body로 쉽게 꺼내쓰게 하기
app.use(express.urlencoded({extended:true}));   // application/x-www-form-urlencoded data
app.use(methodOverride('_method'));             // override HTTP method

// 1-4. Set view engine
app.set('view engine', 'ejs'); 

// 1-5. DB connection
let db
const url = 'mongodb+srv://[username]:[password]@cluster0.tuq6e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('Successfully DB connected');
  db = client.db('forum');
  
  // run a server
  app.listen(8080, () => {
      console.log('http://localhost:8080 is running...')
  });
}).catch((err)=>{
  console.log(err);
});


// 2. Routing
app.get('/', (req, res) => {
  res.send("The server is set!");
}); 

```

### 5. 서버 실행
```sh
# nodejs만 설치되어 있을 경우:
node server.js 

## nodemon 설치한 경우:
nodemon server.js
```

<br/>
<br/>

# Express
Node.js에서 Express는 가장 인기 있는 웹 서버 라이브러리 중 하나로, 많은 개발자들이 Express를 사용하여 REST API를 만들거나 웹 애플리케이션을 구축. 

## 설치 및 설정
### 설치
```sh
npm install express
```

### 설정
```js
/** server.js */

// express 모듈 불러오기
const express = require('express');

// express 애플리케이션 인스턴스 생성
const app = express();
```

## 주요 메소드
### app.use()
- 용도: 전체 어플리케이션에 걸쳐 공통적으로 실행되는 로직을 추가할 때 사용. 또한, 여러 개의 미들웨어를 체인처럼 설정할 수 있어 요청이 처리될 때 순차적으로 미들웨어들이 실행되고, 라우트 처리 전에 실행되는 중간 코드.<br/>
<sup>- `미들웨어`: 요청(request)와 응답(response) 사이에서 특정 작업을 수행하는 함수들</sup>
- 사용 예시:
    ```js
    // JSON 데이터를 자동으로 파싱
    app.use(express.json()); 
    ```

### app.set()
- 용도: 애플리케이션에서 뷰 엔진을 설정
- 사용 예시:
    ```js
    // EJS를 뷰 엔진으로 설정. 
    // res.render()를 통해 EJS 템플릿 파일을 랜더링하여 동적 HTML 콘텐츠 생성할 수 있게 해줌.
    app.set('view engine', 'ejs');
    ```

### app.listen()
- 용도: 포트를 지정하고 서버를 실행.
- 사용 예시:
    ```js
    app.listen(8080, () => {
      console.log('서버가 http://localhost:8080에서 실행 중입니다.');
    });
    ```

### app.get()
- 용도: `HTTP GET 요청`을 처리하는 라우트 핸들러.
- 사용 예시:
    ```js
    // 1. 정확한 일치
    app.get('/', (req, res) => {
      res.send('GET 요청 처리');
    });

    //2. URL Parameter 사용
    // 글 상세페이지처럼 같이 HTML 레이아웃을 공유하나 내용만 각기 다를 경우 URL Parameter 이용
    app.get("/detail/:id", (res, req) => {
      // URL Parameter 받아오기
      let id = res.params.id; 

      // URL 파라미터 따라서 동적으로 랜더링하기
      req.render("detail.ejs", { content: "글번호는 " + id});
    })
    ```

### app.post()
- 용도: `HTTP POST 요청`을 처리하는 라우트 핸들러.
- 사용 예시:
    ```js
    app.post('/submit', (req, res) => {
      res.send('POST 요청 처리');
    });
    ```

### app.put()
- 용도: `HTTP PUT 요청`을 처리하는 라우트 핸들러로 사용하려면 [method-override](#설치-및-설정-3)설치 필요.
- 사용 예시:
    ```js
    app.put('/update', (req, res) => {
      res.send('PUT 요청 처리');
    });
    ```

### app.patch()
- 용도: 
- 사용 예시:
```js
```

### app.delete()
- 용도: 
- 사용 예시:
```js
```

### res.send()
- 용도: 응답 본문을 클라이언트에 전송.
- 사용 예시:
    ```js
    app.get('/', (req, res) => {
      res.send('Hello, Express!');
    });
    ```

### res.json()
- 용도: JSON 형식으로 응답 본문을 클라이언트에 전송.
- 사용 예시:
    ```js
    app.get('/data', (req, res) => {
      res.json({ message: 'JSON 응답' });
    });
    ```

### res.redirect()
- 용도: 클라이언트를 다른 URL로 리디렉션.
- 사용 예시:
  ```js
  app.get('/old', (req, res) => {
    res.redirect('/new');
  });
  ```

### res.status()
- 용도: 응답 상태 코드를 설정.
- 사용 예시:
    ```js
    app.get('/error', (req, res) => {
      res.status(404).send('페이지를 찾을 수 없습니다.');
    });
    ```
<br/>
<br/>

# MongoDB
비관계형(정규화가 필요없는) document 데이터베이스로 빠르게 데이터 입출력 가능.
Collection을 만들고 그 안에 document를 만들어서 기록하는 형식. 자료 저장할때 JavaScript object자료형 그대로 저장 가능
- MongoDB 구조
<img src="https://github.com/Narae-H/study-nodejs/blob/main/asset/readme/mongodb.png?raw=true" width="500px" alt="mongodb"/><br/>
<small>이미지 출처: [코딩애플](https://codingapple.com/)</small>

## 설치 및 설정
### 설치
```sh
npm install mongodb@5
```

### 설정
**1. 회원가입**: [MongoDB 가입 페이지](https://account.mongodb.com/account/register) <br/>

**2. Cluster 생성**: 
  - 왼쪽 `DATABASE > Clusters` 선택 > `Build a Cluster`선택 
  - 필요한 값 입력:
    - Cluster Type: M0 (Free Tier)
    - Name: Cluster0
    - Automate security setup: 선택
    - Preload sample dataset: 선택안함
    - Provider: AWS
    - Region: Seoul(ap-northeast-2)
  - Create Deployment
  - Connect to Cluster0 페이지
    - IP Address 확인
    - Database username/password: admin/qwer1234 <br/>

**3. DB 접속 가능한 IP 주소 설정** 
  - `Security > Network Access` 메뉴 이동
  - `Add IP Address` 선택
  - `Allow access from anywhere` 선택
  - Confirm <br/>

**4. 데이터베이스 생성**
  - `Overview` 메뉴로 이동
  - `Add data` 선택 > `Create Database on Atlas` 선택
  - Database 설정
    - Dataabse name: forum
    - Collection name:post
  - Create Database <br/>

**5. DB접속 URL 확인**
  - DB 접속 URL 확인
    - MongoDB 접속 > `Overview` 메뉴
    - Clusters 밑에 `Connect` 버튼
    - `Drivers` 선택
  - `Add your connection string into your application code` 부분의 코드 복사. 이게 DB 접속 URL 임. <br/>

**6. `server.js`코드작성**
```js
/** server.js */

// 1. mongoDB 모듈 불러오기
const { MongoClient } = require('mongodb')

// 2. DB 접속 url 설정
// [username]:[password]는 내가 데이터베이스 셋팅할때 입력한 것
const url = 'mongodb+srv://[username]:[password]@cluster0.tuq6e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// 3. DB 접속
new MongoClient(url).connect().then((client)=>{
  console.log("DB연결 성공");
}).catch((err)=>{
  console.log("DB연결 실패!");
})
```
<br/> 
<br/>

## 주요 메소드
DB 작업은 시간이 걸리는 I/O 작업으로 `await`을 사용(에러 발생 가능성 줄이기).
  ```js
  // db 앞에 'await' 키워드를 붙이려면, 그걸 감싸고 있는 메소드 앞에 'async' 붙여야 함. 
  // 'await'과 'async'는 세트
  app.get("/list", async (req, res) => {
    let result = await db.collection('post').find().toArray();
    res.render('list.ejs', {글목록: result});
  })
  ```

> <details>
> 
> <summary> <strong>await</strong> 이란?</summary>
>
> 해당 작업이 완료될 때까지 기다렸다가 다음 코드를 실행하라는 뜻. <br/>
> JavaScript는 비동기처리를 하기 때문에, 요청을 수집하고 나서 실행속도가 느린(DB조회)보다 실행속도가 더 빠른 출력(console.log())을 먼저 처리하려고 함. <br/>
> 그걸 막고 싶을때 쓸 수 있는게 `await` 또는 `콜백함수` 또는 `.then()`. <br/>
> <br/>
> MongoDB 라이브러리에서는 세개 중에 `await` 키워드를 쓰라고 권장.
> ```js
> // 1) await
> app.get("/list", async (요청, 응답) => {
>   let result = await db.collection('post').find().toArray();
>   console.log(result);
> })
> 
> // 2) 콜백함수
> app.get('/list', async (요청, 응답) => {
>   db.collection('컬렉션명').find().toArray((err, result)=>{
>     응답.send(result[0].title)
>   })
> })
> 
> // 3) then()
> app.get('/list', async (요청, 응답) => {
>   db.collection('컬렉션명').find().toArray().then((result)=>{
>     응답.send(result[0].title)
>   })
> })
> ```
> </details>

### insertOne()
- 용도: 하나의 document를 collection에 삽입
- 사용 예시: 
    ```js
    db.collection('컬렉션명').insertOne({title: "어쩌구"})
    ```

### insertMany()
- 용도: 여러 document를 한 번에 collection에 삽입
- 사용 예시: 
    ```js
    ```

### findOne()
- 용도: 조건에 맞는 한개의 document를 조회
- 사용 예시: 
    ```js
    // _id가 1234 인 document를 찾아라.
    // MongoDB에서 자동생성되는 _id의 경우, ObjectId 객체이므로 타입 맞춰서 찾아야 함.
    db.collection('컬렉션명').findOne({_id: new ObjectId(1234)})
    ```

### find()
- 용도: 여러 collection에서 조건에 맞는 document를 조회
- 사용 예시: 
    ```js
    db.collection('컬렉션명').find().toArray();
    ```

### updateOne()
- 용도: 조건에 맞는 하나의 document를 업데이트
- 사용 예시: 
    ```js
    // collection('컬렉션명').updateOne({찾을조건}, { $set: { 업데이트 할 document } })

    // 업데이트 할 데이터 키: 
    //    $set: 덮어써라
    //    $inc: +/- 연산을 해라
    //    $mul: 곱셈 연산을해라
    //    $unset: 필드값을 삭제해라
    db.collection('컬렉션명').updateOne({ name: 'Alice' }, { $set: { age: 26 } });
    ```

### updateMany()
- 용도: 조건에 맞는 여러 개의 document를 업데이트
- 사용 예시: 
    ```js
    // collection('컬렉션명').updateMany({찾을조건}, { $set: { 업데이트 할 document } })

    // 검색 조건 키: 
    // { like : { 조건문 } }
    //    $gt: 오른쪽 값 초과
    //    $gte: 오른쪽 값 이상
    //    $lt: 오른쪽 값 미만
    //    $lte: 오른쪽 값 이하
    //    $ne: not equal
    db.collection('컬렉션명').updateMany(
      { title : '멍청아' },
      { $set: { title : '착한친구야' } }
    )
    ```

### replaceOne()
- 용도: 조건에 맞는 한 개의 document를 완전히 교체
- 사용 예시: 
```js
```

### deleteOne()
- 용도: 조건에 맞는 한 개의 document를 삭제
- 사용 예시: 
```js
```

### deleteMany()
- 용도: 조건에 맞는 여러 개의 document를 삭제
- 사용 예시: 
```js
```

### countDocuments()
- 용도: 조건에 맞는 document의 개수를 반환
- 사용 예시: 
```js
```
<br/>
<br/>

# EJS
EJS는 Embedded JavaScript의 약자로, JavaScript와 HTML을 결합하여 `동적인 HTML 페이지를 생성할 수 있는 템플릿 엔진`. Express에서는 EJS 템플릿 파일을 렌더링하여 동적으로 HTML 콘텐츠를 생성가능.
- 서버사이드 랜더링: HTML을 서버측에서 데이터채워서 완성해서 유저에게 보여주는형식 ex) node.js
- 클라이언트 사이드 랜더링: 텅비어있는 html과 데이터만 유저에게 보내고 html 내용은 JavaScript로 유저 브라우저에서 생성 ex) react

## 설치 및 설정
### 설치
```sh
npm install ejs
```

### 설정
EJS는 Express와 함께 사용 됨.
1. `server.js` 코드  
    ```js
    /** server.js */

    // 1. Express 불러오기
    const express = require('express');
    const app = express();

    // 2. EJS를 뷰 엔진으로 설정
    app.set('view engine', 'ejs');

    // 3. static 폴더 등록
    // public 폴더는 static resource(image, css, js 등)가 위치해있는 폴더
    // HTML에서 '/public' 명시하지 않고 바로 사용가능: <link href="/style.css" rel="stylesheet"> 
    app.use(express.static(__dirname + '/public')); 

    // 4. 라우트
    app.get("/write", (req, res) => {
      res.render('write.ejs');
    });
    ```

2. EJS 폴더 구조: `public`, `views` 폴더 생성 <br/>
    project/ <br/>
    ├── public/ <br/>
    │   ├── css/ <br/>
    │   │   └── style.css <br/>
    │   └── js/ <br/>
    │       └── script.js <br/>
    ├── views/ <br/>
    │   └── index.ejs <br/>
    └── server.js <br/>

## 주요 문법
### 데이터 출력 변수 (`<%= %>`)
```html
<!-- name이라는 변수를 HTML로 출력 -->
<p>Hello, <%= name %>!</p>
```

### JavaScript 실행 (`<% %>`)
```html
<!-- .ejs 파일에서 JavaScript 문법 쓸 때 -->
```html
<% for (var i = 0; i < 3; i++){ %>
  <h4>안뇽!</h4>
<% } %> 
```

### HTML 이스케이프 없이 출력 (`<%- %>`)
```html
<!-- 반복되는 .ejs 파일 넣고 싶을 때 -->
<%- include('nav.ejs') %>

<!-- htmlContent: '<strong>This is bold text!</strong>' 로 server.js에서 설정해줬을 경우,  -->
<!-- '<strong>This is bold text!</strong>'부분이 HTML 태그로 인식되어 볼드체로 보임 -->
<p>Unescaped HTML: <%- htmlContent %></p>
```
<br/>

> <details>
>
> <summary> <small><strong><%= %></strong> VS <strong><%- %></strong></small> </summary>
> 
> `<%- %>` 사용하면 그 안에 들어있는게 html인 경우, 실제로 그것을 랜더링 해줌.
> `<%= %>` 사용하면 그 안에 들어있는게 html일지라도 랜더링 하지 않고 태그 그대로 문자로 나옴.
> </details>
<br/>
<br/>

# method-override
method-override는 HTML 폼에서 `PUT, PATCH, DELETE와 같은 HTTP 메소드를 사용할 수 있도록 도와주는 미들웨어` <br/>
HTML \<form>는 기본적으로 GET과 POST만 지원하므로, 다른 HTTP 메소드를 사용하려면 method-override를 사용해야 함

## 설치 및 설정
### 설치
```sh
npm install method-override
```

### 설정
```js
// 1. Import modules
const express = require('express');
const methodOverride = require('method-override');

// 2. Create an Express instance
const app = express();

// 3. Set middleware
// HTTP 메서드 오버라이드를 위한 미들웨어. 웹 폼(form)에서 `_method`를 찾아서 HTTP Method 덮어씀.
app.use(methodOverride('_method'));

// application/x-www-form-urlencoded 형식의 데이터를 파싱. 이 데이터는 웹 폼(form)에서 보통 보내는 형식
app.use(express.urlencoded({ extended: true }));

// 4. Run a server
app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});

// 5. 라우팅
// HTML form에서 method 오버라이드 했으므로 아래의 app.delete('/resources/:id', ()=>{}) 실행이 됨.
app.delete('/resource/:id', (req, res) => {
  const resourceId = req.params.id;
  // Perform delete operation
  res.send(`Resource with ID ${resourceId} deleted.`);
});
```
```html
<!-- 아래와 같이 보내면 method가 POST인데도 불구하고 DELETE 요청이 됨. -->
<form action="/resource/123?_method=DELETE" method="POST">
  <button type="submit">Delete</button>
</form>
```
<br/>
<br/>

# nodemon
Node.js 애플리케이션을 개발할 때 유용한 도구로, 파일이 변경되면 서버를 자동으로 재시작하므로 코드 수정될때마다 서버 재시작 불필요

### 설치
```sh
# nodemon 설치
npm install -g nodemon
```

### 서버 실행
```sh
nodemon server.js
```

### `package.json`에 스크립트 설정
nodemon을 매번 직접 실행하지 않고, NPM 스크립트로 설정
- package.json   
    ```js
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js"
    }
    ```
- 스크립트 실행
    ```sh
    npm run dev
<br/>
<br/>

# TypeScript
## 설치
- 타입정의 설치
    ```sh
    npm install --save-dev @types/express
    ```
- TypeScript 설치
    ```sh
    npm install --save-dev typescript
    ```
<br/>
<br/>

# 클라이언트와 서버 간 통신
<img src="https://github.com/Narae-H/study-nodejs/blob/main/asset/readme/client_server_communication.png?raw=true" width="500px" alt="클라이언트와 서버 간 통신"><br/>
<br/>

## 라우팅
서버에서 특정 `URL`과 `HTTP Method`에 따라 요청을 처리하는 방법.

### Node.js에서의 라우팅 설정
`Express`와 `method-override` middleware를 사용하여 라우팅 설정 가능
 - [app.get()](#appget): 데이터 조회
 - [app.post()](#apppost): 데이터 생성
 - [app.put()](#appput): 데이터 전체 수정
 - [app.patch()](#apppatch): 데이터 일부 수정
 - [app.app.delete()](#appdelete): 데이터 삭제
<br/>

## 클라이언트 요청(HTTP Request)
클라이언트가 서버로 요청을 보낼 때는 정해진 형식에 맞춰서 요청(Request)을 해야하는데, HTTP Request는 아래와 같이 크게 3개 부분으로 나누어져 있음:
- Start line: [HTTP Method](#http-method), [HTTP URL](#http-url), HTTP version
- Header: [HTTP Header](#http-header)
- Body: Request가 전송하는 데이터를 담고 있는 부분 

### HTTP Method
|<center>HTTP Method</center>|<center>설명</center>|<center>[CRUD](#crud) 동작</center>|
|-----------------|----------------------|--------------------|
| `GET`           | 리소스 `조회`         | **R**EAD           |
| `POST`          | 리소스 `생성`         | **C**REATE         |
| `PUT`           | 리소스 전체 `수정`     | **U**PDATE         |
| `PATCH`         | 리소스 일부 `수정`     | **U**PDATE         |
| `DELETE`        | 리소스 `삭제`         | **D**ELETE         |
| `HEAD`          |          |          |
| `OPTIONS`       |          |          |
| `TRACE`         |          |          |
| `CONNECT`       |          |          |

> <details>
>
> <summary><small>`PUT` VS `PATCH`</small></summary>
>
> `PUT`은 리소스 전체가 교체(만약 전체가 아닌 일부만 데이터를 전달한다면 전달한 필드 외 다른 데이터는 null/초기값 처리)
> `PATCH`는 리소스의 일부만 교체.
> <br/>
>
> - 원본 데이터: `{ "name": "김철수", "age": 18 }`
> 
> | <center>**항목**</center>      | <center>**`PUT`**(틀림)</center> | <center>**`PUT`**(맞음)</center> | <center>**`PATCH`**(맞음)</center> |
> |-------------------------------|----------------------------------|---------------------------------|-----------------------------------|
> | <center>**요청 JSON**</center> | { "age": 20 }                   | { "name": "김철수", "age": 20 } | { "age": 20 }                   |
> | <center>**결과 JSON**</center> | { "name": null, "age": 20 }     | { "name": "김철수", "age": 20 } | { "name": "김철수", "age": 20 }  |
> | <center>**설명**</center>      | 전체 리소스가 업데이트되므로 `누락된 필드는 null 또는 초기값` 삽입 | `전체 리소스를 업데이트`하며 누락된 필드 없음. | `일부 필드만 업데이트`하며 기존 리소스 유지.|
> 
> </details>

### HTTP URL
- <프로토콜>://<호스트>:<포트>/<경로>?<쿼리스트링>
- REST 서비스의 경우 서버는 일반적으로 URL을 사용하여 리소스를 식별하고 수행

### HTTP Header
- 데이터: POST, PUT 및 기타 HTTP 메서드가 성공적으로 작동하기 위한 데이터
- 파라미터: 수행하는 작업에 대한 추가적인 정보 ex) 클라이언트 인증을 위한 쿠키
<br/>

## 서버 요청 처리 방식
### 서버에 요청하는 법
- 주소창: 단순 `GET` 요청.
- Form 태그: 데이터와 같이 서버 요청. but, 페이지 새로고침 일어남.
- AJAX: 새로고침 없이 서버 요청.

### 서버 요청 시 데이터 전달하는 법
- URL Parameter: 데이터 전달 방법.  
- Query String: 간단한 쿼리 데이터 추가.
- Request Body: POST/PUT 요청 시 데이터 전송 방식.
<br/>

## HTTP 응답코드
서버가 클라이언트 요청에 대해 반환하는 결과를 나타내는 상태코드

### 응답 코드의 분류
- `1XX` (정보): 요청을 수신했으며 처리 중
- `2XX` (성공): 요청이 성공적으로 처리됨
- `3XX` (리다이렉션): 클라이언트가 추가 조치를 취해야 함
- `4XX` (클라이언트 에러): 요청 오류
- `5XX` (서버 에러): 서버가 요청 처리에 실패

### 주요 응답 코드
| **상태 코드**        | **설명**                          | **사용 예시**                  |
|-----------------------|-----------------------------------|---------------------------------|
| `200 OK`             | 요청 성공                        | 데이터 조회, 수정 등 성공      |
| `201 Created`        | 데이터 생성 성공                 | POST 요청에서 사용             |
| `400 Bad Request`    | 잘못된 요청                      | 요청 데이터가 잘못된 경우      |
| `404 Not Found`      | 요청한 리소스를 찾을 수 없음      | 잘못된 URL 또는 경로 요청      |
| `500 Internal Server Error` | 서버 내부 오류              | 코드 에러 또는 서버 문제        |
<br/>

## `RESTful API` 디자인
`REST`(Representational State Transfer)의 형식을 잘 따르는 API로 좋은 API하는 디자인 원칙 중 하나.
  - REST의 형식:
    - HTTP URI를 통해 자원을 명시하고,
    - HTTP Methods를 통해,
    - 해당자원(URL)에 대한 CRUD를 수행하는 것을 의미.

### RESTful API 원칙
- `Uniform Interface`: 일관성있는 URL, 하나의 URL + method는 하나의 데이터를 가져오게 하고, 간결하며 예측가능해야 함.
- `Client-Server` 구분: 유저에게 서버역할을 맡기지 마라. 유저와 서버의 역활은 각각 다름.
- `Stateless (무상태)`: 서버가 이전의 모든 요청과 독립적으로 모든 클라이언트 요청을 완료.
- `Cacheability`: 요청은 캐싱이 가능해야 함.
- `Layered system`: 요청 하나는 최종 응답 전까지 여러 단계를 거쳐도 됨.
- `Code on demand`: 서버는 유저에게 실행가능한 코드를 보내줄 수도 있음.

### 좋은 URL 작명 관습
- 동사보다는 `명사` 위주로
- 띄어쓰기는 언더바(_)대신 `대시(-)` 기호
- 파일 확장자 쓰지 말기
- 하위 문서를 뜻할 땐 `/`를 기호를 사용함(단 마지막에는 `/`를 포함하지 않음)
- 행위를 포함하지 않음 ex) delete-article => article
<br/>
<br/>

# try/catch (예외처리)
DB에러(통신에러, id 중복에러등)등 에러가 발생할 때 특정 코드를 실행.

```js
// server.js

try {
   await db.collection('post').insertOne(어쩌구)
} catch (e) {
   console.log(e)
   응답.send('DB에러남')
} 
```
<br/>



