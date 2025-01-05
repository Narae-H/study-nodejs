
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

## 설치 및 개발환경 셋팅
### 1. Node.js 접속
[Node.js 다운로드](https://nodejs.org/en/download/current) 페이지 접속

### 2. 다운로드 및 설치
페이지 중간쯤에 OS 종류 맞춰서 Installer 다운로드하고 설치 ex) Windows Installer (.msi)

### 3. VS Code 에디터 설치
[Visual Studio Code](https://code.visualstudio.com/download) 다운로드 및 설치

### 4. 작업용 폴더 생성 및 VS Code에서 열기

### 5. 프로젝트 생성
1. VS Code에서 터미널 오픈(`` Ctrl + ` ``)
2. `package.json` 생성
```sh
npm init -y
```
3. `Express` 라이브러리 설치
```sh
npm install express
```

4. 내가 만든 작업용 폴더 안에 `node_modules` 폴더 생성되었는지 확인
5.  `server.js` 파일 생성
```js
// 1. express 라이브러리 사용하겠다고 알려줌.
const express = require('express')
const app = express()

// 2. app.listen([포트넘버], () =>{}): 서버 실행
app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

// 3. app.get([주소], ([요청], [응답])=>{ 보여줄것 }): [주소]로 들어오면, 무언가 보여줘라.
// 여기서는 '/'(메인페이지)로 들어오면 '반갑다'라고 보여줘라.
app.get('/', (요청, 응답) => {
  응답.send('반갑다')
}) 
```

6. 서버 실행
```sh
node server.js
```
7. 서버 실행 확인: [http://localhost:8080](http://localhost:8080)
<br/>

> <details>
>
> <summary>소스코드 수정될때마다 실행하기 귀찮으면? => `nodemon` 설치</summary>
> 
> ```sh
> # nodemon 설치
> npm install -g nodemon
>
> # 서버 실행
> nodemon server.js
> ```
> </details>
<br/>
<br/>

# 라우팅
서버에서 데이터를 보낼 경로를 선택하는 과정. 즉, `URI` 따라서 여러가지 페이지 만듬.

## 사용법
`app.get('/news', () => {}) `: get() 메소드를 이용하여 페이지 라우팅 가능하게 해줌.  
  1. 누가 `/news` 접속 시 `app.get()` 실행
  2. app.get( )안에 있는 `콜백함수`(( )=>{ }) 실행 (콜백함수는 순서가 보장됨)

### 1. 글씨만 보여주기
```js
// 1. express 라이브러리 사용
const express = require('express')
const app = express()

// 2. 서버 실행
app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

// 3. URI 셋팅
// 3-1) '/'(메인페이지)로 들어오면 '반갑다'라고 보여줘라.
app.get('/', (요청, 응답) => {
  응답.send('반갑다')
}) 
// 3-2) '/news'로 들어오면 '오늘 비옴'이라고 보여줘라.
app.get('/news', (요청, 응답) => {
  응답.send('오늘비옴')
}) 
```
<br/>

### 2. HTML 페이지 보여주기
1. `index.html`페이지 만들기
2. `! + tab` : 기본 템플릿 생성
3. 코드 작성
  ```html
  <!-- index.html -->

  <body>
    <h2>Hi</h2>
  </body>
  ```

  ```js
  /** server.js*/

  // 1. express 라이브러리 사용
  const express = require('express')
  const app = express()

  // 2. 서버 실행
  app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버 실행중')
  })

  // 3. URI 셋팅
  // 3-1) '/'(메인페이지)로 들어오면 'index.html'페이지를 보여줘라.
  // __dirname: 현재 server.js 파일의 절대경로
    app.get('/', (요청, 응답) => {
      응답.sendFile(__dirname + '/index.html')
    }) 
  // 3-2) '/news'로 들어오면 '오늘 비옴'이라고 보여줘라.
  app.get('/news', (요청, 응답) => {
    응답.send('오늘비옴')
  }) 
  ```
4. 서버 재실행
5. 서버 실행 확인: [http://localhost:8080](http://localhost:8080)
<br/>

### 3. Static 파일(CSS 파일) 넣어보기
1. `public` 폴더 생성
2. `main.css` 파일 생성
3. 생성한 public 폴더를 `server.js`에 등록: `app.use(express.static( ))`
```js
/** server.js */

