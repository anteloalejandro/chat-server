import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const headers = { "Content-type": "application/json; charset=UTF-8" }

function addMessage(str, element, owner = true) {
  const child = document.createElement('p')
  child.textContent = str
  child.classList.add(owner ? 'sent' : 'recieved')
  element.appendChild(child)
}

export async function run() {
  let conversation = '64090daecbd947e2e4895cf6'
  const socket = io()
  const user = await fetch('/api/user-data')
    .then(response => response.json())
  console.log(user)
  socket.emit('join', user._id)

  const messages = document.getElementById('messages')
  const form = document.querySelector('form')
  const input = form.querySelector('input')

  socket.on('refresh-messages', msg => {
    console.log('Refresh messages')
    addMessage(msg.content, messages, msg.author === user._id)
  })

  fetch('/api/messages/conversation/'+conversation)
    .then(response => response.json())
    .then(message => {
      console.log(message)
      message.forEach(m =>
        addMessage(m.content, messages, m.author === user._id))
    })

  form.onsubmit = ev => {
    ev.preventDefault()
    fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        "content": input.value,
        "conversation": conversation
      }),
      headers: headers
    })
      .then(response => {
        input.value = ''
        return response.json()
      })
      .then(message => {
        socket.emit('message', message)
      })
  }
}
