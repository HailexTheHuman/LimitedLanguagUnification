/**
 * this is the current user's data
 */
const user = JSON.parse(document.body.getAttribute("user-data"))
/**
 * the element containing the conversation the user is currently in
 * @type {HTMLElement}
 */
const conversation = document.getElementById("conversation")
/**
 * the element containing the user's input
 * @type {HTMLElement}
 */
const prompt = document.getElementById("userInput")
/**
 * the send button element to add a new message to the conversation
 * @type {HTMLElement}
 */
const sendButton = document.getElementById("sendButton")
/**
 * the element of all conversations the user has, only contains the name of the conversation
 * @type {HTMLElement}
 */
const conversationListElement = document.getElementById("conversationList")
/**
 * the element containing the model selection or 0 if none is selected
 * @type {HTMLElement}
 */
const modelSelect = document.getElementById("modelSelection")
/**
 * the button to create a new conversation
 * @type {HTMLElement}
 */
const newConversationButton = document.getElementById("newConversation")

/**
 * an element contained in the model options dropdown, contains the role the user is playing in the conversation
 * @type {HTMLElement}
 */
const roleSelect = document.getElementById("roleSelection")
/**
 * an element contained in the model options dropdown, contains whether the model should respond to the user's input
 * @type {HTMLElement}
 */
const modelResponseSelect = document.getElementById("modelResponds")
/**
 * an element contained in the model options dropdown, contains whether the user can edit the conversation
 * @type {HTMLElement}
 */
const canEditSelect = document.getElementById("canEdit")

/**
 * an element contained in the model options dropdown, it is a text input for the response prefix
 * @type {HTMLElement}
 */
const prefixInput = document.getElementById("responsePrefix")
/**
 * an element contained in the model options dropdown, it is a numerical input for the temperature
 * @type {HTMLElement}
 */
const temperatureInput = document.getElementById("temperature")
/**
 * an element contained in the model options dropdown, it is a numerical input for the top p
 * @type {HTMLElement}
 */
const topPInput = document.getElementById("topP")
/**
 * an element contained in the model options dropdown, it is a numerical input for the top k
 * @type {HTMLElement}
 */
const topKInput = document.getElementById("topK")
/**
 * an element contained in the model options dropdown, it is a numerical input for the frequency penalty
 * @type {HTMLElement}
 */
const frecPenaltyInput = document.getElementById("frecPen")
/**
 * an element contained in the model options dropdown, it is a numerical input for the presence penalty
 * @type {HTMLElement}
 */
const presPenaltyInput = document.getElementById("presPen")
/**
 * an element contained in the model options dropdown, it is a numerical input for the repetition penalty
 * @type {HTMLElement}
 */
const repeatPenaltyInput = document.getElementById("repPen")
/**
 * an element contained in the model options dropdown, it is a numerical input for the min P
 * @type {HTMLElement}
 */
const minPInput = document.getElementById("minP")
/**
 * an element contained in the model options dropdown, it is a numerical input for the max A
 * @type {HTMLElement}
 */
const maxAInput = document.getElementById("maxA")
/**
 * an element contained in the model options dropdown, it is a categorical selection for the verbose option
 * @type {HTMLElement}
 */
const verboseInput = document.getElementById("verbose")


/**
 * this is used to validate the user's input for the temperature input.
 */
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

/**
 * this is used to validate the user's input for the top p input.'
 */
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

/**
 * this is used to validate the user's input for the top k input.'
 */
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

/**
 * this is used to validate the user's input for the frequency penalty input.'
 */
frecPenaltyInput.addEventListener("blur", () => {
    if (frecPenaltyInput.value < -2) frecPenaltyInput.value = -2
    if (frecPenaltyInput.value > 2) frecPenaltyInput.value = 2

    try {
        parseFloat(frecPenaltyInput.value)

        if (frecPenaltyInput.value === '') {
            frecPenaltyInput.value = 0.0
        }
    } catch (e) {
        frecPenaltyInput.value = 0.0
    }
})

/**
 * this is used to validate the user's input for the presence penalty input.'
 */
presPenaltyInput.addEventListener("blur", () => {
    if (presPenaltyInput.value < -2) presPenaltyInput.value = -2
    if (presPenaltyInput.value > 2) presPenaltyInput.value = 2
    try {
        parseFloat(presPenaltyInput.value)

        if (presPenaltyInput.value === '') {
            presPenaltyInput.value = 0.0
        }
    } catch (e) {
        presPenaltyInput.value = 0.0
    }
})

