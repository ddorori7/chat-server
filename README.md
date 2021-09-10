### 프로젝트 폴더 생성

- chat-server

### 프로젝트 추가

- 프로젝트 만들기
  chat-server
  약관 동의

  애널리틱스 해제

  > 프로젝트 만들기

### Firebase CLI 설치

```bash
npm install -g firebase-tools
```

### Firebase Login

```bash
firebase login
```

### Firebase Project 확인

```bash
firebase projects:list
```

### Hosting 설정

```bash
firebase init hosting
```

- Use an existing project
- public directory : public
- Configure as a spa app : N
- automatic build : N

### Firebase Functions 설정

```bash
firebase init functions
```

- Language : JavaScript
- ESLint: N

### Firebase Database 설정

```bash
firebase init database
```

### Firebase Database 구축

- 콘솔

### 프로젝트 구축

- 참고 소스: https://raw.githubusercontent.com/okachijs/jsframeworkbook/master/2_5_server/functions/index.js
- functions\index.js 파일

### 테스트 하기

```bash
firebase serve --only functions
```

### Firebase Database 설정

- database.rules.json

```json
{
  /* Visit https://firebase.google.com/docs/database/security to learn more about security rules. */
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### API Test

- Git bash로 수행

```bash
curl -H 'Content-Type:application/json' -d '{"cname": "general"}' http://localhost:5000/{프로젝트ID}/us-central1/v1/channels
curl http://localhost:5000/{프로젝트ID}/us-central1/v1/channels
curl -H 'Content-Type:application/json' -d '{}' http://localhost:5000/{프로젝트ID}/us-central1/v1/reset
```

- POSTMAN

  - 프로그램 다운로드
  - Request 정보 추가 및 테스트