// 1. express 라이브러리 사용
const express = require('express')
const app = express()

// 2. static 폴더 등록
app.use(express.static(__dirname + '/public'));

// 3. 서버 실행
app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

// 4. URI 셋팅
app.get('/', (요청, 응답) => {
  응답.send('반갑다')
}) 
``` 

4. html 파일에서 css파일 첨부 및 코드작성
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- index.html -->
  <!-- public 폴더를 등록해놨으면 "public" 명시할 필요 없음 -->
  <link href="/main.css" rel="stylesheet">

  <!-- 만약, public 밑에 하위폴더가 있고 그거 쓰려면? -->
  <link href="/하위폴더/main.css" rel="stylesheet">

  <title>Document</title>
</head>

<body>
  <div class="nav">
    <a class="logo">AppleForum</a>
    <a>Page1</a>
    <a>Page2</a>
  </div> 
</body>
```

5. css파일 코드 작성
```css
/* index.css */
body {
  margin: 0;
}
.nav {
  display: flex;
  padding: 15px;
  align-items: center;
  background : white;
}
.nav a {
  margin-right: 10px;
}
.logo {
  font-weight: bold;
}
```
<br/>
<br/>

# MongoDB 호스팅 받고 셋팅하기
## MongoDB란?
비관계형(정규화가 필요없는) document 데이터베이스로 빠르게 데이터 입출력 가능.
Collection을 만들고 그 안에 document를 만들어서 기록하는 형식. 자료 저장할때 JavaScript object자료형 그대로 저장 가능
- MongoDB 구조

