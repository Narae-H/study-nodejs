
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
- 용도: 전체 어플리케이션에 걸쳐 공통적으로 실행되는 로직을 추가할 때 사용. 또한, 여러 개의 미들웨어를 체인처럼 설정할 수 있어 요청이 처리될 때 순차적으로 미들웨어들이 실행되고, 라우트 처리 전에 실행되는 중간 코드. <small>[미들웨어 자세히](#미들웨어)</small> <br/>

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
`비관계형`(정규화가 필요없는) document 데이터베이스로 `빠르게` 데이터 입출력 가능.
Collection을 만들고 그 안에 document를 만들어서 기록하는 형식. 자료 저장할때 JavaScript object자료형 그대로 저장 가능
- MongoDB 구조
  - 컬렉션(Collection): MongoDB의 데이터를 저장하는 단위로, RDB의 테이블과 유사
  - 문서(Document): JSON 형식으로 저장된 데이터 단위로, RDB의 행(row)와 유사
<img src="https://github.com/Narae-H/study-nodejs/blob/main/asset/readme/mongodb.png?raw=true" width="500px" alt="mongodb"/><br/>
<small>이미지 출처: [코딩애플](https://codingapple.com/)</small>

> <details>
> <summary> 정규화DB VS 비정규화DB</summary>
> 
> | 항목              | **NoSQL Database**                                  | **RDB**                                              |
> |------------------|---------------------------------|------------------------------------------------------|
> | **간략한 정의**    | 비관계형 데이터베이스로, 스키마가 자유롭고 확장성이 뛰어남.     | 관계형 데이터베이스로, 데이터를 테이블 형태로 저장하고 정규화하여 규칙이 있음. |
> | **특징**          | - 유연한 스키마<br>- 수평적 확장성<br>- `높은 성능(빠름)`<br>- 비정형 데이터 저장 | - 정형화된 스키마<br>- 수직적 확장성<br>- `데이터 무결성` 보장<br>- 트랜잭션 지원 |
> | **데이터 모델**    | 문서(Document), 키-값(Key-Value), 그래프(Graph), 컬럼(Column) 등  | 테이블 형식으로 데이터 저장 (행(Row)과 열(Column))    |
> | **확장성**        | 수평적 확장성(서버 추가로 확장 가능)                        | 수직적 확장성(서버 성능을 높여서 확장)                    |
> | **적합한 사용 사례**| 대용량 데이터 처리, 빠른 읽기/쓰기, 스키마가 자주 변하는 경우   | 데이터 무결성이 중요한 경우, 복잡한 관계 모델링이 필요한 경우 |
> | **예시 DB 종류**   | MongoDB, Cassandra, CouchDB, Redis, DynamoDB               | MySQL, PostgreSQL, Oracle, SQL Server                  |
> | **ex. 글작성**    | document 데이터: <br/> - 글 아이디<br/> - 글 제목<br/> - 글 내용<br/> - 작성자 아이디<br/> - `작성자 이름`<br/> | row 데이터: <br/> - 글 아이디 <br/> - 글 제목 <br/> - 글 내용 <br/> - 작성자 아이디<br/><br/> | 
> | | - 데이터 조회 시에 하나의 document를 바로 가져오므로 빠름. <br/> - 작성자 이름이 변경되었을 경우, 데이터 무결서 보장 안됨.<br/> - 해결방법: 조회를 두번(글 데이터 + 유저정보 데이터) 하면됨. | - 데이터 조회 시에 여러 테이블을 조인하므로 느림 <br/> - 작성자 이름이 변경되어도 join하여 가져오므로 데이터 무결성 보장 <br/> - 쿼리 한방에 데이터 조회 가능| 
> </details>


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

## 메소드
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

### 삽입
Collection에 새로운 document를 추가. 

- insertOne()
  - 용도: 하나의 document를 collection에 삽입
  - 사용 예시: 
      ```js
      db.collection('컬렉션명').insertOne({title: "어쩌구"})
      ```
<br/>

- insertMany()
  - 용도: 여러 document를 한 번에 collection에 삽입
  - 사용 예시: 
      ```js
      db.collection('컬렉션명').insertMany([
        { title: "첫 번째 문서" },
        { title: "두 번째 문서" }
      ]);      
      ```

### 조회
Collection에서 document를 검색하는 메소드들 [index 알아보기](#인덱스)

#### 연산자
  - 비교 연산자
    - `$eq`: 값이 같은 문서 (Equal)
    - `$ne`: 값이 같지 않은 문서 (Not Equal)
    - `$gt`: 값이 큰 문서 (Greater Than)
    - `$lt`: 값이 작은 문서 (Less Than)
    - `$gte`, `$lte`: 값이 크거나 같음, 작거나 같음 (Greater Than Equal, Less Than Equal)

  - 논리 연산자
    - `$and`: 여러 조건이 모두 참인 문서
    - `$or`: 여러 조건 중 하나 이상 참인 문서
    - `$not`: 조건을 부정

  - 배열 연산자
    - `$in`: 값이 배열에 포함된 문서
    - `$all`: 배열의 모든 요소를 포함하는 문서

  - 텍스트 검색
    - `$regex`: 정규식을 사용한 검색

#### 메소드
- findOne()
  - 용도: 조건에 맞는 한개의 document를 조회
  - 사용 예시: 
      ```js
      // _id가 1234 인 document를 찾아라.
      // MongoDB에서 자동생성되는 _id의 경우, ObjectId 객체이므로 타입 맞춰서 찾아야 함.
      db.collection('컬렉션명').findOne({_id: new ObjectId(1234)})
      ```
<br/>

- find()
  - 용도: 여러 collection에서 조건에 맞는 document를 조회. [Index 알아보기](#검색기능)
  - 사용 예시: 
      ```js
      // find(query, projection)
      // query: 검색조건
      // projection: 반환할 필드의 포함/제외 여부를 지정하는 객체
      
      // 1. 조건없이 전부 가져옴
      db.collection('컬렉션명').find().toArray();

      // 2. 반환할 필드의 포함/제외 여부를 선택
      // 모든 document를 가져오되, filed1과 filed2만 가져오고 _id는 제외
      db.collection('컬렉션명').find({}, { field1: 1, field2: 1, _id: 0 }).toArray();

      // 조건이 필요할 때: find({ 키 : { 조건문 } });
      db.collection('컬렉션명').find({ age: { $gte: 18 } }); // age가 18 이상인 documnet만 찾음.
      ```
<br/>

- skip()
  - 용도: 조회된 결과에서 일부 document를 건너 띔
  - 사용예시:
      ```js
      // db.collection.find(쿼리(조건)).skip(띄어넘고 싶은 document 개수);
      db.collection('컬렉션명').find().skip(10); // 처음 10개 문서를 건너뛰고 나머지 데이터를 반환
      ```

- limit()
  - 용도: 반환할 문서의 수를 제한
  - 사용예시:
      ```js
      // db.collection.find(쿼리(조건)).limit(반환할 document의 최대 개수);
      db.users.find().limit(5); // 처음 5개의 document만 반환
      ```
- countDocuments()
  - 용도: 조건에 맞는 document의 개수를 반환
  - 사용 예시: 
    ```js
    db.collection('컬렉션명').countDocuments({ age: { $gte: 18 } });
    ```      
><details>
>
><summary>- `find()`, `skip()`, `limit()`을 사용하여 페이지네이션 구현</summary>
>
>```js
>const page = 2; // 페이지 번호
>const pageSize = 5; // 한 페이지에 표시할 문서 수
>
>// 방법 1: skip() && limit(): 예를들어, 1번부터 5번글까지 가져와라.
>// skip()은 성능 이슈가 있음. 100만 이상의 숫자를 넣으면 매우 오래 걸림.
>db.collection('post')
>  .find()                      // 조건: 모든 데이터 중
>  .skip((page - 1) * pageSize) // n번 부터
>  .limit(pageSize);            // pageSize만큼 가져와라
>
>// 방법 2: find() && limit(): 방금 본 마지막 게시물의 id부터 n번까지
>// id로 찾아오기때문에 속도 빠름, 페이지네이션을 숫자로 못하고, 방금 본 마지막 게시물의 id를 받아오기 위해서 >다음버튼으로 구현해야함.  
>db.collection('post')
>  .find( {_id : {$gt : 방금본 마지막게시물_id}} ) // 조건: 방금본 마지막 게시물의 _id 초과된 _id 중
>  .limit(pageSize);                            // pageSzie 만큼 가져와라.
>
>// 방법 3: find() && skip() && limit()
>db.collection('post')
>  .find({ age: { $gte: 18 } }) // 조건
>  .skip((page - 1) * pageSize) // 건너뛰기
>  .limit(pageSize);            // 제한
>```
></details>

### 수정
기존 document를 수정

- updateOne()
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
<br/>

- updateMany()
  - 용도: 조건에 맞는 여러 개의 document를 업데이트
  - 사용 예시: 
      ```js
      // collection('컬렉션명').updateMany({찾을조건}, { $set: { 업데이트 할 document } })
      db.collection('컬렉션명').updateMany(
        { title : '멍청아' },
        { $set: { title : '착한친구야' } }
      )
      ```
<br/>

- replaceOne()
  - 용도: 조건에 맞는 한 개의 document를 완전히 교체
  - 사용 예시: 
    ```js
    db.collection('컬렉션명').replaceOne({ _id: "1234" }, { title: "새 문서" });
    ```

### 삭제
document 삭제
- deleteOne()
  - 용도: 조건에 맞는 한 개의 document를 삭제
  - 사용 예시: 
      ```js
      db.collection('컬렉션명').deleteOne(
        { _id: new ObjectId(req.body._id) }
      )
      ```
<br/>

- deleteMany()
  - 용도: 조건에 맞는 여러 개의 document를 삭제
  - 사용 예시: 
  ```js
  db.collection('컬렉션명').deleteMany({ active: false });
  ```

### 기타
- sort()
  - 용도: document를 특정필드로 정렬
  - 사용 예시: 
  ```js
  db.collection('컬렉션명').find().sort({ age: -1 });
  ```

## 인덱스
document가 많은 경우 find()로만 검색을 한다면 모든 document를 하나하나 다 확인해봐야 하기 때문에 속도가 느림. 인덱스는 데이터베이스에서 데이터 검색 성능을 높이기 위해 사용되는 구조로, 책의 목차와 유사한 역할(기본적으로 `_id` 필드는 인덱스가 자동 생성됨)
> <details>
> 
> <summary>Index의 동작원리</summary>
> 
> Index는 검색 알고리즘을 이용하여 게시물을 빠르게 찾아주는데, 이게 조건이 `미리 정렬`되어 있어야 함.
> document 들을 복사해서 미리 정렬해두면 되는데 정렬된 컬렉션 복사본을 index라고 부름.
>
> 1. 인덱스가 없는 경우(Collection Scan)
> 인덱스가 없는 경우, 모든 문서를 순차적으로 검사하여 조건에 맞는 데이터를 찾음
> - 장점: Index 생성을 위한 추가적인 저장 공간을 사용하지 않음.
> - 단점: 문서가 많을수록 검색속도가 느려짐.
>
> 2. 인덱스를 사용한 검색(Index Scan)
> 인덱스를 활용하여 검색을 함
> - 장점: 정렬된 인덱스를 빠르게 탐색하여 문서를 조회하고 필요한 데이터만 조회하여 성능 향상
> - 단점: Index 생성을 위한 추가적인 저장 공간 필요하고, 필드크기와 문서에 따라 공간 사용량 증가. 데이터를 삽입하거나 수정할 때, 관련 인덱스도 업데이트되어야 하므로 약간의 성능 저하 발생. 띄어쓰기로 구분되는 단어밖에 검색 못함.
> </details>

### 인덱스 종류
#### 단일 필드 인덱스
<br/>

#### Search Index
MongoDB에서 `복합쿼리, 유사어, 단어 근접도` 등 고급 검색을 하기 위한 인덱스.

- 동작원리
1) Index를 만들 때 document에 있는 문장들을 가져와서 조사나 쓸데없는 불용어(은, 는, 이, 가 등)들을 제거하고 단어(또는 토큰) 을 추출
2) 이 단어들이 어떤 documnet에 등장했는지 그 document id 같은걸 함께 단어 옆에 기재하여 역색인 생성
    - document
      ```json
      // document 예시
      Doc1: "MongoDB is a NoSQL database."
      Doc2: "MongoDB supports full-text search."
      ```
    - 생성된 역색인 <br/>

      | **단어/토큰**    | **Document _id**    |
      |-----------------|---------------------|
      | MongoDB         | [Doc1, Doc2]        |
      | is              | [Doc1]              |
      | a               | [Doc1]              |
      | NoSQL           | [Doc1]              |
      | database        | [Doc1]              |
      | supports        | [Doc2]              |
      | full-text       | [Doc2]              |
      | search          | [Doc2]              |
3. 어떤 단어를 검색했을때 역색인 테이블을 이용하여 _id를 빠르게 찾을 수 있음.
<br/>

### 인덱스 생성 방법

#### 단일 필드 인덱스 생성
1. MongoDB 접속 > Collection 선택
2. Indexs 탭 > Create Index 선택
3. 어떤 필드를 인덱스로 만들지 정하기
    ```json
    // document 키 이름: 타입(문자면 text, 숫자면 1(오름차순) 또는 -1(내림차순))
    {
      title: "text"
    }
    ```
4. confirm

#### Search Index 생성
1. MongoDB 접속 > Collection 선택
2. Atlas Search 탭 선택
3. Create Search Index 선택
4. 아래 내용 참고하여 입력
  - Index Name: title_index
  - Database and Collection: forum > post
5. Next
6. Refine Your Index 선택
7. 아래 내용 참고하여 입력/선택
  - Dynamic Mapping: disabled
  - Index Analyzer: Lucene.Korean
  - Search Analyzer: Lucene.Korean
  - field Mappings
    - Filed Name: title
    - Data Type: String
8. Save Changes > Create Search Index
9. 테스트: 인덱스 옆의 QUERY 버튼 눌러서 검색 테스트 가능 (검색결과가 더 매칭이 잘 될 수록 Score 높아짐)
<br/>

### 인덱스를 활용하여 검색
.find() 대신에 .aggregate() 사용
```js
// (server.js)

app.get('/search', async (요청, 응답) => {
let 검색조건 = [
  {$search : {
    index : '사용할 인덱스 이름',
    text : { query : '검색어', path : '검색할 필드이름' }
  }},
  { $sort : { _id : 1 } },            // _id로 오름차순
  { $limit : 10 },                    // 10개만 가져와라
  { $project : { 제목 : 1, _id : 0 } } // 원하는 필드값만 가져와라: '제목' 필드는 가져오고 '_id' 필드는 안가져옴

  let result = await db.collection('post').aggregate(검색조건).toArray()
  응답.render('search.ejs', { 글목록 : result })
}) 
```

### 성능평가/실행계획 확인
쿼리가 인덱스를 사용하는지 확인하려면 explain() 메서드를 사용
- COLLSCAN: 컬렉션 전체를 스캔(인덱스를 사용하지 않음)
- TEXT_MATCH/IXSCAN: 인덱스 스캔(인덱스를 사용함)
  ```js
  // explain('executionStats')
  db.collection().find( { title : '안녕' } ).explain('executionStats')
  db.collection().find( { $text : { $search: '안녕' } } ).explain('executionStats')
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
1. 클라이언트(예: 브라우저, 앱, Postman)가 정해진 형식에 맞춰서 [HTTP 요청(Request)](#서버-요청-http-request)을 하면,
2. [라우터](#라우팅)는 요청의 URL과 Method를 기반으로 요청을 처리할 핸들러를 결정하고,
3. 서버가 요청을 처리한 후,
4. 요청 처리에 따라 클라이언트에게 [응답(HTTP Response)](#서버-응답-http-response)
<br/>

## `RESTful API` 디자인 패턴
`클라이언트와 서버 간 통신을 간단하고 일관되며 확장 가능`하게 만들기 위한 디자인패턴 또는 아키텍쳐 스타일. RESTful API는 HTTP 프로토콜을 기반으로 하고, 요청과 응답을 구조화하는데 초점을 맞춤.
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
- 동사보다는 명사위주로: `리소스(데이터) 중심`으로 설계 ex) /users: 사용자 데이터를 의미
- 띄어쓰기는 언더바(_)대신 `대시(-)` 기호
- 파일 확장자 쓰지 말기
- 하위 문서를 뜻할 땐 `/`를 기호를 사용함(단 마지막에는 `/`를 포함하지 않음)
- 행위를 포함하지 않음 ex) delete-article => article
<br/>
<br/>

# 라우팅
클라이언트에서 서버로 요청(Request)이 들어오면, 어떤 요청을 어떻게 처리할지 결정. 

## Node.js에서의 라우팅 설정
`Express`와 `method-override` middleware를 사용하여 라우팅 설정 가능
 - [app.get()](#appget): 데이터 조회
 - [app.post()](#apppost): 데이터 생성
 - [app.put()](#appput): 데이터 전체 수정
 - [app.patch()](#apppatch): 데이터 일부 수정
 - [app.app.delete()](#appdelete): 데이터 삭제
<br/>
<br/>

# API들 다른 파일로 분리
코드가 너무 길어지면 유지보수와 가독성을 위해 파일을 분리하는 것이 중요함.

## 파일 분리 대상
### 1. 라우트 (Routes)
- API 엔드포인트를 처리하는 로직.
- 각 리소스(예: 유저, 상품, 주문 등)별로 라우트를 나눔.<br/>
<br/>

### 2. 컨트롤러 (Controllers)
- 라우트에서 호출되는 비즈니스 로직.
- 요청을 처리하고 응답을 반환.<br/>
<br/>

### 3. 서비스 (Services)
- 데이터베이스 쿼리나 외부 API 호출 같은 비즈니스 로직을 담당.
- 재사용성이 높은 로직을 포함.<br/>
<br/>

### 4. 모델 (Models)
- 라우터가 분리되어있다면, 라우터 안의 로직을 짤 때 DB 연결하는걸 계속 반복할 순 없으니 분리하여 갖다씀.
- 데이터베이스와 상호작용하는 로직(예: Mongoose, Sequelize).<br/>
<br/>

### 5. 미들웨어 (Middleware)
- 인증, 권한 확인, 로깅 등 공통 작업.<br/>
<br/>

### 6. 설정 (Config)
- 환경 변수, 데이터베이스 설정, 외부 API 키.<br/>
<br/>

### 7. 유틸리티 (Utils/Helpers)
- 자주 사용하는 공통 함수(예: 날짜 포맷, 문자열 처리).<br/>
<br/>

## 파일 구조
```json
project/
│
├── server.js                // 서버 초기화 코드
├── routes/                  // 라우트 정의
│   ├── shopRoutes.js
│   ├── productRoutes.js
│   └── index.js             // 라우트 통합: 여기서 router를 전부 등록하고 server.js에서는 index.js만 import
├── controllers/             // 컨트롤러
│   ├── userController.js
│   └── productController.js
├── services/                // 서비스 로직
│   ├── userService.js
│   └── productService.js
├── models/                  // 데이터베이스 모델
│   ├── userModel.js
│   └── productModel.js
├── middlewares/             // 공통 미들웨어
│   ├── authMiddleware.js
│   └── errorMiddleware.js
├── config/                  // 설정
│   ├── dbConfig.js
│   └── envConfig.js
├── utils/                   // 유틸리티 함수
│   └── dateUtils.js
└── package.json

```

## 분리방법
### 1. 라우트 분리
```js
// (../routes/shopRoutes.js)

// 1. Router 객체 생성
const router = require('express').Router();


// 2. Route의 'app'을 전부 다 'router'로 변경
// 2-1. 사용자 목록 가져오기
router.get('/', (req, res) => {
  res.send('Get all users');
});

// 2-2. 사용자 생성
router.post('/', (req, res) => {
  res.send('Create a user');
});

// 2-3. 사용자 삭제
router.post('/:id', (req, res) => {
  res.send(`Delete user with ID ${req.params.id}`);
});


// 3. 이 라우터를 다른 파일에서 사용할 수 있도록 내보내기
module.exports = router;
```

```js
// (server.js)

// require('./routes/userRoutes'): userRoutes 가져오기
// app.use('/users', 라우트): 사용자 관련 라우트 등록
// 라우트 등록할때 '/users' 라고 했므로 uerRoutes 에서는 '/users'은 생략하고 URI 작성 
app.use('/users', require('./routes/userRoutes'));
```

### 2. 컨트롤러 (Controllers)
<br/>

### 3. 서비스 (Services)
<br/>

### 4. 모델 (Models)
```js
// (database.js)

// 1. DB 설정
const { MongoClient } = require('mongodb');
const url = process.env.DB_URL;
let connectDB = new MongoClient(url).connect();

// 2. DB 연결부분 export
module.exports = connectDB; 
```

```js
// (server.js)

// 1. database.js 불러오기
let connectDB = require('./database.js');

// 2. MongoClient().connect() 이걸 connectDB로 변경
let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  app.listen(process.env.PORT, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })
}).catch((err)=>{
  console.log(err)
}) 
```

```js
// (../routes/shopRoutes.js)

