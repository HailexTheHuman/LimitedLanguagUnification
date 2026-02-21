const user = JSON.parse(document.body.getAttribute("user-data"))
const conversation = document.getElementById("conversation")
const prompt = document.getElementById("userInput")
const sendButton = document.getElementById("sendButton")
const conversationListElement = document.getElementById("conversationList")
const conversationList = []

function pushConversation(conversation) {
    conversationList.push(conversation)
    const conversationElement = document.createElement("div")
    conversationElement.innerText = conversation.name
    conversationElement.classList.add("conversationSelect")
    conversationListElement.appendChild(conversationElement)
}

sendButton.addEventListener("click", async () => {
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
        body: JSON.stringify({ context: [], prompt: userMessage.innerText, model: 'openrouter/free', resPrefix: "", params: {} })
    })

    modelMessage.innerText = (await response.json()).message
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