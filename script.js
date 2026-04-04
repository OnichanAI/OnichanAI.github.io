const WORKER_URL = "https://snowy-moon-ea6b.takkunmcjp.workers.dev/";

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");

let loading = false;

function scrollToBottom() {
  chat.scrollTop = chat.scrollHeight;
}

function addMessage(text, cls, extraClass = "") {
  const div = document.createElement("div");
  div.className = `message ${cls} ${extraClass}`.trim();
  div.textContent = text;
  chat.appendChild(div);
  scrollToBottom();
  return div;
}

function setLoadingState(state) {
  loading = state;
  if (sendBtn) sendBtn.disabled = state;
  if (input) input.disabled = state;
}

async function send() {
  if (loading) return;

  const text = input.value.trim();
  if (!text) return;

  setLoadingState(true);

  addMessage(`あなた: ${text}`, "user");
  input.value = "";

  const thinking = addMessage("妹が考え中", "ai", "thinking");

  try {
    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }

    const data = await res.json();
    thinking.remove();

    if (data.error) {
      addMessage("エラー: " + (data.error.message || "不明なエラー"), "ai");
      return;
    }

    addMessage("AI: " + (data.reply || "返答がありませんでした"), "ai");
  } catch (err) {
    console.error(err);
    if (thinking.parentNode) thinking.remove();
    addMessage("通信エラーが発生しました", "ai");
  } finally {
    setLoadingState(false);
    input.focus();
  }
}

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    send();
  }
});

if (sendBtn) {
  sendBtn.addEventListener("click", send);
}

input.focus();
