const user = JSON.parse(document.body.getAttribute("user-data"))
const conversation = document.getElementById("conversation")
const prompt = document.getElementById("userInput")
const sendButton = document.getElementById("sendButton")

sendButton.addEventListener("click", async () => {
    const userMessage = document.createElement("div")
    userMessage.classList.add("userMessage")
    userMessage.innerText = prompt.value
    prompt.value = ""
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
    conversation.appendChild(modelMessage)
})


prompt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();
    }
})