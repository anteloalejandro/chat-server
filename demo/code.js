import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const headers = { "Content-type": "application/json; charset=UTF-8" }

function addMessage(str, element, owner = true) {
  const child = document.createElement('p')
  child.textContent = str
  child.classList.add(owner ? 'sent' : 'recieved')
  element.appendChild(child)
  return child
}

export async function run() {
  let conversation = '64090daecbd947e2e4895cf6'
  const socket = io()
  const messages = document.getElementById('messages')
  const form = document.querySelector('form')
  const input = form.querySelector('input')
  const info = document.getElementById('info')

  const user = await fetch('/api/users/')
    .then(response => response.json())
  if (user.error) {
    info.textContent = 'Not logged in'
    return
  } else {
    fetch('/api/conversations/'+conversation)
      .then(response => response.json())
      .then(conversation => {
        const user1 = conversation.users.user1
        const user2 = conversation.users.user2
        const recieverId = user1 == user._id ? user2 : user1
        fetch('/api/users/'+recieverId)
          .then(response => response.json())
          .then(reciever => {
            info.textContent = `Sender: ${user.username}, Reciever: ${reciever.username}`
          })
      })
  }
  socket.emit('join', user._id)

  socket.on('refresh-messages', msg => {
    console.log('Refreshing messages...')
    addMessage(msg.content, messages, msg.author === user._id)
      .scrollIntoView({behavior: "smooth"})
  })

  fetch('/api/messages/conversation/'+conversation)
    .then(response => response.json())
    .then(message => {
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
