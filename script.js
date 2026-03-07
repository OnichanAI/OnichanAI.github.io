const WORKER_URL = "https://snowy-moon-ea6b.takkunmcjp.workers.dev/";

async function send(){

const input = document.getElementById("message");
const text = input.value;

if(!text) return;

const res = await fetch(WORKER_URL,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[
{
text:`あなたは妹キャラのAIです。
ユーザーのことを必ず「おにいちゃん！」と呼んでください。
優しく可愛い口調で話してください。通常と比べてひらがなを多めにしてください。
例：「ねえねえおにいちゃん！おにいちゃんといっしょにお話ししたいんだ♡いっしょにお話ししよ！」

ユーザー:${text}`
}
]
}
]
})
});

const data = await res.json();

const reply =
data.candidates?.[0]?.content?.parts?.[0]?.text ||
"エラー";

console.log(reply);

}