// 1. database.js 불러오기
let connectDB = require('./../database.js');

let db
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum');
}).catch((err)=>{
  console.log(err)
}); 

// 2. Route의 'app'을 전부 다 'router'로 변경
// 2-1. 사용자 목록 가져오기
router.get('/', async (req, res) => {
  let result = await db.collection('post').find().toArray();
  res.render('user.ejs', {글목록: result});
});
```
<br/>

###  5. 미들웨어 (Middleware)
<br/>

### 6. 설정 (Config)
<br/>

### 7. 유틸리티 (Utils/Helpers)

<br/>
<br/>

# 서버 요청 (HTTP Request)
HTTP Request는 3가지 부분으로 나뉜다:
- Start line: [HTTP Method](#http-method), [HTTP URL](#http-url), HTTP version
- Header: [HTTP Header](#http-header)
- Body: Request가 전송하는 데이터를 담고 있는 부분 

## HTTP Request 구조
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

## 서버 요청 방법
### 서버에 요청하는 법
- **주소창**: 단순 `GET` 요청.
- **Form 태그**: 데이터와 같이 서버 요청. but, 서버에서 처리하고 `페이지 전체를 응답하므로 페이지의 새로고침` 일어남.
- **AJAX**: 데이터와 같이 서버 서버 요청. 서버에서 처리하고 `데이터만을 응답하므로 페이지 새로고침 없음`. ([참고](https://github.com/Narae-H/study-javascript?tab=readme-ov-file#%EC%84%9C%EB%B2%84%EC%97%90-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%9A%94%EC%B2%AD-ajax))

### 서버 요청 시 데이터 전달하는 법
- **URL Parameter**: 클라이언트가 서버로 데이터를 전달할 때 `URL 중간 또는 끝`에 데이터를 넣어 전달하는 방식으로, 글 상세페이지처럼 같이 `HTML 레이아웃을 공유하나 내용만 각기 다른 경우 특정 리소스를 식별`하기 위해 사용
  ```URL
  GET /users/123
  ```
  ```js
  app.get('/users/:id', (req, res) => {
      const userId = req.params.id; // URL 파라미터 추출
      res.send(`User ID: ${userId}`);
  });
  ```
- **Query String**: 클라이언트가 서버로 데이터를 전달할 때 `URL의 끝에 ? 기호를 사용하여 키=값 형태로 데이터를 추가`하는 방식입니다. 주로 필터링, 검색, 정렬 등의 목적을 위해 사용
  ```URL
  GET /search?query=Node.js&page=2&sort=asc
  ```
  ```js
  app.get('/search', (req, res) => {
      const query = req.query.query; // "Node.js"
      const page = req.query.page;  // "2"
      const sort = req.query.sort;  // "asc"
      
      res.send(`Query: ${query}, Page: ${page}, Sort: ${sort}`); // Query: Node.js, Page: 2, Sort: asc
  });
  ```
- **Request Body**: `fetch()메소드`를 통해서 요청 시 데이터를 전달하는 방식으로 데이터가 URL처럼 밖으로 드러나지 않음. FormData를 받아와서 body로 전달도 가능. 
  ```js
  const url = "https://example.com/api/users";
  const data = {
    name: "John Doe",
    age: 30,
  };

  fetch(url, {
    method: "POST", // HTTP 메소드
    headers: { "Content-Type": "application/json" }, // 요청 데이터 형식
    body: JSON.stringify(data), // 데이터를 JSON 문자열로 변환하여 전달
  })
    .then(response => {
      if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json(); // 응답 데이터 JSON 파싱
    })
    .then(data => {
      console.log("Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });
  ```
<br/>
<br/>

# 서버 응답 (HTTP Response)
HTTP Response는 Request와 동일하게 3가지 부분으로 나뉜다:
- Status Line
- Header
- Body

## 서버 응답 코드(HTTP Response)
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
<br/>

# 회원가입 & 로그인 기능
회원만 글을 볼 수 있게 하고 싶다면, 회원가입과 로그인 기능이 필요. 
 - 회원가입: 유저가 가입하면 아아디/비번을 DB에 저장해 둠.
 - 로그인: 유저가 로그인 시 아이디/비번을 서버로 보내고, 일치하다면 서버는 입장권을 발급해줌.

## Session 방식
`DB에서 사용자 인증 정보`를 저장하고 브라우저에게 Session ID를 쿠키로 전달하는 방식

### 방법
**로그인할 때:**
1. 유저가 로그인을 하면 DB에 유저의 아이디, 로그인 날짜, 유효기간, Session id를 기록
2. 유저에게 입장권을 발급해줄 때 입장권에 Session id만 적어서 보냄

**로그인이 필요한 기능을 요청할 때:**
1. 유저가 GET/POST 요청 시 입장권을 서버에 제출
2. 입장권에 써있는 session id를 가직 DB를 조회해본 다음 DB기록에 별 이상이 없으면 GET/POST 요청을 진행시켜 줌.

### 장단점
- 장점: GET/POST 요청할 때 마다 DB를 조회해보기 때문에, 하나하나의 요청마다 엄격하게 유저를 체크
- 단점: 그 만큼 DB 부담이 많아짐. 유저가 많은 사이트들은 조금 더 빠른 Redis같은 DB를 사용하기도 함.
<br/>

## Token 기반 인증 방식 (JWT)
클라이언트가 인증 후 서버에서 발급한 토큰을 `브라우저의 localStorage 또는 sessionStorage에 저장`하고 요청이 들어오면 HTTP 헤더에 토큰을 포함하여 전달하는 방식

**로그인할 때:**
1. 유저가 로그인을 하면, 
2. 유저에게 입장권을 발급해줄 때 입장권에 `유저의 아이디, 로그인 날짜, 유효기간`등을 적어두고 암호화해서 보냄(DB 저장X)

**로그인이 필요한 기능을 요청할 때:**
1. 유저가 GET/POST 요청 시 입장권을 서버에 제출 (입장권은 위변조 힘듬)
2. 유저가 입장권을 제출하면 유효기간에 별 이상 없으면 통과

### 장단점
- 장점:  GET/POST 요청할 때 마다 DB를 조회할 필요가 없어서(Stateless) DB 부담이 적음. 유저가 매우 많거나 마이크로서비스형태로 서버를 많이 운영하는 사이트들이 즐겨씀.
- 단점: 토큰이 클라이언트에 저장되므로 보안에 취약(XSS, CSRF공격), 토큰이 유효기간 동안 유효화 되므로 누군가 특저 이벤트(누군가 훔쳐감)로 중간에 만료시키기 어려움.
<br/>

## oAuth (Open Authorization)
`제 3자 인증서비스`(ex: 구글, 페이스북)을 통해 인증. 흔히 소셜로그인이라 불림.

**로그인이 필요한 기능을 요청할 때:**
1. 유저가 B사이트에서 구글 로그인 버튼을 누르면 구글 계정으로 로그인하라고 뜨는데 로그인
2. "B 사이트로 유저 개인정보 전송해도 되냐"고 구글이 물어봄
3. 유저가 허락하면 허락했다고 구글 -> B서버 이렇게 알림을 전송 
4. 알림이 도착하면 B서버는 구글에게 유저 정보를 요청해서 받아옴.

### 장단점
- 장점: 사용자 비밀번호를 직접 저장하거나 처리하지 않아도 됨. 여러 어플리케이션에서 동일한 계정으로 로그인 가능(SSO)
- 단점: 구현이 복잡하고, 제 3자에게 서비스 의존.
<br/>

## Session VS JWT VS OAuth

|<center>**구분**</center>|<center>**Session**</center>|<Center> **Token (JWT)**</center>| <center>**OAuth**</center>|
|--------------|------------------------|---------------------------|--------------------------|
| **저장 위치** | 서버                    | 클라이언트                 | 제3자 서비스               |
| **상태 관리** | Stateful               | Stateless                 | Stateless                | 
| **인증 방식** | 쿠키(Session ID) 사용   | HTTP 헤더에 토큰 포함       | 승인 코드 및 액세스 토큰     |
| **보안 고려** | 서버 보안에 강점         | 클라이언트 보안 중요         | 제3자 서비스 의존          |   
| **적합 환경** | 전통적 웹 애플리케이션    | API 중심, 분산 시스템       | SSO 또는 제3자 서비스 사용  |
| **사용 사례** | 단일 서버 기반 애플리케이션| RESTful API, 웹/모바일 혼합| SNS 연동 로그인, SSO 서비스 |
<br/>

## 라이브러리
- [Passport.js](#passport)
<br/>
<br/>

# Passport
- Node.js 환경에서 로그인 기능 구현 시 직접 코드짜기 귀찮기 때문에 쓰는 라이브러리. 
- session, JWT, OAuth 중 원하는 방식으로 자유롭게 사용 가능.

## Session 방식
### 원리
1. **회원가입**
2. **로그인**
    - 유저가 로그인하면 DB에 있는거랑 일치하는지 확인하고 일치하면 세션(유저 + 유효기간) document 생성.
    - 세션 document의 _id 같은걸 가져와서 유저 쿠키에 강제 저장.
3. **인증**: 유저가 로그인이 필요한 페이지 같은ㄴ거 방문할 때 마다 서버는 유저가 제출한 쿠키 확인. _id와 유효기간 확인하고 페이지로 이동

### 설치
    ```sh
    # passport: 회원인증 도와주는 메인라이브러리
    # passport-local: 아이디/비번 방식 회원인증쓸 때 쓰는 라이브러리
    # express-session: 세션 만드는거 도와주는 라이브러리
    npm install express-session passport passport-local 

    # 비번 해싱(암호화) 라이브러리. 해싱된 문자보고 원래 문자 유추 불가능.
    # 해싱: 어떤 문자를 다른 랜덤한 문자로 바꾸기 ex. SHA3-256, SHA3-512, bcrypt, scrypt, argon2
    npm install bcrypt

    # Session을 MongoDB에 저장해주는 라이브러리
    npm install connect-mongo 
    ```

### 코드 작성
**1. 회원가입** <br/>

```html
<!-- register.ejs -->

  <form class="form-box" action="/register" method="POST">
  <h4>회원가입</h4>
  <input type="text" name="username">
  <input type="text" name="password">
  <button type="submit">회원가입</button>
</form> 
```

```js
/** server.js */

// 모듈 불러오기
const bcrypt = require('bcrypt'); // password encryption

// 회원가입 페이지 이동
app.get("/register", (req, res)=> {
  res.render("register.ejs");
}) 

// 회원가입
app.post("/register", async (req, res) => {
  // 비번은 bcrypt 라이브러리 이용하여 해싱
  // bcrypt.hash("해싱하고싶은문자", "얼마나꼬아줄지")
  // 해시결과 = salt + hash
  // salt: 그냥 해싱하는게 아니라 뒤에 붙는 랜덤문자열
  // pepper: 더 보안을 높히기 위해 salt를 비번 옆에 함께 보관하는게 아니라 별도의 DB나 하드웨어에 보관하는 방법

  // sessions라는 DB에 _id, expires, session 정보 자동 저장됨.
  let hashedPW = await bcrypt.hash(req.body.password, 10); 

  // db에 username과 암호화된 password 저장
  await db.collection("user").insertOne({
    username: req.body.username, 
    password: hashedPW
  });

  res.redirect("/login");
})
```

**2. 로그인** <br/>

```html
<!-- login.ejs -->

<body class="grey-bg">
  <%- include('nav.ejs') %>

  <form class="form-box" action="/login" method="POST">
    <h4>로그인</h4>
    <!-- passport 라이브러리를 쓰기 위해서는 input 태그에 name을 'username', 'password'로 작성 -->
    <input type="text" name="username">
    <input type="password" name="password">
    <button type="submit">로그인</button>
  </form> 

</body>
```

```js
// server.js

// 1. Import required modules to login
const session = require('express-session');      // 세션 관리 미들웨어
const passport = require('passport');            // 인증 미들웨어 
const LocalStrategy = require('passport-local'); // 로컬 전략을 정의하는 미들웨어(아이디와 비번을 DB와 비교)

// 2. Set global middleware: session settings
// session(): 언제 어떻게 세션을 만들지 정함
//  - secret: 세션 암호화를 위한 비밀 키. 반드시 보인에 유의해야 함. 
//  - resave: 유저가 요청할 때 마다 session을 다시 저장할지 여부 (false 추천)
//  - saveUninitialized: 로그인하지 않은 사용자의 세션도 저장할지 여부 (false 추천) 
//  - cookie: 세션 유효기간 설정. 밀리세컨드 단위. default: 2주
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false, 
  saveUninitialized : false,
  cookie : { maxAge : 60 * 60 * 1000 } // 1시간
}))