<img src="/asset/readme/mongodb" width="500px" alt="mongodb"/><br/>
<small>이미지 출처: [코딩애플](https://codingapple.com/)</small>

## MongoDB 호스팅받기
클라우드 호스팅으로 진행(직접 설치도 가능하나 호스팅 받는게 편하니깐). 가입만 하면 무료로 512MB 사용 가능.

### 1. 회원가입
[MongoDB 가입 페이지](https://account.mongodb.com/account/register) 에서 회원가입

### 2. Cluster 생성
1. 왼쪽 `DATABASE > Clusters` 선택 > `Build a Cluster`선택 
2. 필요한 값 입력
  - Cluster Type: M0 (Free Tier)
  - Name: Cluster0
  - Automate security setup: 선택
  - Preload sample dataset: 선택안함
  - Provider: AWS
  - Region: Seoul(ap-northeast-2)
3. Create Deployment
4. Connect to Cluster0 페이지
  - IP Address 확인
  - Database username/password: admin/qwer1234

### 3. DB 접속 가능한 IP 주소 설정 
1. `Security > Network Access` 메뉴 이동
2. `Add IP Address` 선택
3. `Allow access from anywhere` 선택
4. Confirm

### 4. 데이터베이스 생성
1. `Overview` 메뉴로 이동
2. `Add data` 선택 > `Create Database on Atlas` 선택
3. Database 설정
  - Dataabse name: forum
  - Collection name:post
4. Create Database
<br/>

## MongoDB와 서버 연결
### 1. 라이브러리 설치
```sh
npm install mongodb@5
```

### 2. `server.js` 코드 작성
1. DB 접속 URL 확인
  - MongoDB 접속 > `Overview` 메뉴
  - Clusters 밑에 `Connect` 버튼
  - `Drivers` 선택
2. `Add your connection string into your application code` 부분의 코드 복사. 이게 DB 접속 URL 임.

3. `server.js` 에 mongoDB 연결 위한 코드 작성
```js
/** server.js */

// mongoDB 연결하기 위한 코드
const { MongoClient } = require('mongodb')

// 1. mongoDB에서 DB 접속 url 확인하고 넣기. [username]:[password]는 내가 데이터베이스 셋팅할때 입력한 것
let db
const url = 'mongodb+srv://[username]:[password]@cluster0.tuq6e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

// DB 접속
new MongoClient(url).connect().then((client)=>{
  // 성공시
  console.log('DB연결성공')

  // 2. DB 이름: forum
  db = client.db('forum')
  
  // 3. DB 접속이 되야 서버에서 무언가 할 수 있으니 서버 실행 코드 여기다 두기
  app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버 실행중')
  })
}).catch((err)=>{
  // 에러날때
  console.log(err)
})

```

### 3. DB 입력테스트
1. `server.js` 코드 수정
```js
/** server.js */ 

app.get('/news', (요청, 응답) => {
  // 데이터 입력
  db.collection('post').insertOne({title: "어쩌구"})
})
```

2. DB 데이터 입력 확인
- MongoDB 접속 > `Overview` 메뉴
- `Browse Collections` 선택
- `post` collection 선택하면 데이터 입력한 것 확인가능
<br/>

## 테스트 데이터 입력
1. MongoDB 접속 > `Overview` 메뉴
2. `Browse Collections` 선택
3. `Inert Document` 선택
4. 내용 입력: id값을 자동으로 부여됨(물론 수정도 가능)
 - title: "첫 게시물"
 - content: "내용임1234"
5. Insert
<br/>

> <details>
> 
> <summary> Q. document 1개에 데이터를 다 넣어도 되는가?</summary>
> A: No!!! document는 1개의 데이터 row를 의미함. 한줄에 모든 데이터를 다 넣으면 데이터 관리(데이터를 찾고 수정하고 등)가 어려워짐.
> 
> </details>

<br/>

## DB 데이터 조회
```js
/** server .js */

// '/list'로 접속하면 db의 post 컬렉션에 있는 모든 document를 보여줘라.
app.get("/list", async (요청, 응답) => {
  let result = await db.collection('post').find().toArray();
  console.log(result);
})
```
<br/>

> <details>
> 
> <summary> <strong>await</strong> 이란?</summary>
>
> 다음줄 실행하기 전에 잠깐 기다리라는 뜻. JavaScript는 비동기처리를 하기 때문에 요청을 다 받고나서 실행속도가 느린(DB조회)보다 실행속도가 더 빠른 출력(console.log())을 먼저 처리하려고 함.
> 그걸 막고 싶을때 쓸 수 있는게 `await` 또는 `콜백함수` 또는 `.then()`
> MongoDB 라이브러리에서 `await` 키워드를 쓰라고 권장.
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
<br/>

## 랜더링(EJS)
DB에서 받아온 데이터를 브라우저에 이쁘게 보여주는 과정을 rendering이라고 함. 
template engine 쓰면, 서버에서 받아온 데이터 html에 넣을 수 있는데 여기서는 template engine 중 `ejs` 쓸것임. 
- 서버사이드 랜더링: HTML을 서버측에서 데이터채워서 완성해서 유저에게 보여주는형식 ex) node.js
- 클라이언트 사이드 랜더링: 텅비어있는 html과 데이터만 유저에게 보내고 html 내용은 JavaScript로 유저 브라우저에서 생성 ex) react

### 1. EJS 설치
```sh
npm install ejs
```
<br/>

### 2. EJS 사용하는걸 node.js에 알려줌
```js
// server.js

app.set('view engine', 'ejs');
```
<br/>

### 3. 랜더링
html 파일 안에 데이터를 꽂아넣고 싶으면 `.ejs` 파일을 만들어서 거기에 데이터를 꽂아넣으면 그걸 자동으로 html로 변환해줌.   
.ejs 파일은 `HTML 파일과 문법은 동일`하고, `views 폴더 밑`에 생성. 

- list.ejs
```html
<!-- list.ejs -->
<body class="grey-bg">

  <div class="white-bg">
    <div class="list-box">
      <h4>글제목임</h4>
      <p>글내용임</p>
    </div>
    <div class="list-box">
      <h4>글제목임</h4>
      <p>글내용임</p>
    </div>
  </div> 

</body>
```

