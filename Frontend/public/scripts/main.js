const user = JSON.parse(document.body.getAttribute("user-data"))
const conversation = document.getElementById("conversation")
const prompt = document.getElementById("userInput")
const sendButton = document.getElementById("sendButton")
const conversationListElement = document.getElementById("conversationList")
const modelSelect = document.getElementById("modelSelection")

const conversationList = []
let currentConversation = {
    name: "none",
    messages: []
}

function displayConversation() {
    conversation.innerHTML = ""
    for (const message of currentConversation.messages) {
        const messageElement = document.createElement("div")
        messageElement.innerText = message.text
        messageElement.classList.add(message.sender === "model" ? "modelMessage" : "userMessage")
        conversation.appendChild(messageElement)
    }
}

function pushConversation(conversation) {
    conversationList.push(conversation)
    const conversationElement = document.createElement("div")
    conversationElement.classList.add("conversationSelect")
    conversationElement.innerText = conversation.name
    conversationElement.classList.add("conversationSelect")
    conversationListElement.appendChild(conversationElement)
    conversationElement.addEventListener("click", () => {
        currentConversation = conversation
        displayConversation()
    })
}

sendButton.addEventListener("click", async () => {
    if (prompt.value === "") return;
    if (modelSelect.value === "0") return;
    const userMessage = document.createElement("div")
    userMessage.classList.add("userMessage")
    userMessage.innerText = prompt.value
    prompt.value = ""
    userMessage.scrollIntoView()
    userMessage.classList.add("userMessage")
    conversation.appendChild(userMessage)
    const modelMessage = document.createElement("div")
    modelMessage.classList.add("modelMessage")

    const response = await fetch('/sendPrompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context: currentConversation.messages, prompt: userMessage.innerText, model: modelSelect.value, resPrefix: "", params: {} })
    })
    const responseText = (await response.json()).message
    currentConversation.messages.push({sender: user.username, text: userMessage.innerText})
    currentConversation.messages.push({sender: "model", text: responseText})
    modelMessage.innerText = responseText

    modelMessage.classList.add("modelMessage")
    conversation.appendChild(modelMessage)
})


prompt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();
    }
})

function setup() {
    for (const conversation of user.conversations) {
        pushConversation(conversation)
    }
}

setup()