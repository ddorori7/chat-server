const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// /A/ https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const express = require("express");
const app = express();

/* 교차 출처 리소스 공유(Cross-Origin Resource Sharing, CORS)는 
추가 HTTP 헤더를 사용하여, 
한 출처에서 실행 중인 웹 애플리케이션이 
다른 출처의 선택한 자원에 접근할 수 있는 권한을 부여하도록 
브라우저에 알려주는 체제입니다. 
웹 애플리케이션은 리소스가 자신의 출처(도메인, 프로토콜, 포트)와 다를 때 
교차 출처 HTTP 요청을 실행합니다 */
const cors = require("cors")({ origin: true });
app.use(cors);

const anonymousUser = {
  id: "anon",
  name: "Anonymous",
  avatar: "",
};

const checkUser = (req, res, next) => {
  req.user = anonymousUser;
  if (req.query.auth_token !== undefined) {
    let idToken = req.query.auth_token;
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedIdToken) => {
        let authUser = {
          id: decodedIdToken.user_id,
          name: decodedIdToken.name,
          avatar: decodedIdToken.picture,
        };
        req.user = authUser;
        next();
      })
      .catch((error) => {
        next();
      });
  } else {
    next();
  }
};

app.use(checkUser);

function createChannel(cname) {
  let channelsRef = admin.database().ref("channels");
  let date1 = new Date();
  let date2 = new Date();
  date2.setSeconds(date2.getSeconds() + 1);
  const defaultData = `{
        "messages" : {
            "1" : {
                "body" : "Welcome to #${cname} channel!",
                "date" : "${date1.toJSON()}",
                "user" : {
                    "avatar" : "",
                    "id" : "robot",
                    "name" : "Robot"
                }
            },
            "2" : {
                "body" : "첫 번째 메시지를 보내 봅시다..!!!!!!!",
                "date" : "${date2.toJSON()}",
                "user" : {
                    "avatar" : "",
                    "id" : "robot",
                    "name" : "Robot"
                }
            }
        }
    }`;
  channelsRef.child(cname).set(JSON.parse(defaultData));
  //  JSON.parse()란?
  //    -> parse 메소드는 string 객체를 json 객체로 변환시켜줍니다.
}

app.post("/channels", (req, res) => {
  let cname = req.body.cname;
  createChannel(cname);
  res.header("Content-Type", "application/json; charset=utf-8");
  res.status(201).json({ result: "ok" });
});

app.get("/channels", (req, res) => {
  let channelsRef = admin.database().ref("channels");
  /* 
  You can reference the root or child location in your Database 
  by calling 
  firebase.database().ref() or firebase.database().ref("child/path").
  Writing is done with the set() method and reading can be done with the on() method. 
  */

  /* 경로의 데이터를 읽고 변경사항을 수신 대기하려면 
  firebase.database.Reference의 
  on() 또는 once() 메서드를 사용하여 이벤트를 관찰합니다.
 */
  //  "value"	경로의 전체 내용을 읽고 변경사항을 수신 대기합니다.
  /* value 이벤트를 사용하여 이벤트 발생 시점에 특정 경로에 있던 콘텐츠의 정적 스냅샷을 읽을 수 있습니다. 
  이 메서드는 리스너가 연결될 때 한 번 트리거된 후 하위 요소를 포함한 데이터가 변경될 때마다 다시 트리거됩니다. 
  하위 데이터를 포함하여 해당 위치의 모든 데이터를 포함하는 스냅샷이 이벤트 콜백에 전달됩니다. 
  데이터가 없는 경우 스냅샷은 exists() 호출 시 false를 반환하고 val() 호출 시 null을 반환합니다. */
  channelsRef.once("value", function (snapshot) {
    let items = new Array();
    snapshot.forEach(function (childSnapshot) {
      let cname = childSnapshot.key;
      items.push(cname);
    });
    res.header("Content-Type", "application/json; charset=utf-8");
    res.send({ channels: items });
  });
});

app.post("/channels/:cname/messages", (req, res) => {
  let cname = req.params.cname;
  let message = {
    date: new Date().toJSON(),
    body: req.body.body,
    user: req.user,
  };
  let messagesRef = admin.database().ref(`channels/${cname}/messages`);
  messagesRef.push(message);
  res.header("Content-Type", "application/json; charset=utf-8");
  res.status(201).send({ result: "ok" });
});

app.get("/channels/:cname/messages", (req, res) => {
  let cname = req.params.cname;
  let messagesRef = admin
    .database()
    .ref(`channels/${cname}/messages`)
    .orderByChild("date")
    .limitToLast(20);
  messagesRef.once("value", function (snapshot) {
    let items = new Array();
    snapshot.forEach(function (childSnapshot) {
      let message = childSnapshot.val();
      message.id = childSnapshot.key;
      items.push(message);
    });
    items.reverse();
    res.header("Content-Type", "application/json; charset=utf-8");
    res.send({ messages: items });
  });
});

app.post("/reset", (req, res) => {
  //  재생성하면서 내부 메시지 초기화
  createChannel("general");
  createChannel("random");
  res.header("Content-Type", "application/json; charset=utf-8");
  res.status(201).send({ result: "ok" });
});

exports.v1 = functions.https.onRequest(app);
