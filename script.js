const WORKER_URL = "https://snowy-moon-ea6b.takkunmcjp.workers.dev";

const chat = document.getElementById("chat");

function addMessage(text, cls){
const div = document.createElement("div");
div.className = cls;
div.textContent = text;
chat.appendChild(div);
chat.scrollTop = chat.scrollHeight;
}

async function send(){

const input = document.getElementById("message");
const text = input.value.trim();

if(!text) return;

addMessage("あなた: " + text,"user");
input.value="";

try{

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

ユーザー: ${text}`
}
]
}
]
})
});

const data = await res.json();

if(data.error){
addMessage("エラー: " + data.error.message,"ai");
return;
}

const reply =
data?.candidates?.[0]?.content?.parts?.[0]?.text ||
"返答を取得できませんでした";

addMessage("AI: " + reply,"ai");

}catch(e){

addMessage("通信エラー","ai");
console.error(e);

}

}
