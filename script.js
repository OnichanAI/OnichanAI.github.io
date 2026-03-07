const WORKER_URL = "https://snowy-moon-ea6b.takkunmcjp.workers.dev";

const chat = document.getElementById("chat");
const input = document.getElementById("message");

function addMessage(text, cls){
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function send(){

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
        message:text
      })
    });

    if(!res.ok){
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();

    if(data.error){
      addMessage("エラー: " + data.error.message,"ai");
      return;
    }

    addMessage("AI: " + data.reply,"ai");

  }catch(err){

    console.error(err);
    addMessage("通信エラーが発生しました","ai");

  }
}

input.addEventListener("keydown",function(e){
  if(e.key === "Enter"){
    send();
  }
});