app.use(passport.initialize()); // Passport 초기화
app.use(passport.session());    // 세션을 통한 사용자 인증을 처리

// 3. LocalStrategy 설정: 아이디/비번이 DB와 일치하는지 전략을 생성하는 객체
// cb: 콜백함수로 인증 결과를 반환.
//  - cb(null, false): 인증 실패
//  - cb(null, user): 인증성공 (사용자 정보를 반환)
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }

  // bcrypt.compare()를 이용하여 입력한비번과 db의 비번을 비교
  if ( await bcrypt.compare(입력한비번, result.password)) {
    return cb(null, result); // 로그인 성공
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}));

// 4. 세션 생성: 로그인 성공할 때마다
// 유저가 로그인 성공할때 호출되며 세션에 저장할 정보를 설정
//   - user: 인증 성고한 사용자 객체
//   - done: 세션에 저장할 데이터를 반환하는 콜백함수
passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username }); // 사용자의 ID와 username을 세션에 저장
  })
})

// 5. 세션 검증: 디폴트는 유저가 뭔가 서버로 요청할 때마다 실행(항상 세션검증이 필요한건 아니니깐 특정 route에서만 실행시킬 수도 있음)
// 세션에 저장된 정보를 바탕으로 실제 사용자 데이터를 복원. 너무 오래된 세션이라면 변질되었을 수도 있으니깐
//  - user: serializeUser에서 저장한 세션 데이터(ID, username)
//  - done: 복원된 사용자 데이터를 반환하는 콜백함수
passport.deserializeUser( async (user, done) => {
  // 5-1) 세션에서 복원된 사용자 ID로 DB를 조회
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password; // 비밀번호는 보안상 삭제

  // 5-2) 사용자의 유저정보 반환
  process.nextTick(() => {
    return done(null, result); // 쿠키 이상 없으면 유저 정보 반환
  })
})

