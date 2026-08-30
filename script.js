const WORKER_URL = "https://snowy-moon-ea6b.takkunmcjp.workers.dev/";
const STORAGE_KEY = "onichan-ai-state-v2";

const DEFAULT_SETTINGS = {
  voiceEnabled: true,
  autoPlay: true,
  speechRate: 1,
  emotion: 1,
  tempo: 1,
  volume: 1,
  enterSend: true,
  compact: false,
  fontSize: 15,
  theme: "dark",
  assistantName: "妹ちゃん",
  responseLength: "normal"
};

const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendButton = document.getElementById("send");
const characterCount = document.getElementById("characterCount");

const settingsModal = document.getElementById("settingsModal");
const settingsButton = document.getElementById("settingsButton");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const saveSettingsButton = document.getElementById("saveSettingsButton");
const resetSettingsButton = document.getElementById("resetSettingsButton");

const clearChatButton = document.getElementById("clearChatButton");
const stopVoiceButton = document.getElementById("stopVoiceButton");

const enterSendSetting = document.getElementById("enterSendSetting");
const compactSetting = document.getElementById("compactSetting");
const fontSizeSetting = document.getElementById("fontSizeSetting");
const fontSizeValue = document.getElementById("fontSizeValue");

const voiceEnabledSetting = document.getElementById("voiceEnabledSetting");
const autoPlaySetting = document.getElementById("autoPlaySetting");
const speechRateSetting = document.getElementById("speechRateSetting");
const emotionSetting = document.getElementById("emotionSetting");
const tempoSetting = document.getElementById("tempoSetting");
const volumeSetting = document.getElementById("volumeSetting");

const speechRateValue = document.getElementById("speechRateValue");
const emotionValue = document.getElementById("emotionValue");
const tempoValue = document.getElementById("tempoValue");
const volumeValue = document.getElementById("volumeValue");

const assistantNameElement = document.getElementById("assistantName");
const assistantNameSetting = document.getElementById("assistantNameSetting");
const responseLengthSetting = document.getElementById("responseLengthSetting");

const exportChatButton = document.getElementById("exportChatButton");
const importChatButton = document.getElementById("importChatButton");
const importFile = document.getElementById("importFile");

const quickActions = document.querySelectorAll(".quick-action");
const themeButtons = document.querySelectorAll(".theme-card");

let loading = false;
let currentAudio = null;

let state = {
  settings: { ...DEFAULT_SETTINGS },
  messages: []
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      applySettings();
      return;
    }

    const parsed = JSON.parse(saved);

    state.settings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings || {})
    };

    state.messages = Array.isArray(parsed.messages)
      ? parsed.messages.filter(message =>
          message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string"
        )
      : [];
  } catch {
    state = {
      settings: { ...DEFAULT_SETTINGS },
      messages: []
    };
  }

  applySettings();
  renderMessages();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applySettings() {
  document.documentElement.dataset.theme = state.settings.theme;
  document.documentElement.classList.toggle("compact", state.settings.compact);
  document.documentElement.style.setProperty("--chat-font-size", `${state.settings.fontSize}px`);

  if (assistantNameElement) {
    assistantNameElement.textContent = state.settings.assistantName || "妹ちゃん";
  }

  updateThemeButtons();
  updateSettingsInputs();
  updateCharacterCount();
}

function updateSettingsInputs() {
  enterSendSetting.checked = state.settings.enterSend;
  compactSetting.checked = state.settings.compact;

  fontSizeSetting.value = state.settings.fontSize;
  fontSizeValue.textContent = `${state.settings.fontSize}px`;

  voiceEnabledSetting.checked = state.settings.voiceEnabled;
  autoPlaySetting.checked = state.settings.autoPlay;

  speechRateSetting.value = state.settings.speechRate;
  emotionSetting.value = state.settings.emotion;
  tempoSetting.value = state.settings.tempo;
  volumeSetting.value = state.settings.volume;

  speechRateValue.textContent = `${Number(state.settings.speechRate).toFixed(1)}x`;
  emotionValue.textContent = Number(state.settings.emotion).toFixed(1);
  tempoValue.textContent = Number(state.settings.tempo).toFixed(1);
  volumeValue.textContent = Number(state.settings.volume).toFixed(1);

  assistantNameSetting.value = state.settings.assistantName;
  responseLengthSetting.value = state.settings.responseLength;
}

function updateThemeButtons() {
  themeButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.theme === state.settings.theme);
  });
}

function updateCharacterCount() {
  characterCount.textContent = `${input.value.length} / 2000`;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    chat.scrollTop = chat.scrollHeight;
  });
}

function formatTime(timestamp) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}