/**
 * this is used to validate the user's input for the repetition penalty input.
 */
repeatPenaltyInput.addEventListener("blur", () => {
    if (repeatPenaltyInput.value < 0) repeatPenaltyInput.value = 0
    if (repeatPenaltyInput.value > 2) repeatPenaltyInput.value = 2
    try {
        parseFloat(repeatPenaltyInput.value)

        if (repeatPenaltyInput.value === '') {
            repeatPenaltyInput.value = 1.0
        }
    } catch (e) {
        repeatPenaltyInput.value = 1.0
    }
})

/**
 * this is used to validate the user's input for the min P input.
 */
minPInput.addEventListener("blur", () => {
    if (minPInput.value < 0) minPInput.value = 0
    if (minPInput.value > 1) minPInput.value = 1
    try {
        parseFloat(minPInput.value)
        if (minPInput.value === '') {
            minPInput.value = 0.0
        }
    } catch (e) {
        minPInput.value = 0.0
    }
})

/**
 * this is used to validate the user's input for the max A input.
 */
maxAInput.addEventListener("blur", () => {
    if (maxAInput.value < 0) maxAInput.value = 0
    if (maxAInput.value > 1) maxAInput.value = 1
    try {
        parseFloat(maxAInput.value)
        if (maxAInput.value === '') {
            maxAInput.value = 0.0
        }
    } catch (e) {
        maxAInput.value = 0.0
    }
})


/**
 * the list of all conversations the user has had
 * @type {Object[]}
 */
const conversationList = []
/**
 * the current conversation the user is in
 * @type {{name: string, messages: Object[]}}
 */
let currentConversation = {
    name: "none",
    messages: []
}
/**
 * the event when the user clicks the new conversation button, will set the {@link currentConversation} to a new empty conversation and call {@link displayConversation}
 */
newConversationButton.addEventListener("click", () => {
    currentConversation = {
        name: "none",
        messages: []
    }
    displayConversation()
})
/**
 * the event listener for when the user toggles the {@link canEditSelect} element, will call {@link displayConversation}
 */
canEditSelect.addEventListener("change", () => {
    displayConversation()
})

/**
 * the function for displaying {@link currentConversation} in the {@link conversation} element.
 *
 * it will clear the {@link conversation} element and loop through all messages in {@link currentConversation} and add them to the {@link conversation} element.
 *
 * if the {@link canEditSelect} element is checked, it will add the contenteditable attribute to all elements and add an event listener to each of them.
 *
 * the event listener trigger when the conversation is edited and will update the {@link currentConversation} messages to match the edited conversation
 */
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

/**
 * the function for adding a conversation to the {@link conversationList} as well as appending it to the {@link conversationListElement}
 *
 * it will also add an event listener to trigger on click, to set the {@link currentConversation} to the clicked conversation and displaying it
 * @param {Object} conversation the conversation to add to the {@link conversationList} and {@link conversationListElement}
 */
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

/**
 * the event listener for when the user clicks the send button.
 *
 * it will create a conversation {@link Object} with the text from {@link prompt} with role {@link roleSelect} add it to the {@link currentConversation} and to {@link conversation}
 *
 * it will call the backend with the parameters specified
 *
 * if the {@link modelResponseSelect} is checked, it will also get a response from the backend and add the response to the {@link currentConversation} and to {@link conversation}
 *
 * if this is the first message in the conversation it will get a response from the backend to create a name for the conversation add call {@link pushConversation} on {@link currentConversation}
 *
 * it will also update the backend database with the updated {@link conversationList}
 */
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
            top_k: parseInt(topKInput.value),
            frequency_penalty: parseFloat(frecPenaltyInput.value),
            presence_penalty: parseFloat(presPenaltyInput.value),
            repetition_penalty: parseFloat(repeatPenaltyInput.value),
            min_p: parseFloat(minPInput.value),
            top_a: parseFloat(maxAInput.value),
            verbose: verboseInput.value,
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

/**
 * the event listener for when the user presses enter in the prompt element.
 *
 * it will simulate a click on the {@link sendButton}
 */
prompt.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendButton.click();
    }
})

/**
 * the function for setting up the page, it will call {@link pushConversation} on all conversations in {@link user}
 *
 * this will populate the {@link conversationListElement} with all conversations the user has
 */
function setup() {
    for (const conversation of user.conversations) {
        pushConversation(conversation)
    }
}

setup()