// 4. 랜더링
// 4-1. 로그인 페이지
app.get("/login", (req, res) => {
  res.render("login.ejs");
})

// 4-2. 로그인
// passport.authenticate('local', (err, user, info) => {}): LocalStrategy를 사용해 로그인 요청 검증.
//  - err: 서버에서 발생한 에러
//  - user: 인증 성공 시 반환된 사용자 객체
//  - info: 인증 실패 시의 메시지
app.post("/login", async (req, res, next) =>{
  // 위에서 만든 LocalStrategy에 따라 검증 시행
  passport.authenticate('local', (error, user, info) => {
    if(error) return res.status(500).json(error);        // 서버 에러
    if(!user) return res.status(401).json(info.message); // 로그인 실패: user가 null임
    
    // 로그인 성공: 인증 성공 후 세션에 사용자의 정보를 저장
    res.login(user, (err) => {
      if(err) return next(err); // 세션 저장 중 에러 처리
      res.redirect('/');        // 메인 페이지로 리다이렉트
    })
  })(req, res, next);
});
```

**3. 세션정보 확인**: 쿠키에 session이 저장되었는지 확인 <br/>
개발자도구(F12) > Application 탭 > Cookies 메뉴 > connect.sid 있나 확인

**4. 세션을 DB에 저장** <br/>
session을 컴퓨터 메모리에 임시 저장하면 서버가 재시작되면 다시 로그인해야함.
이를 방지하기 위해 `connect-mongo`라는 라이브러리 활용하여 DB에 session을 저장함.

```js
/** server.js */

