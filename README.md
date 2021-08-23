# bamboo-server

GSM 대나무숲 서버

보안이슈의 경우 `qudwls185@naver.com`으로 부탁드려요!  
많은 이슈와 풀리퀘스트, 그리고 피드백 부탁드려요!

## 시작하기

- install package

```sh
$ yarn
```

- write .env (refer .env.example)

```env
PORT=
MONGO_URL=
DISCORD_WEBHOOK=
DISCORD_TEST_WEBHOOK=
DISCORD_MANAGEMENT_WEBHOOK=
ADMIN_PASSWORD=
JWT_SECRET=
```

- start

```sh
$ yarn local
```

## API명세서

게시물의 상태는 다음과 같이 네가지로 나뉩니다.

```ts
| "PENDING"
| "ACCEPTED"
| "REJECTED"
| "DELETED"
```

헤더에 `Auth`가 들어갈 경우 관리자 세션이 필요합니다.
하지만 `continue`가 `true`일 경우, 관리자 세션이 없어도 됩니다.

관리자 세션은 `Authorization header`에 넣어주시면 됩니다.

기본적인 경로는 다음과 같습니다.  
https://**baseurl**/**api**

모든 인자값 전달은 json의 형태로 이루어집니다.

### /post

#### GET /get-list (Auth, continue : true)

조건에 부합하는 게시물 리스트를 가져옵니다.

- request

```uri
baselink/api/post/get-list?count=20&cursor=60b8407473d81a1b4cc591a5&status=PENDING
```

`count`는 한번에 몇개를 가져올지를 나타냅니다.  
`cursor`은 현재 어디에 위치했고, 어디 이후부터 게시물을 가져올지에 대해 나타냅니다.  
`status`는 어떤 상태의 게시물을 가져올지를 나타냅니다.(관리자 세션이 없을 경우에 `ACCEPTED` 상태의 게시물만 가져올 수 있습니다.)

- response

```
{
    "posts": [
        {
            "id": "60afb66f5852e30588334e69",
            "number": 8,
            "title": "귀찮다",
            "content": "뭐가 문제일가아아아아",
            "tag": "test",
            "createdAt": 1622128146794,
            "status": "ACCEPTED"
        },
        {
            "id": "60adb53983bf814e4072a3bb",
            "number": 7,
            "title": "귀찮다",
            "content": "아무것도 하기 싫어요",
            "tag": "test",
            "createdAt": 1623108308077,
            "status": "ACCEPTED"
        },
        {
            "id": "60afb7360631945f14e6d7a1",
            "number": 6,
            "title": "귀찮다",
            "content": "뭐가 문제일가아아아아",
            "tag": "test",
            "createdAt": 1622128433660,
            "status": "ACCEPTED"
        },
        {
            "id": "60afb714d699b84cfcbfa573",
            "number": 5,
            "title": "귀찮다",
            "content": "뭐가 문제일가아아아아",
            "tag": "test",
            "createdAt": 1622128293684,
            "status": "ACCEPTED"
        },
        {
            "id": "60ae06c4fdc4990b50c89fda",
            "number": 4,
            "title": "귀찮다",
            "content": "아무것도 하기 싫어요",
            "tag": "test",
            "createdAt": 1623107733965,
            "status": "ACCEPTED"
        }
    ],
    "cursor": 4,
    "hasNext": false
}
```

`posts`는 가져온 `posts` 게시물들의 리스트입니다.
`cursor`은 가져온 `posts` 게시물들 중, 가장 작은 `number`를 가진 `posts`의 `number`를 나타냅니다.
`hasNext`는 다음에 더 게시물을 가져올 수 있는지에 대한 답변입니다.

#### POST /create

게시글을 작성합니다.

- request

```json
{
  "title": "타이틀입니다.",
  "content": "내용입니다.",
  "tag": "태그입니다.",
  "verifier": { "id": "question id", "answer": "question answer" }
}
```

- response

```json
{
  "id": "대충 해당 게시글의 id값"
}
```

<<<<<<< HEAD

#### DELETE /delete/{arg}

`arg`는 삭제할 게시물의 고유 아이디값입니다.

- request

```json
{
  "reason": "배고프기때문이랄까..?."
}
```

- response

```json
{
  "result": "success"
}
```

#### PATCH /patch/{id}

게시물을 `ACCEPTED`, `REJECTED`, `DELETED`의 상태로 바꿉니다.

`id`는 수정할 게시물의 고유 id값을 얘기합니다.

- request

```json
{
    "status" : "ACCEPTED", # ACCEPTED, REJECTED, DELETED
    "title" : "제목", # ACCEPTED일 경우에만
    "content" : "내용", # ACCEPTED일 경우에만
    "reason" : "대충 이유 또는 사유"
}
```

- response

```json
{
  "createdAt": 1629643057303,
  "title": "방학 도중 테스트",
  "status": "ACCEPTED",
  "_id": "6122613180d90600097bb43c",
  "content": "코딩 싫어",
  "tag": "test",
  "number": 2,
  "updatedAt": "2021-08-22T14:38:45.391Z",
  "__v": 0,
  "reason": "",
  "cursorId": "6122613180d90600097bb43c",
  "id": "6122613180d90600097bb43c"
}
```

### /auth

#### POST /

관리자 비번을 인증하고, 성공시 관리자 세션을 제공해주는 jwt토큰을 제공합니다.

- request

```json
{
  "password": ".env ADMIN_PASSWORD"
}
```

- response

```json
{
  "success" : true// or false
  "token": "some jwt token"
}
```

### /verify

#### GET /

질문 하나를 랜덤으로 받습니다.

- response

```json
{
  "id": "NjBjN2QyNjhmNDM2NWZkOWFkMWYwN2Y0",
  "question": "GSM 와이파이 비밀번호는??"
}
```
