const generateMessage = (username,text) => {
  return {
    username,
    message:text,
    createdAt:new Date().getTime()
  }
}
const generateLocationMessage = (username,url) => {
  return {
    username,
    url:url,
    createdAt:new Date().getTime()
  }
}
module.exports = {
  generateMessage,
  generateLocationMessage
}