// connect-mongo 사용하면 forum(내 DB)안에 sessions라는 컬렉션을 만들어서 거기서 세션 관리해줌.
// 유효기간이 지나면 자동으로 삭제해줌.
const MongoStore = require('connect-mongo');

app.use(session({
  resave : false,
  saveUninitialized : false,
  secret: '세션 암호화 비번~~',
  cookie : {maxAge : 1000 * 60},
  store: MongoStore.create({
    mongoUrl : '님들 DB접속용 URL~~',
    dbName: 'forum', //이 DB안에 session저장
  })
})) 
```
<br/>
<br/>

# 환경변수
- 유저나 컴퓨터에 따라서 좀 달라져야 하는 가변적인 변수 ex. 세션 암호화 비번, DB접속용 URL 등.
- 환경변수들은 소스코드 공유할 때 비번 유출같은걸 막기 위해서 서버파일에 하드코딩해놓는것보다 따로 별도의 파일에 보관하는것이 좋음.

## 설치
```sh
npm install dotenv
```

## 사용법
1. 프로젝트 root 경로에 `.env` 파일 생성 <br/>
    project/ <br/>
    ├── public/ <br/>
    │   ├── css/ <br/>
    │   │   └── style.css <br/>
    │   └── js/ <br/>
    │       └── script.js <br/>
    ├── views/ <br/>
    │   └── index.ejs <br/>
    ├── server.js <br/>
    ├── `.env` <br/>
    └── .gitignore <br/>
<br/>

2. `.env` 파일 작성
```json
// .env

