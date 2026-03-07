const WORKER_URL = "https://snowy-moon-ea6b.takkunmcjp.workers.dev/";

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");

let loading = false;

function addMessage(text, cls) {

  const div = document.createElement("div");
  div.className = "message " + cls;
  div.textContent = text;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  return div;
}

async function send() {

  if (loading) return;

  const text = input.value.trim();
  if (!text) return;

  loading = true;

  addMessage("あなた: " + text, "user");
  input.value = "";

  const thinking = addMessage("妹が考え中...", "ai");

  try {

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text
      })
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();

    thinking.remove();

    if (data.error) {
      addMessage("エラー: " + data.error.message, "ai");
      return;
    }

    addMessage("AI: " + data.reply, "ai");

  } catch (err) {

    console.error(err);
    thinking.remove();
    addMessage("通信エラーが発生しました", "ai");

  } finally {

    loading = false;

  }

}

input.addEventListener("keydown", function(e) {

  if (e.key === "Enter") {
    e.preventDefault();
    send();
  }

});

if (sendBtn) {
  sendBtn.addEventListener("click", send);
}
