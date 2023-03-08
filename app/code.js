import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const headers = { "Content-type": "application/json; charset=UTF-8" }

function addMessage(str, element, owner = true) {
  const child = document.createElement('p')
  child.textContent = str
  child.classList.add(owner ? 'sent' : 'recieved')
  element.appendChild(child)
}

export function run() {
  const socket = io()
  let conversation = '64090daecbd947e2e4895cf6'

  const messages = document.getElementById('messages')
  fetch('/get-messages/'+conversation)
    .then(response => response.json())
    .then(json => {
      console.log(json)
      json.messages.forEach(m => addMessage(m.content, messages))
    })
  const form = document.querySelector('form')
  const input = form.querySelector('input')
  form.onsubmit = ev => {
    ev.preventDefault()
    fetch('/', {
      method: 'POST',
      body: JSON.stringify({
        "message": {
          "content": input.value,
          "conversation": conversation
        }
      }),
      headers: headers
    })
      .then(response => {
        socket.emit('message', input.value)
        input.value = ''
        return response.json()
      })
      .then(json => {console.log(json)})
  }
  /* fetch('/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({
	    "username": "John",
	    "email": "johndoe@example.com",
	    "password": "john"
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    .then(response => response.json())
    .then(data => {console.log(data)}) */

  //socket.emit('conversation', {users: {user1: '64012c17ee606bf7649fad84', user2: '64035105cb3782247f9b8662'}})
  // socket.emit('message', {content: 'Hello, World!', conversation: '6407c5598568e0e6ae741ad4', author: '64012c17ee606bf7649fad84'})
}