// 변수명=변수에저장할값 
PORT   = 8080
DB_URL = "DB URL~~~~~"
```
<br/>

3. `server.js` 파일에서 갖다 쓰기: `process.env.변수명`
```js
// server.js

require('dotenv').config();

//  중략

app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : 60 * 60 * 1000 }, 
  store: MongoStore.create({
    mongoUrl : process.env.DB_URL,      // process.env.변수명
    dbName: 'forum',
  })
}))
```

4. Git에 업로드 안되도록 설정
```json
// .gitignore

.env
```
<br/>
<br/>

# 미들웨어
`요청(Request)과 응답(Response)사이`에 자동으로 실행되는 함수로, next()를 호출하여 다음 미들웨어로 요청을 전달하는 `체인구조`를 가지고 있음.

## 주요 용도
- 로그작성
- 보안: 인증 및 권한 부여 작업
- 데이터처리: 요청 데이터를 파싱하거나 유효성 검사
- 에러처리

## 사용법
- 함수의 끝에는 `next()`를 호출해야 함. next()를 호출하지 않으면 요청이 멈추므로 반드시 호출하거나 응답을 끝내야 함.
- `순서` 중요. 먼저 등록된 미들웨어가 먼저 실행됨.

### 기본 사용
- app.get("URL", `함수`, (요청, 응답) => { })
    ```js
    // 1. 간단한 미들웨어 함수 정의
    const logger = (req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next(); // 다음 미들웨어로 이동
    };

    // 2. app.get()의 두번째 파라미터로 함수 이름 작성 
    app.get('/URI', logger, (req, res)=>{
    })
    ```

- app.get("URL", `(요청, 응답, next) => {}`,  (요청, 응답) => {})
    ```js
    // 1. app.get()의 두번째 파라미터에 함수 바로 작성 
    app.get('/URI',(req, res, next) => { }, (req, res)=>{
    })
    ```

### 미들웨어 여러 개를 실행하고 싶을 때: []
```js
// 1. 간단한 미들웨어 함수 정의
const mw1 = (req, res, next) => {
  console.log('middleware1');
};
const mw2 = (req, res, next) => {
  console.log('middleware2');
};
const mw3 = (req, res, next) => {
  console.log('middleware3');
};

// 2. app.get()의 두번째 파라미터로 함수 이름들을 작성 
app.get('/URI', [mw1, mw2, mw3], (req, res)=>{
})
```

###  일괄적용: app.use()
  - 모든 라우터에 미들웨어 실행
    ```js
      // 1. 간단한 미들웨어 함수 정의
      // 1-1) 커스텀미들웨어
      const logger = (req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
        next(); // 다음 미들웨어 또는 라우트로 이동
      };

      // 1-2) 에러 처리 미들웨어 (특수한 형태)
      app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
      });

      // 2. 전역 미들웨어로 적용
      app.use(logger);

      // 3. 요청 처리 핸들러
      app.get('/', (req, res) => {
        res.send('Hello, Middleware!');
      });
      ```

<br/>

- 일부 라우터에 미들웨어 일괄 실행
    ```js
    // 1. 미들웨어 정의
    const logger = (req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next(); // 다음 미들웨어 또는 라우트로 이동
    };

    // 2. 특정 URL에만 미들웨어 적용
    // /admin으로 들어오거나 또는 /admin/주소, /admin/주소/주소 등 하위 URL 에서만 미들웨어 실행
    app.use('/admin', logger);

    // 3. 라우트 핸들러
    // logger 미들웨어 실행 X
    app.get('/', (req, res) => {
      res.send('Home Page');
    });

    // logger 미들웨어 실행 O
    app.get('/admin', (req, res) => {
      res.send('Admin Dashboard');
    });

    // logger 미들웨어 실행 O
    app.get('/admin/settings', (req, res) => {
      res.send('Admin Settings');
    });
    ```
<br/>
<br/>

# 이미지 업로드 (AWS S3)
AWS S3은 파일 저장용 클라우드로 이미지 파일 올리는것 설정 가능.

## 필요한 정보 설정
### 1. AWS 가입
회원 가입 및 카드 정보 등록

### 2. IAM 사용자 생성 및 Access Key 발급
서버 파일에서 코드짤 때 AWS의 `access key`가 필요하므로 사용자 생성 필요. 
  1) [IAM](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-southeast-2#/home) 접속
  2) Access management 밑의 Users 메뉴 선택
  3) Create user` 선택
  4) User name`에 사용자 이름 자유롭게 입력
  5) Permissions options는 Attach policies directly 선택
  6) Permissions policies는 AmazonS3FullAccess 선택
  7) Next > Create User
  8) 생성된 유저 선택
  9) Summary 섹션 ARN 복사하여 보관 > Create access key 선택
  10) Local code 선택
  11) Next
  12) Access Key 랑 Secret access key 다운로드
  13) Done

### 3. S3 설정
  1) [S3](https://ap-southeast-2.console.aws.amazon.com/s3/home?region=ap-southeast-2) 접속
  2) Create bucket 선택
  3) Bucket name 작성 (Bucket name은 남과 겹치면 안됨)
  4) Object Ownership: ACLs disabled 선택
  5) Block Public Access settings for this bucket: 모두 차단해제
  6) Create bucket
  7) 생성한 bucket 선택
  8) Permissions 탭 선택(권한 설정: bucket policy 또는 ACL로 설정가능한데, ACL은 옛날 방식으로 bucket policy로 설정하도록 권장)
  9) Bucket policy > Edit
  10) 아래 코드 붙여넣기(내버킷명, 내ARN은 부분은 수정필요) > 저장

      ```json
      {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Sid": "1",
                  "Effect": "Allow",
                  "Principal": "*",         // 모든사람
                  "Action": "s3:GetObject", // 자료 읽기
                  "Resource": "arn:aws:s3:::내버킷명/*"
              },
              {
                  "Sid": "2",
                  "Effect": "Allow",
                  "Principal": {         // 유저 명시: IAM 사용자
                      "AWS": "내ARN"     
                  },
                  "Action": [
                      "s3:PutObject",    // 자료 추가
                      "s3:DeleteObject"  // 자료 삭제
                  ],
                  "Resource": "arn:aws:s3:::내버킷명/*"
              }
          ]
      } 
      ```

  11) CORS(어떤 도메인에서 이 버켓에 있는 이미지를 갖다 쓸 수 있는지) 선택 > 아래 코드 붙여넣기
      ```json
      [
          {
              "AllowedHeaders": [
                  "*"
              ],
              "AllowedMethods": [
                  "PUT",   // 자료 추가
                  "POST"   // 자료 쓰기
              ],
              "AllowedOrigins": [
                  "*"      // 위의 mothods를 쓸 수 있는 사이트 주소 
              ],
              "ExposeHeaders": [
                  "ETag"
              ]
          }
      ] 
      ```
<br/>

## 이미지 업로드 기능 구현
웹페이지에서 AWS S3로 이미지 업로드하는 기능구현

### 설치
Express.js에서 파일 업로드를 처리하는 미들웨어인 `Multer` 사용

```sh
# multer: 파일업로드 처리
# multer-s3: multer와 AWS S3를 연동하기 위한 저장소 엔진
# @aws-sdk/client-s3:  AWS 서비스와 통신하기 위한 공식 JavaScript 라이브러리. AWS S3뿐만 아니라, EC2, DynamoDB, Lambda 등 거의 모든 AWS 서비스를 제어하고 상호작용 가능
npm install multer multer-s3 @aws-sdk/client-s3 
```

### 코드작성
```html
<!-- write.ejs -->

 <!-- 
   1) <form></form> 태그에 enctype="multipart/form-data" 설정
   2) <input type="file" name="img1" accept="image/*"> 태그 설정
 -->
