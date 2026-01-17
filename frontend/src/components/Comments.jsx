// // src/components/Comments.jsx

// import React from 'react';
// import { Helmet } from 'react-helmet-async';
// import { Link } from 'react-router-dom'; 


// const testimonials = [
//   {
//     name: 'Ana P.',
//     text: 'El servicio fue excelente y mi oficina quedó impecable. Totalmente recomendados por su profesionalismo y atención al detalle.',
//     service: 'Limpieza de Oficinas'
//   },
//   {
//     name: 'Carlos G.',
//     text: 'Contraté la limpieza para la comunidad de vecinos y el resultado ha sido magnífico. Puntuales, eficientes y muy amables.',
//     service: 'Limpieza de Comunidades'
//   },
//   {
//     name: 'Laura M.',
//     text: 'Dejaron mi coche como nuevo. Un servicio de limpieza de vehículos muy completo a un precio muy competitivo. ¡Volveré!',
//     service: 'Limpieza de Vehículos'
//   }
// ];

// const Comments = () => {
//   return (
//     <>
//       <Helmet>
//         <title>Comentarios de Clientes - Gallego Productos</title>
//         <meta name="description" content="Lee lo que dicen nuestros clientes sobre nuestros servicios de limpieza profesional." />
//       </Helmet>
      
//       <section id="comentarios" className="Tab-content">
//         <h2 className="Section__title">Lo que Dicen Nuestros Clientes</h2>
        
//         <div className="Testimonials-container">
//           {testimonials.map((review, index) => (
//             <figure className="Testimonial anim-fade" key={index}>
//               <div className="Testimonial__icon">
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
//                   <path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.6-4.33 4.925l.346-1.025c.42-1.226 2.031-2.425 3.996-2.675.253.95.03 2.175-1 3.55-1.042 1.388-2.553 2.588-4.137 2.625.089 1.45.894 2.85 2.138 3.425zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.6-4.33 4.925l.346-1.025c.42-1.226 2.031-2.425 3.996-2.675.253.95.03 2.175-1 3.55-1.042 1.388-2.553 2.588-4.137 2.625.089 1.45.894 2.85 2.138 3.425z"/>
//                 </svg>
//               </div>
//               <blockquote className="Testimonial__text">
//                 "{review.text}"
//               </blockquote>
//               <figcaption className="Testimonial__author">
//                 <span className="Testimonial__author-name">- {review.name}</span>
//                 <span className="Testimonial__author-service">{review.service}</span>
//               </figcaption>
//             </figure>
//           ))}
//         </div>

//         <div className="Cta-box anim-fade">
//           <h3>¿Quieres dejarnos tu opinión?</h3>
//           <p>Nos encantaría conocer tu experiencia. Puedes contactarnos para compartir tu testimonio.</p>
//           <Link to="/contacto" className="Cta-box__button">
//             Contactar ahora
//           </Link>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Comments;

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import apiFetch from "../services/api";

const Comments = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    apiFetch("/google/reviews")
      .then(res => setReviews(res.reviews))
      .catch(console.error);
  }, []);

  return (
    <>
      <Helmet>
        <title>Opiniones de Clientes - Gallego Productos</title>
        <meta
          name="description"
          content="Opiniones reales de nuestros clientes en Google Maps."
        />
      </Helmet>

      <section id="comentarios" className="Tab-content">
        <h2 className="Section__title">Opiniones de Nuestros Clientes</h2>

        <div className="Testimonials-container">
          {reviews.map((review, index) => (
            <figure className="Testimonial anim-fade" key={index}>
              <div className="Testimonial__icon">★</div>

              <blockquote className="Testimonial__text">
                "{review.text}"
              </blockquote>

              <figcaption className="Testimonial__author">
                <span className="Testimonial__author-name">
                  - {review.author}
                </span>

                <span className="Testimonial__author-service">
                  {"★".repeat(review.rating)}
                </span>

                <span className="Testimonial__author-service">
                  {review.time}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="Cta-box anim-fade">
          <h3>¿Ya trabajaste con nosotros?</h3>
          <p>Déjanos tu reseña en Google Maps, nos ayuda muchísimo 🙌</p>

          <a
            href="https://www.google.com/maps/place/?q=place_id=TU_PLACE_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="Cta-box__button"
          >
            Dejar reseña en Google
          </a>
        </div>
      </section>
    </>
  );
};

export default Comments;
