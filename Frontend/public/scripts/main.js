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

    const response = await fetch('http://localhost:3000/sendPrompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context: "context here!", prompt: userMessage.innerText, model: "model here!" })
    })

    modelMessage.innerText = (await response.json()).response
    conversation.appendChild(modelMessage)
})