<form class="form-box" action="/add" method="POST" enctype="multipart/form-data">
  <h4>글쓰기</h4>
  <input type="text" name="title">
  <input type="text" name="content">
  <input type="file" name="img1" accept="image/*">
  <button type="submit">전송</button>
</form> 
```

```js
// server.js

// 1. multer 설정
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

// 2. AWS S3 설정
const s3 = new S3Client({
  region : '내 리전',
  credentials : {
      accessKeyId : 'IAM에서 발급받은 액세스키',
      secretAccessKey : 'IAM에서 발급받은 시크릿키'
  }
});

// 3. Multer-S3 설정
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: '내버킷이름',
    key: function (요청, file, cb) {
      cb(null, Date.now().toString()_file.originalname) // 업로드시 파일명
    }
  })
})

// 4. 파일 업로드 라우트
// 방법1 : app.get()의 두번째 파라미터로 호출
//   upload.single('input의name속성이름'): 1개 업로드 
//   upload.array('input의name속성이름', 최대이미지갯수): 2개 이상 업로드
app.post('/upload1', upload.single("img1"), (req, res)=> {
  res.send({ message: 'File uploaded successfully', url: req.file.location });

  // 파일 업로드했을 때 주소(req.file.location)를 DB에 저장해둬야 나중에 이미지 꺼내쓸 수 있음. 
  // 여러개의 파일을 업로드한다면 document에 array형식으로 저장가능
})

// 방법2 : app.get()의 콜백함수 안에서 호출. 장점은 에러 처리 가능 
app.post('/upload2', (req, res) => {
    upload.single('img1')(req, res, (err)=>{
      if (err) return 응답.send('에러남');
      console.log('이미지 업로드 성공함~~~');
    })
}) 
```
<br/>
<br/>

# AWS에 Node.js 서버 배포하기 (Elastic Beanstalk)
AWS Elastic Beanstalk을 이용하여 서버 배포하기

## DB 셋팅
AWS 컴퓨터가 MongoDB에 접속할 수 있도록 설정
1. [mongodb.com](Elastic Beanstalk) 접속
2. Security > Network Access 선택
3. IP Access List 탭 선택
4. IP Address: 0.0.0.0 입력 (모든 IP에서 접속 가능하도록)

## 코드 배포
### 1. 코드 압축
소스코드를 zip 파일로 압축 (node_modules는 안넣어도 됨)

### 2. AWS 접속
AWS 로그인 및 접속

### 3. IAM 생성
- `aws-elasticbeanstalk-ec2-role` 생성
  1) [IAM](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-southeast-2#/home) 접속
  2) Access management 밑의 Roles 메뉴 선택
  3) aws-elasticbeanstalk-ec2-role 역할이 있다면 아래는 안해도 됨.
  4) Permissions policies는 AWSElasticBeanstalkWebTier, AWSElasticBeanstalkWorkerTier, AWSElasticBeanstalkMulticontainerDocker 선택
  5) Next
  6) Role Name: aws-elasticbeanstalk-ec2-role 입력
  7) Create Role

- `aws-elasticbeanstalk-service-role` 생성
  1) [IAM](https://us-east-1.console.aws.amazon.com/iam/home?region=ap-southeast-2#/home) 접속
  2) Access management 밑의 Roles 메뉴 선택
  3) aws-elasticbeanstalk-service-role 역할이 있다면 아래는 안해도 됨.
  4) Permissions policies는 AWSElasticBeanstalkEnhancedHealth, AWSElasticBeanstalkService 선택
  5) Next
  6) Role Name: aws-elasticbeanstalk-service-role 입력
  7) Create Role

### 4. Elastic beanstalk 생성
환경마다 하나의 application을 실행해 둘 수 있는데 application은 프로젝트 버전 1개라고 생각하면 됨.
1) [Elastic beanstalk](https://ap-southeast-2.console.aws.amazon.com/elasticbeanstalk/home?region=ap-southeast-2#/) 접속
2) Create Application 선택
3) Application Name 자유롭게 입력 ex. testwebserver
4) Create new enviornment 선택
5) 설정하기
- Step1. Configure environment
  - Environment tier: Web server enviornment
  - Environment name: testwebserver-env
  - Platform: Node.js
  - Platform branch/Platform version: 자유롭게 선택
  - Application code: Upload your code
  - Version lable: version1.0
  - Local file 선택 > Choose file 해서 [1.코드압축](#1-코드-압축)에서 압축한 코드 올리기
  - Presets: Single Instance
- Step 2. Configure service access
  - Service role: Use an exsiting service role 선택 > aws-elasticbeanstalk-service-role 선택
  - EC2 Instance Profile: aws-elasticbeanstalk-ec2-role 선택
- Step 3. Set up networking, database, and tages(수정사항 없음) > Next
- Step 4. Configure instance traffic and scaling - optional 
  - Root Volumn Type: General Purpose3(SSD) 선택
  - Instance Types: t2.micro 또는 t3.micro 선택
6) Create

### 5. 접속확인
몇분 기다린 후 어쩌구.com 주소 뜨는데 거기 들어가면 접속 확인 가능

<br/>
<br/>

# 기타
## Node.js+Express 서버와 React 연동
- Node.js+Express: Back-end
- React: Front-end

### 설정 방법
1. [Node.js 프로젝트 생성](#설치-및-개발환경-설정)
2. [리액트 프로젝트 생성](https://github.com/Narae-H/study-react/tree/main/0-overview#%EC%84%A4%EC%B9%98-%EB%B0%8F-%EA%B0%9C%EB%B0%9C%ED%99%98%EA%B2%BD-%EC%85%8B%ED%8C%85)
3. 생성된 리액트 프로젝트 폴더를 Node.js 프로젝트 폴더 안으로 이동
    `nodejs_project` <br/>
    ├── node_modules <br/>
    ├── `react_project` <br/>
    ├── public <br/>
    ├── routes <br/>
    ├── views <br/>
    └── .env <br/>
    └── .gitignore <br/>
    └── index.html <br/>
    └── package-lock.json <br/>
    └── package.json <br/>
    └── server.js <br/>
<br/>

### 리액트로 만든 HTML 전송하는 법
Node.js 서버에다가 "누군가 메인페이지로 접속하면 리액트로 build한 index.html 보여주세요" 라고 하면 됨.
```js
// (Nodejs프로젝트의 server.js)

// 1. React 빌드 결과물에 있는 모든 정적 파일을 클라이언트가 요청할 때 마다 제공공
// express.static(): xpress에서 정적 파일(HTML, CSS, JavaScript 등)을 제공하기 위해 사용
app.use(express.static(path.join(__dirname, 'react-project/build')));

// 사용자가 브라우저에서 기본경로(/)로 접근할 경우, React의 index.html파일 반환
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/react-project/build/index.html'));
});
```

### 라우팅
서버에서 라우팅을 담당해줘도 되고 리액트에서 라우팅을 담당해줘도 됨.
### React에서 담당하는 경우
1. React 프로젝트에서 react-router-dom 설치하여 라우팅 코드 개발
2. Node 서버에다가 리액트가 라우팅 할것이라는걸 server.js에게 알려줌.
```js
// (server.js)

