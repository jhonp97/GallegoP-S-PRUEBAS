import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../services/api';

const servicesData = [
  { id: 'comunidades', title: 'Limpieza de Comunidades', description: 'Servicio especializado para grandes residencias y comunidades.', keyFeatures: ['Zonas comunes impecables', 'Mantenimiento de cristales', 'Gestión de cubos', 'Limpieza de jardines'], fallbackImage: '/imgs/comunidades/limpiezazonacomun2.jpg' },
  { id: 'casas', title: 'Limpieza de Casas', description: 'Mantenimiento integral para hogares, adaptado a tus necesidades.', keyFeatures: ['Cocinas y baños a fondo', 'Limpieza de polvo y suelos', 'Flexibilidad horaria', 'Atención personalizada'], fallbackImage: '/imgs/comunidades/entrada-portal2.jpg' },
  { id: 'vehiculos', title: 'Limpieza de Vehículos', description: 'Limpieza y mantenimiento para un acabado impecable.', keyFeatures: ['Limpieza interior detallada', 'Lavado exterior a mano', 'Tratamiento de tapicerías', 'Pulido y encerado profesional'], fallbackImage: '/imgs/vehiculos/Screenshot_20251027-183643.png' },
  { id: 'concesionarios', title: 'Limpieza de Concesionarios', description: 'Acabado impecable y atractivo para tus clientes.', keyFeatures: ['Exposiciones relucientes', 'Limpieza de talleres', 'Atención al detalle', 'Mantenimiento regular'], fallbackImage: '/imgs/concesionarios/Screenshot_20251027-183024.png' },
  { id: 'parkings', title: 'Limpieza de Parkings', description: 'Optimización del mantenimiento en áreas de estacionamiento.', keyFeatures: ['Barrido y fregado industrial', 'Eliminación de manchas de aceite', 'Vaciado de papeleras', 'Mantenimiento de iluminación'], fallbackImage: '/imgs/parkings/IMG-20251029-WA0020.jpg' },
];

const Services = () => {
  const navigate = useNavigate();
  const [photosByAlbum, setPhotosByAlbum] = useState({});
const [covers, setCovers] = useState({});


useEffect(() => {
  apiFetch("/photos/public").then(res => {
    const featured = {};

    res.data.forEach(photo => {
      if (photo.featured) {
        featured[photo.album] = photo.url;
      }
    });

    setCovers(featured);
  });
}, []);

  useEffect(() => {
    apiFetch('/photos/public').then(res => {
      // Agrupar fotos por álbum
      const grouped = res.data.reduce((acc, photo) => {
        acc[photo.album] = acc[photo.album] || [];
        acc[photo.album].push(photo);
        return acc;
      }, {});
      setPhotosByAlbum(grouped);
    });
  }, []);

  const handleShowAlbum = (albumId) => {
    navigate(`/galeria?album=${albumId}`);
  };

  return (
    <>
      <Helmet>
        <title>Servicios de Limpieza Profesional - Gallego Productos</title>
        <meta name="description" content="Ofrecemos servicios de limpieza para comunidades, concesionarios, parkings, vehículos y más. Limpieza en Valencia" />
      </Helmet>

      <section id="servicios" className="Tab-content">
        <h2 className="Section__title">Nuestros Servicios</h2>
        <div className="Service-card-container">
          {servicesData.map((service) => {
            const albumPhotos = photosByAlbum[service.id];
            const serviceImage = albumPhotos?.[0]?.url || service.fallbackImage;

            return (
              <div key={service.id} className="ServiceCard anim-fade">
                <div className="ServiceCard__image-wrapper">
                  <img
                    src={serviceImage}
                    alt={`Servicio de ${service.title}`}
                    className="ServiceCard__image"
                    loading="lazy"
                  />
                  <div className="ServiceCard__overlay"></div>
                </div>
                <div className="ServiceCard__content">
                  <h3 className="ServiceCard__title">{service.title}</h3>
                  <p className="ServiceCard__description">{service.description}</p>

                  <ul className="ServiceCard__features">
                    {service.keyFeatures.map((feature, index) => (
                      <li key={index}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => handleShowAlbum(service.id)} className="ServiceCard__button">
                    Ver galería
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                  <br />
                  <a href="https://wa.me/34633658703" className="ServiceCard__cta">
                    Pregúntanos
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Services;