- css 
```css
/* main.css */

.grey-bg {
  background: #eee;
}
.white-bg {
  background: white;
  margin: 20px;
  border-radius: 5px;
}
.list-box {
  padding : 10px;
  border-bottom: 1px solid#eee;
}
.list-box h4{
  font-size: 16px;
  margin: 5px;
}
.list-box p {
  font-size: 13px;
  margin: 5px;
  color: grey;
}
```
<br/>

### 4. server.js 파일에서 .ejs 파일 셋팅
어떤 URI로 접속 시에 ejs 파일 보여줄것인지 어떤 데이터를 보여줄지 알려주기.<br/>
<small>참고: 응답은 1번만 갖다 쓸 수 있으므로 응답으로 여러개 쓴다면 최초의 한개만 실행되고 아래껀 실행안됨.</small>

- 1. .ejs파일 랜더링 설정(`응답.render()`)
```js
// server.js
app.get("/list", async (요청, 응답) => {
  let result = await db.collection('post').find().toArray();
  응답.render('list.ejs', {글목록: result}); 
})
```

- 2. 가져다 쓰기(`<%= $>`)
```html
<!-- list.ejs -->

<body class="grey-bg">
  <div class="white-bg">
    <div class="list-box">
      <h4><%= 글목록[0].title %></h4>
      <p><%= 글목록[0].content %></p>
    </div>
    <div class="list-box">
      <h4><%= 글목록[1].title %></h4>
      <p><%= 글목록[1].content %></p>
    </div>
  </div>
</body>
```
<br/>
<br/>

# EJS 문법
- `<%= %>`: .ejs에서 `데이터` 가져다 쓸 때
- `<% %>`: .ejs에서 `JavaScript` 문법쓸 때
- `<%- %>`: .ejs에서 JavaScript가 아닌 `특수한 문법` 쓸 때
<br/>

> <details>
>
> <summary> <small><strong><%= %></strong> VS <strong><%- %></strong></small> </summary>
> 
> `<%- %>` 사용하면 그 안에 들어있는게 html인 경우, 실제로 그것을 랜더링 해줌.
> `<%= %>` 사용하면 그 안에 들어있는게 html일지라도 랜더링 하지 않고 태그 그대로 문자로 나옴.
> </details>
<br/>

## `<%= %>` (데이터)
JavaScript 파일에서 `render()` 메소드로 데이터 보냈을 경우, `<%= %>` 써서 데이터 삽입 가능.

```html
<h4><%= 데이터이름 %></h4>
```
<br/>

## 자바스크립트 문법(`<% %>`)
.ejs 파일에서는 기존의 JavaScript 문법 그대로 사용가능. 단, `<% %>` 안에 넣어야 함.

### 반복문
```html
<% for (var i = 0; i < 3; i++){ %>
  <h4>안뇽</h4>
<% } %> 
```
<br/>

## include(`<%- %>`)
.ejs 파일을 다른 .ejs 파일에 넣고 싶을 때. 다시 말해 여러 .ejs 파일에서 자주 사용하는 HTML 덩어리가 있으면 따로 .ejs 파일로 만들어놓고 .ejs 불러와서 쓰는 형식으로 코드 짜는것 가능.

- nav.ejs (끼워넣고 싶은 HTML 덩어리)
```html
<!-- nav.ejs -->
<div class="nav">
  <a class="logo">AppleForum</a>
  <a>Page1</a>
  <a>Page2</a>
</div> 
```

- list.ejs (끼워 넣을 곳)
```html
<!-- 
1) 기본 
  <%- include(`파일이름.ejs`) %>

2) 데이터 전달하고 싶은 경우
  <%- include(`파일이름.ejs`), {데이터: 123} %>  
-->

<body class="grey-bg">
  <%- include('nav.ejs') %>
  
  <div class="white-bg">
    <% for(let i=0; i<글목록.length; i++) { %>
      <div class="list-box">
        <h4><%= 글목록[i].title %></h4>
        <p><%= 글목록[i].content %></p>
      </div>
    <% } %> 
  </div>
</body>
```
<br/>
<br/>

## RESTful API



