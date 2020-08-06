const form = document.querySelector('form')
const sendButton = document.querySelector('#send')
const inputField = document.querySelector('#message')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const socket = io()

const autoScroll = () => {
 const newMessage = messages.lastElementChild
 const newMessageStyles = getComputedStyle(newMessage)
 const newMessageMargin = parseInt(newMessageStyles.marginBottom)
 const newMessageHeight = newMessageStyles + newMessageMargin

 const visibleHeight = messages.offsetHeight
 const containerHeight = messages.scrollHeight
 const scrollOffset = (messages.scrollTop + visibleHeight)
 if(containerHeight-newMessageHeight <= scrollOffset+1){
  messages.scrollTop = $messages.scrollHeight
}

}

socket.on('message',(message) => {
  const html = Mustache.render(messageTemplate,{
    username :message.username,
    message : message.message,
    createdAt : moment(message.createdAt).format('h:mm a')
  })
  messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
})

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix : true})

socket.on('locationMessage',(message) => {
  const html = Mustache.render(locationTemplate,{
    username : message.username,
    url : message.url,
    createdAt : moment(message.createdAt).format('h:mm a')
  })
  messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
})
form.addEventListener('submit',(e) => {
  e.preventDefault()
  //messages.innerHTML = ''
  sendButton.setAttribute('disabled','disabled')
  const inputMsg = e.target.elements.message.value
  socket.emit('sendMessage',inputMsg,(error) => {
    inputField.value = ''
    sendButton.removeAttribute('disabled')
    inputField.focus()
    if(error) {
      return console.log(error)
    }
  })
})
locationButton.addEventListener('click', (e) => {
  e.preventDefault()
    if(!navigator.geolocation) {
    return alert('Your browser doesnot support mdn')
  }
  locationButton.setAttribute('disabled','disabled')
  navigator.geolocation.getCurrentPosition((position) => {
    const {coords} = position
    const {latitude,longitude} = coords
    socket.emit('sendLocation',{latitude,longitude},(error) => {
     locationButton.removeAttribute('disabled') 
     if(error) {
       console.log(error)
     }

     console.log('Location shared!')
    })
  })
})

socket.emit('join', {username,room},(error) => {
  if(error) {
    alert(error)
    location.href = '/'
  }
})

socket.on('roomData', ({room,users}) => {
 const html = Mustache.render(sidebarTemplate,{
   room,
   users
 })
 document.querySelector('#sidebar').innerHTML = html
})