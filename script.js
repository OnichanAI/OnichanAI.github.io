const API_KEY = "AIzaSyBlaHXYxGynSSPdBQVYQL3ZvSLwSMF0o2I";

const chat = document.getElementById("chat");

function addMessage(text, className){
const div = document.createElement("div");
div.className = className;
div.textContent = text;
chat.appendChild(div);
chat.scrollTop = chat.scrollHeight;
}

async function send(){

const input = document.getElementById("message");
const text = input.value;

if(!text) return;

addMessage("あなた: " + text, "user");
input.value="";

const response = await fetch(
"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
role:"user",
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
}
);

const data = await response.json();

console.log(data);

const reply =
data.candidates?.[0]?.content?.parts?.[0]?.text || "エラー";

addMessage("AI: " + reply, "ai");

}