function createIcon(name) {
  if (name === "copy") {
    return `
      <svg viewBox="0 0 24 24">
        <rect x="9" y="9" width="11" height="11" rx="2"></rect>
        <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24">
      <path d="M6 5h4v14H6z"></path>
      <path d="M14 5h4v14h-4z"></path>
    </svg>
  `;
}

function renderEmptyState() {
  chat.innerHTML = `
    <div class="empty-state">
      <div>
        <div class="empty-state-icon">✦</div>
        <strong>まだ会話がありません</strong>
        <span>下の入力欄からメッセージを送って、おにいちゃんAIとの会話を始めよう。</span>
      </div>
    </div>
  `;
}

function renderMessages() {
  chat.innerHTML = "";

  if (!state.messages.length) {
    renderEmptyState();
    return;
  }

  state.messages.forEach((message, index) => {
    renderMessage(message, index);
  });

  scrollToBottom();
}

function renderMessage(message, index) {
  const isUser = message.role === "user";
  const wrap = document.createElement("div");
  wrap.className = `message-wrap ${isUser ? "user" : "ai"}`;

  const bubble = document.createElement("div");
  bubble.className = "message";
  bubble.textContent = message.content;

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const time = document.createElement("span");
  time.textContent = formatTime(message.timestamp || Date.now());

  meta.appendChild(time);

  const actions = document.createElement("div");
  actions.className = "message-actions";

  if (!isUser) {
    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "message-action";
    copyButton.title = "コピー";
    copyButton.innerHTML = createIcon("copy");

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(message.content);
        copyButton.innerHTML = "✓";

        setTimeout(() => {
          copyButton.innerHTML = createIcon("copy");
        }, 900);
      } catch {
        copyButton.innerHTML = "×";
      }
    });

    actions.appendChild(copyButton);
  }

  meta.appendChild(actions);

  wrap.appendChild(bubble);
  wrap.appendChild(meta);

  chat.appendChild(wrap);

  return wrap;
}

function addStoredMessage(role, content) {
  const message = {
    role,
    content,
    timestamp: Date.now()
  };

  state.messages.push(message);
  saveState();

  if (chat.querySelector(".empty-state")) {
    chat.innerHTML = "";
  }

  renderMessage(message, state.messages.length - 1);
  scrollToBottom();

  return message;
}

function addTypingIndicator() {
  const wrap = document.createElement("div");
  wrap.className = "message-wrap ai";

  const bubble = document.createElement("div");
  bubble.className = "message typing";
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;

  wrap.appendChild(bubble);
  chat.appendChild(wrap);
  scrollToBottom();

  return wrap;
}

function setLoadingState(value) {
  loading = value;
  sendButton.disabled = value;
  input.disabled = value;
}

function stopVoice() {
  if (!currentAudio) return;

  try {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  } catch {
  }

  currentAudio = null;
}

function sanitizeSpeechText(text) {
  return String(text)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/[*_~`>#]/g, "")
    .trim()
    .slice(0, 3000);
}

async function speak(text) {
  if (!state.settings.voiceEnabled || !state.settings.autoPlay) return;

  const cleanText = sanitizeSpeechText(text);

  if (!cleanText) return;

  stopVoice();

  try {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "tts",
        text: cleanText,
        settings: {
          speaking_rate: Number(state.settings.speechRate),
          emotional_intensity: Number(state.settings.emotion),
          tempo_dynamics: Number(state.settings.tempo),
          volume: Number(state.settings.volume),
          output_format: "mp3"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`TTS HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audio.volume = 1;
    currentAudio = audio;

    audio.addEventListener("ended", () => {
      URL.revokeObjectURL(url);

      if (currentAudio === audio) {
        currentAudio = null;
      }
    });

    await audio.play();
  } catch (error) {
    console.error("Voice error:", error);
  }
}

function buildConversationPayload() {
  return state.messages.slice(-20).map(message => ({
    role: message.role,
    content: message.content
  }));
}

function getResponseInstruction() {
  if (state.settings.responseLength === "short") {
    return "短めに返答してください。基本は1〜4文程度で、会話のテンポを優先してください。";
  }

  if (state.settings.responseLength === "long") {
    return "必要な場合は詳しく説明してください。ただし、無意味に長文化せず自然な会話を維持してください。";
  }

  return "自然な会話として、必要十分な長さで返答してください。";
}

async function send() {
  if (loading) return;

  const text = input.value.trim();

  if (!text) return;

  if (text.length > 2000) return;

  stopVoice();
  setLoadingState(true);

  addStoredMessage("user", text);

  input.value = "";
  autoResize();
  updateCharacterCount();

  const typing = addTypingIndicator();

  try {
    const payload = {
      message: text,
      history: buildConversationPayload(),
      conversation: buildConversationPayload(),
      preferences: {
        assistantName: state.settings.assistantName,
        responseLength: state.settings.responseLength,
        responseInstruction: getResponseInstruction(),
        language: "ja-JP",
        style: "friendly_sister",
        addressUserAs: "おにいちゃん"
      }
    };

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    typing.remove();

    if (data.error) {
      const errorMessage =
        typeof data.error === "string"
          ? data.error
          : data.error.message || "不明なエラー";

      addStoredMessage("assistant", `エラー: ${errorMessage}`);
      return;
    }

    const reply = String(
      data.reply ||
      data.response ||
      data.message ||
      "うまく返答できませんでした。"
    ).trim();

    const assistantMessage = addStoredMessage("assistant", reply);

    if (state.settings.voiceEnabled && state.settings.autoPlay) {
      await speak(assistantMessage.content);
    }
  } catch (error) {
    console.error(error);

    typing.remove();
    addStoredMessage("assistant", "ごめんね、通信中にエラーが発生しちゃった。");
  } finally {
    setLoadingState(false);
    input.focus();
  }
}

