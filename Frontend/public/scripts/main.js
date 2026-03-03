const user = JSON.parse(document.body.getAttribute("user-data"))
const conversation = document.getElementById("conversation")
const prompt = document.getElementById("userInput")
const sendButton = document.getElementById("sendButton")
const conversationListElement = document.getElementById("conversationList")
const modelSelect = document.getElementById("modelSelection")
const newConversationButton = document.getElementById("newConversation")


const roleSelect = document.getElementById("roleSelection")
const modelResponseSelect = document.getElementById("modelResponds")
const canEditSelect = document.getElementById("canEdit")

const prefixInput = document.getElementById("responsePrefix")
const temperatureInput = document.getElementById("temperature")
const topPInput = document.getElementById("topP")
const topKInput = document.getElementById("topK")



temperatureInput.addEventListener("blur", () => {
    if (temperatureInput.value < 0) temperatureInput.value = 0.0
    if (temperatureInput.value > 2) temperatureInput.value = 2.0

    try {
        parseFloat(temperatureInput.value)
        if (temperatureInput.value === '') {
            temperatureInput.value = 1.0
        }
    } catch (e) {
        temperatureInput.value = 1.0
    }
})

topPInput.addEventListener("blur", () => {
    if (topPInput.value < 0) topPInput.value = 0.0
    if (topPInput.value > 1) topPInput.value = 1.0

    try {
        parseFloat(topPInput.value)
        if (topPInput.value === '') {
            topPInput.value = 1.0
        }
    } catch (e) {
        topPInput.value = 1.0
    }
})

topKInput.addEventListener("blur", () => {
    if (topKInput.value < 0) topKInput.value = 0.0
    try {
        parseFloat(topKInput.value)
        if (topKInput.value === '') {
            topKInput.value = 0.0
        }
    } catch (e) {
        topKInput.value = 0.0
    }
    topKInput.value = Math.floor(topKInput.value)
})


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

canEditSelect.addEventListener("change", () => {
    displayConversation()
})

function displayConversation() {
    conversation.innerHTML = ""
    for (const message of currentConversation.messages) {
        const messageElement = document.createElement("div")
        messageElement.innerText = message.text
        if (canEditSelect.checked) {
            messageElement.setAttribute("contenteditable","plaintext-only")
            messageElement.addEventListener("input", () => {
                currentConversation.messages = []
                for (let i = 0; i < conversation.children.length; i++) {
                    const message = {
                        sender: conversation.children[i].classList.contains("modelMessage") ? "model" : (conversation.children[i].classList.contains("systemMessage") ? "system" : user.username),
                        text: conversation.children[i].innerText
                    }
                    currentConversation.messages.push(message)
                }
            })
        }

        messageElement.classList.add(message.sender === "model" ? "modelMessage" : (message.sender === "system" ? "systemMessage" : "userMessage"))
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
    userMessage.classList.add(roleSelect.value === "model" ? "modelMessage" : (roleSelect.value === "system" ? "systemMessage" : "userMessage"))
    userMessage.innerText = prompt.value
    prompt.value = ""
    userMessage.scrollIntoView()
    userMessage.classList.add("userMessage")
    conversation.appendChild(userMessage)
    let responseText;
    let modelMessage;
    if (modelResponseSelect.checked) {
        modelMessage = document.createElement("div")
        modelMessage.classList.add("modelMessage")
        const params = {
            temperature: parseFloat(temperatureInput.value),
            top_p: parseFloat(topPInput.value),
            top_k: parseInt(topKInput.value)
        }
        const response = await fetch('/sendPrompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context: currentConversation.messages, prompt: userMessage.innerText, model: modelSelect.value, resPrefix: prefixInput.value, params: params, role: roleSelect.value })
        })
        responseText = (await response.json()).message
    }
    const condition = currentConversation.messages.length === 0
    currentConversation.messages.push({sender: roleSelect.value, text: userMessage.innerText})
    if (modelResponseSelect.checked) currentConversation.messages.push({sender: "model", text: responseText})
    if (condition) {
        conversationList.unshift(currentConversation)
        const nameResponse = await fetch('/sendPrompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context: currentConversation.messages, prompt: "create a title for this conversation, respond only with the title and nothing else", model: 'openrouter/free', resPrefix: "", params: {}, role: "user" })
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
    if (modelResponseSelect.checked) {
        modelMessage.innerText = responseText


        modelMessage.classList.add("modelMessage")
        conversation.appendChild(modelMessage)
    }
    fetch('/setConversationHistory', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: user.username, password: user.password, conversation: conversationList })
    })
    console.log("finished!")
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