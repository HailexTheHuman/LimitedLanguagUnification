const user = JSON.parse(document.body.getAttribute("user-data"))
const conversation = document.getElementById("conversation")
const prompt = document.getElementById("userInput")
const sendButton = document.getElementById("sendButton")
const conversationListElement = document.getElementById("conversationList")
const modelSelect = document.getElementById("modelSelection")
const newConversationButton = document.getElementById("newConversation")


const conversationList = []
let currentConversation = {
    name: "none",
    messages: []
}

newConversationButton.addEventListener("click", () => {
    currentConversation = {
        name: "none",
        messages: []
    }
    displayConversation()
})

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
    if (modelSelect.value === "0") modelSelect.value = "openrouter/free";
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
    const condition = currentConversation.messages.length === 0
    currentConversation.messages.push({sender: user.username, text: userMessage.innerText})
    currentConversation.messages.push({sender: "model", text: responseText})
    if (condition) {
        conversationList.unshift(currentConversation)
        const nameResponse = await fetch('/sendPrompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context: currentConversation.messages, prompt: "create a title for this conversation, respond only with the title and nothing else", model: 'openrouter/free', resPrefix: "", params: {} })
        })
        currentConversation.name = (await nameResponse.json()).message
        const conversationElement = document.createElement("div")
        conversationElement.innerText = currentConversation.name
        conversationElement.classList.add("conversationSelect")
        conversationListElement.prepend(conversationElement)
        const tempConversation = currentConversation
        conversationElement.addEventListener("click", () => {
            currentConversation = tempConversation
            displayConversation()
        })
    }
    modelMessage.innerText = responseText


    modelMessage.classList.add("modelMessage")
    conversation.appendChild(modelMessage)
    fetch('/setConversationHistory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: user.username, password: user.password, conversation: conversationList })
    })
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