// 어떤 요청이 들어와도 리액트 프로젝트를 보여줘라.
// 주의사항: 이 코드는 항상 가장 하단에 놓여야 함.
app.get('*', function (요청, 응답) {
  응답.sendFile(path.join(__dirname, '/react-project/build/index.html'));
});
```

### Ajax 요청
아래의 코드를 넣어야 리액트와 Node.js 서버간 Ajax 통신 잘됨.

1. Node서버에 cors 설치
```sh
npm install cors
```

2. Node서버 코드 수정
```js
// (server.js)
app.use(express.json());    // 유저가 보낸 array/object 데이터를 출력해보기 위해 필요
var cors = require('cors'); // cors는 다른 도메인주소끼리 ajax 요청 주고받을 때 필요
app.use(cors());
```
<br/>
<br/>

# 서버와 클라이언트가 통신하는 법
## HTTP 요청
- **비유**: 편지
- **특징**
  - 클라이언트가 서버에 요청을 보낼 때 사용하는 방식 중 하나나
  - GET, POST와 같은 요청은 편지를 쓰듯 주소를 적고 내 정보(헤더 및 본문)를 기재해 전달해야 하는 번거로운 작업이 필요함.
- **장점**:
  - 구조가 간단하고 사용이 쉬움.
- **단점**:
  - 수동적 방식으로, 클라이언트가 요청을 해야 서버가 응답을 보냄.

## Server Sent Event (SSE)
- **비유**: 라디오
- **특징**:
  - 클라이언트가 서버에 연결을 한 번만 열어두면, 서버가 필요한 시점에 데이터를 클라이언트로 전송할 수 있음.
- **장점**:
  - 실시간 데이터 전달에 적합하며 가볍고 효율적임.
- **단점**:
  - 단방향 통신(서버 → 클라이언트)만 가능

## Websocket
- **비유**: 전화
- **특징**:
  - 서버와 클라이언트 간 양방**향 통신이 가능함.
  - 가벼우며 빠른 응답 속도로 실시간 데이터 처리에 적합(예: 채팅 기능).
- **장점**:
  - 유연한 양방향 데이터 전송.
- **단점**:
  - 초기 설정 및 구현 과정에서 작성해야 할 코드가 많아 상대적으로 복잡함.

## Long Polling
- **비유**: 계속 전화를 걸어 응답을 기다리는 모습
- **특징**:
  - 클라이언트가 서버에 HTTP 요청을 보내고, 서버는 즉시 응답하지 않음.
  - 새로운 데이터가 생길 때까지 대기했다가 데이터를 보내는 방식.
- **장점**:
  - 서버에서 실시간으로 데이터를 받을 수 있음.
- **단점**:
  - 서버가 응답을 즉시 처리하지 않으면 메모리 누수 및 성능 문제가 발생할 수 있음.
  - 클라이언트의 요청을 계속 유지해야 하므로 서버 자원 소모가 크고, 대규모 트래픽 환경에서는 부하가 발생할 수 있음.

### 설치 및 기본 설정
#### 설치
```sh
npm i socket.io@4
```

#### 기본 설정
1. `server.js` 에서 websocket 설정
    ```js
    // (server.js);

    // 1. Import modules
    const { createServer } = require('http');
    const { Server } = require('socket.io');
    const server = createServer(app);
    const io = new Server(server); 

    // 2. app.listen()을 server.listen()으로 바꾸기
    server.listen(process.env.PORT, () => {
        console.log(`Server is running on http://localhost:${process.env.PORT}`);
    })

    // 3. 웹소켓 연결 시 특정 코드를 실행
    io.on('connection', (socket) => {
      console.log('websocket 연결됨');
    })
    ```

2. 웹소켓 사용을 원하는 html(ejs) 파일에도 socket.io 라이브러리 설치
    ```html
    <!-- (chatDetail.ejs) -->

    <script src="https://cdn.jsdelivr.net/npm/socket.io@4.7.2/client-dist/socket.io.min.js"></script>
    <script>
      const socket = io(); // 서버로 웹소켓을 연결
    </script>
    ```

### 데이터 통신 코드 구현
#### 1. 클라이언트가 데이터 전송 -> 서버에서 데이터 수신
- 클라이언트
  ```html
  <!-- (chatDetail.ejs) -->

  <script>
    // 클라이언트가 서버로 어떤 데이터를 웹소켓으로 전송
    // 클라이언트가 'age'라는 데이터 전송
    socket.emit('age', 20);
  </script>
  ```

- 서버
  ```js
  // (server.js)

  io.on('connection',(socket) => {

    // 클라이언트에게 받은 데이터 수신
    // 클라이언트가 'age'라는 이름으로 보낸 데이터 수신
    socket.on('age', (data) => {
      console.log('클라이언트가 보낸 데이터: ', data); // 클라이언트가 보낸 데이터: 20
    })
  }) 
  ```

#### 2. 서버에서 데이터 전송 -> 클라이언트에서 수신 (웹소켓이 연결된 모든 클라이언트) 
- 서버
  ```js
  // (server.js)

  // 서버가 'name'이라는 데이터 전송
  io.emit('name', 'kim');
  ```

- 클라이언트
  ```html
  <!-- (chatDetail.ejs) -->

  <script>
    // 서버가 'name'라는 이름으로 보낸 데이터 수신
    socket.on('name', (data) => {
      console.log('서버가 보낸 데이터: ', data); // 서버가 보낸 데이터: kim
    })
  </script>
  ```

#### 3. 서버에서 데이터 전송 -> 클라이언트에서 수신 (특정 room에만 데이터 전달) 
room(클라이언트가 입장할 수 있는 방) 이라는 걸 이용하여 특정 room에 있는 유저들에게만 메시지 전송.
유저를 룸에 넣는건 서버만 가능. <br/>
<br/>

- 서버
```js
// (server.js)

io.on('connection', (socket) => {
  // 생략...
  
  // 1. 룸 조인
  // 누군가 'ask-join'이라는 이름으로 메세지 보내면 룸에 조인시켜줌.
  socket.on('ask-join', (data) => {
    socket.join(data);
  }); 

  // 2. 클라이언트 -> 서버: 데이터 수신 + 받은 데이터 발송
  socket.on('message', (data)=> {
    // to(): 특정 room에 데이터 전달
    io.to( data.room ).emit( 'broadcast', data.msg );
  })
});

```

- 클라이언트
```html
<!-- chatDetail.js -->

<script>
  // 1. 특정 룸 조인
  // 특정 룸에 들어가기 위해서 'ask-join'이라는 데이터를 서버에 전송. 룸에 넣어달라고 물어봄
  socket.emit('ask-join', '1'); // 1번 룸에 들어가고 싶다고 요청

  // 2. 클라이언트 -> 서버: 데이터 발송 (룸번호 포함)
  // 전송 버튼 눌렀을 때, 서버로 메시지와 룸넘버 발송
  document.querySelector('.chat-button').addEventListener('click', () => {
    socket.emit('message', { msg: '반가워', room: 1});
  });

  // 3. 서버 -> 클라이언트: 데이터 수신
  socket.on('broadcast', (data) => {
    console.log('서버가 보낸 데이터: ', data); // 반가워
  });
 </script>
```

### 세션을 이용하여 로그인된 유저 정보 출력
```js
// (server.js)

const sessionMiddleware = session({
  secret: "changeit",
  resave: true,
  saveUninitialized: true,
});
app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
  const session = socket.request.session;

  console.log( session ); // session안에 유저 로그인 정보 있음: socket.request.session.passport.user.id
});
```
- <small>[참고사이트](https://socket.io/how-to/use-with-express-session)</small>