function autoResize() {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
}

function openSettings() {
  updateSettingsInputs();
  settingsModal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeSettings() {
  settingsModal.classList.remove("open");
  document.body.style.overflow = "";
}

function readSettingsFromForm() {
  state.settings = {
    ...state.settings,
    voiceEnabled: voiceEnabledSetting.checked,
    autoPlay: autoPlaySetting.checked,
    speechRate: Number(speechRateSetting.value),
    emotion: Number(emotionSetting.value),
    tempo: Number(tempoSetting.value),
    volume: Number(volumeSetting.value),
    enterSend: enterSendSetting.checked,
    compact: compactSetting.checked,
    fontSize: Number(fontSizeSetting.value),
    assistantName: assistantNameSetting.value.trim() || "妹ちゃん",
    responseLength: responseLengthSetting.value
  };

  applySettings();
  saveState();
}

function clearChat() {
  const confirmed = window.confirm("この会話履歴をすべて削除しますか？");

  if (!confirmed) return;

  stopVoice();
  state.messages = [];
  saveState();
  renderMessages();
}

function exportChat() {
  const payload = {
    app: "おにいちゃんAI",
    version: 2,
    exportedAt: new Date().toISOString(),
    messages: state.messages
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `onichan-ai-chat-${Date.now()}.json`;
  anchor.click();

  URL.revokeObjectURL(url);
}

async function importChatFile(file) {
  try {
    const text = await file.text();
    const payload = JSON.parse(text);

    if (!payload || !Array.isArray(payload.messages)) {
      throw new Error("invalid");
    }

    const importedMessages = payload.messages.filter(message =>
      message &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string"
    );

    state.messages = importedMessages.slice(-200);
    saveState();
    renderMessages();

    alert("会話を読み込みました。");
  } catch {
    alert("会話ファイルを読み込めませんでした。");
  }
}

function resetSettings() {
  const confirmed = window.confirm("設定を初期設定に戻しますか？");

  if (!confirmed) return;

  state.settings = { ...DEFAULT_SETTINGS };
  applySettings();
  saveState();
}

input.addEventListener("input", () => {
  autoResize();
  updateCharacterCount();
});

input.addEventListener("keydown", event => {
  if (event.key !== "Enter") return;

  if (event.shiftKey) return;

  if (!state.settings.enterSend) return;

  event.preventDefault();
  send();
});

sendButton.addEventListener("click", send);

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
saveSettingsButton.addEventListener("click", () => {
  readSettingsFromForm();
  closeSettings();
});

settingsModal.addEventListener("click", event => {
  if (event.target === settingsModal) {
    closeSettings();
  }
});

clearChatButton.addEventListener("click", clearChat);
stopVoiceButton.addEventListener("click", stopVoice);

resetSettingsButton.addEventListener("click", resetSettings);

voiceEnabledSetting.addEventListener("change", () => {
  if (!voiceEnabledSetting.checked) {
    stopVoice();
  }
});

fontSizeSetting.addEventListener("input", () => {
  fontSizeValue.textContent = `${fontSizeSetting.value}px`;
});

speechRateSetting.addEventListener("input", () => {
  speechRateValue.textContent = `${Number(speechRateSetting.value).toFixed(1)}x`;
});

emotionSetting.addEventListener("input", () => {
  emotionValue.textContent = Number(emotionSetting.value).toFixed(1);
});

tempoSetting.addEventListener("input", () => {
  tempoValue.textContent = Number(tempoSetting.value).toFixed(1);
});

volumeSetting.addEventListener("input", () => {
  volumeValue.textContent = Number(volumeSetting.value).toFixed(1);
});

themeButtons.forEach(button => {
  button.addEventListener("click", () => {
    state.settings.theme = button.dataset.theme;
    applySettings();
    saveState();
  });
});

quickActions.forEach(button => {
  button.addEventListener("click", () => {
    input.value = button.dataset.message || "";
    autoResize();
    updateCharacterCount();
    input.focus();
  });
});

exportChatButton.addEventListener("click", exportChat);

importChatButton.addEventListener("click", () => {
  importFile.click();
});

importFile.addEventListener("change", async () => {
  const file = importFile.files?.[0];

  if (!file) return;

  await importChatFile(file);
  importFile.value = "";
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && settingsModal.classList.contains("open")) {
    closeSettings();
  }
});

loadState();
autoResize();
updateCharacterCount();
input.focus();
