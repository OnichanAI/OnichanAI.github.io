const API_KEY = "AIzaSyAWUAW9uJ52T9fsxSeqlAn4660o7-Drv6Q";

const chat = document.getElementById("chat");

function addMessage(text, cls){
const div = document.createElement("div");
div.className = cls;
div.textContent = text;
chat.appendChild(div);
}

async function send(){

const input = document.getElementById("message");
const text = input.value;

if(!text) return;

addMessage("あなた: " + text,"user");

input.value="";

const res = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
{
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
}
);

const data = await res.json();

console.log(data);

const reply =
data.candidates?.[0]?.content?.parts?.[0]?.text ||
"エラー";

addMessage("AI: " + reply,"ai");

}
