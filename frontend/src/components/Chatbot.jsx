import React, { useState } from 'react'

const Chatbot = () => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'Chatbot',
      text:
        '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte? Por ejemplo, prueba con: ¿Cuáles son sus servicios?, Quiero info de productos, o Contacto y WhatsApp.'
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const toggleChatbot = () => {
    setOpen(!open)
  }

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { sender, text }])
  }

  const processUserMessage = (msg) => {
    let response = ''
    msg = msg.toLowerCase()
    if (msg.includes('hola') || msg.includes('buenas')) {
      response = '¡Hola! ¿Te gustaría saber sobre nuestros servicios o productos?'
    } else if (msg.includes('servicios')) {
      response =
        'Ofrecemos limpieza para casas, oficinas, chalets, parkings y más. Revisa la pestaña "Servicios" para ver detalles.'
    } else if (msg.includes('productos')) {
      response =
        'Contamos con una amplia gama de productos de limpieza, como limpiador multiusos y desinfectantes. Dirígete a la pestaña "Productos".'
    } else if (msg.includes('contacto') || msg.includes('whatsapp')) {
      response = 'Puedes contactarnos vía WhatsApp o visitar la pestaña "Contacto".'
    } else {
      response =
        'No entendí tu consulta. Prueba preguntando: ¿Cuáles son sus servicios?, Quiero info de productos, o Contacto y WhatsApp.'
    }
    addMessage('Chatbot', response)
  }

  const handleSend = () => {
    if (inputValue.trim() !== '') {
      addMessage('Tú', inputValue)
      processUserMessage(inputValue)
      setInputValue('')
      console.log('Mensaje:', inputValue);
console.log('Estado de mensajes:', messages);

    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    addMessage('Tú', suggestion)
    processUserMessage(suggestion)
  }

  return (
    <div className="Chatbot" id="chatbot">
      <div className="Chatbot__header" id="chatbotToggle" onClick={toggleChatbot}>
        ¿Necesitas ayuda?
      </div>
      {open && (
        <div className="Chatbot__body" id="chatbotBody" style={open?{ display: "block"}:{ display: "none"} }>
          <div id="chatbotMessages">
            {messages.map((msg, index) => (
              <p className="Chatbot__message" key={index}>
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <div className="Chatbot__suggestions" id="chatbotSuggestions">
            <button className="Chatbot__suggestion" onClick={() => handleSuggestionClick('¿Cuáles son sus servicios?')}>
              ¿Cuáles son sus servicios?
            </button>
            <button className="Chatbot__suggestion" onClick={() => handleSuggestionClick('Quiero info de productos')}>
              Quiero info de productos
            </button>
            <button className="Chatbot__suggestion" onClick={() => handleSuggestionClick('Contacto y WhatsApp')}>
              Contacto y WhatsApp
            </button>
          </div>
          <div className="Chatbot__input-wrapper">
            <input
              type="text"
              id="chatbotInput"
              className="Chatbot__input"
              placeholder="Escribe tu consulta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button id="chatbotSend" className="Chatbot__button" onClick={handleSend}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chatbot
