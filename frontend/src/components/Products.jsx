import React from 'react'
import { Helmet } from 'react-helmet-async';

const Products = () => {
  return (
    <section id="productos" className="Tab-content" role="tabpanel">
      <Helmet>
        <title>Productos de Limpieza</title>
        <meta name="description" content="Descubre nuestros productos de limpieza de alta calidad." />
      </Helmet>
      <h2 className="Section__title">Productos de Limpieza</h2>
      <div className="Card-container">
        <article className="Card anim-fade">
          <img
            src="https://inovi.es/wp-content/uploads/2024/12/materiales-de-limpieza-1024x644.jpg"
            loading="lazy"
            alt="Limpiador Multiusos"
            className="Card__image"
          />
          <div className="Card__content">
            <h3 className="Card__title">Limpiador Multiusos</h3>
            <p className="Card__text">
              Eficaz en superficies variadas, eliminando manchas y suciedad en minutos.
            </p>
            <p className="Card__text"><strong>Precio: €12.99</strong></p>
          </div>
        </article>
        <article className="Card anim-fade">
          <img
            src="https://ecodes.org/images/que-hacemos/HOGARES_SOSTENIBLES/Ideas_varias/limpieza_hogar.jpg"
            loading="lazy"
            alt="Desinfectante"
            className="Card__image"
          />
          <div className="Card__content">
            <h3 className="Card__title">Desinfectante</h3>
            <p className="Card__text">
              Elimina hasta el 99.9% de gérmenes para un ambiente seguro y limpio.
            </p>
            <p className="Card__text"><strong>Precio: €9.99</strong></p>
          </div>
        </article>
      </div>
    </section>
  )
}

export default Products
