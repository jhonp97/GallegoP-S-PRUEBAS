// src/components/Contact.jsx
import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { Helmet } from 'react-helmet-async';

const Contact = () => {
  const form = useRef();
  const [status, setStatus] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('Enviando...');

    //  EmailJS
    emailjs.sendForm(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, form.current, import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
      .then(() => {
        setStatus('¡Mensaje enviado con éxito!');
        form.current.reset();
      })
       .catch(() => {
        setStatus('Error al enviar el mensaje. Inténtalo de nuevo.');
      });
  };

  return (
    <>
      <Helmet>
        <title>Contacto - Gallego Productos & Servicios</title>
        <meta name="description" content="Ponte en contacto con Gallego Productos & Servicios para solicitar un presupuesto o más información sobre nuestros servicios de limpieza en Valencia." />
      </Helmet>
      <section id="contacto" className="Tab-content">
        <h2 className="Section__title">Contacta con Nosotros</h2>
        <div className="Contact-form-wrapper">
          <p>
            ¿Tienes alguna pregunta o quieres un presupuesto? Rellena el formulario y te contactaremos.
          </p>
          <form ref={form} onSubmit={sendEmail}>
            <label htmlFor="user_name">Nombre</label>
            <input id="user_name" type="text" name="user_name" required placeholder="Tu nombre completo" />
            
            <label htmlFor="user_email">Email</label>
            <input id="user_email" type="email" name="user_email" required placeholder="tu.correo@ejemplo.com" />
            
            <label htmlFor="message">Mensaje</label>
            <textarea id="message" name="message" rows="6" required placeholder="Escribe aquí tu consulta..."></textarea>
            
            <button type="submit">Enviar Mensaje</button>
          </form>
          {status && <p className="Contact-form-status">{status}</p>}
        </div>
      </section>
    </>
  );
};

export default Contact;