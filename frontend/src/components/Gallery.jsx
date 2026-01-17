import { useEffect, useState, useRef } from "react";
import apiFetch from "../services/api";
import Lightbox from "../components/gallery/Lightbox";
import "../styles/gallery.css";

const ALBUM_LABELS = {
  comunidades: "Comunidades",
  casas: "Casas",
  parkings: "Parkings",
  vehiculos: "Vehículos",
  concesionarios: "Concesionarios",
};

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  const scrollRefs = useRef({});
  const [showArrows, setShowArrows] = useState({});

  /* 🔹 Cargar fotos públicas */
  useEffect(() => {
    apiFetch("/photos/public").then((res) => setPhotos(res.data));
  }, []);

  /* 🔹 Agrupar por álbum */
  const albums = photos.reduce((acc, photo) => {
    acc[photo.album] = acc[photo.album] || [];
    acc[photo.album].push(photo);
    return acc;
  }, {});

  /* 🔹 Detectar si se necesitan flechas */
  const updateArrows = (albumKey) => {
    const container = scrollRefs.current[albumKey];
    if (!container) return;

    setShowArrows((prev) => ({
      ...prev,
      [albumKey]: container.scrollWidth > container.clientWidth,
    }));
  };

  /* 🔹 Actualizar flechas después del render */
  useEffect(() => {
    Object.keys(albums).forEach((albumKey) => {
      setTimeout(() => updateArrows(albumKey), 50);
    });

    const handleResize = () =>
      Object.keys(albums).forEach(updateArrows);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [photos]);

  /* 🔹 Scroll lateral (igual que AdminGallery) */
  const scrollByAmount = (albumKey, direction = "right") => {
    const container = scrollRefs.current[albumKey];
    if (!container) return;

    const scrollAmount = 200;

    container.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="gallery-page">
      <h1>Galería de trabajos</h1>

      {Object.keys(albums).map((albumKey) => {
        const hasArrows = showArrows[albumKey];

        return (
          <article key={albumKey}>
            <h2>{ALBUM_LABELS[albumKey] || albumKey}</h2>

            <div className="album-carousel-wrapper">
              {hasArrows && (
                <button
                  className="scroll-btn left"
                  onClick={() => scrollByAmount(albumKey, "left")}
                >
                  ‹
                </button>
              )}

              <div
                className="admin-album-scroll"
                ref={(el) => (scrollRefs.current[albumKey] = el)}
              >
                {albums[albumKey].map((photo, index) => (
                  <div key={photo._id} className="admin-photo-card">
                    <img
                      src={photo.url}
                      alt={photo.alt || ""}
                      loading="lazy"
                      onClick={() =>
                        setLightbox({
                          images: albums[albumKey],
                          index,
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              {hasArrows && (
                <button
                  className="scroll-btn right"
                  onClick={() => scrollByAmount(albumKey, "right")}
                >
                  ›
                </button>
              )}
            </div>
          </article>
        );
      })}

      {/* 🔹 Lightbox */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNext={() =>
            setLightbox((l) => ({
              ...l,
              index: (l.index + 1) % l.images.length,
            }))
          }
          onPrev={() =>
            setLightbox((l) => ({
              ...l,
              index:
                (l.index - 1 + l.images.length) % l.images.length,
            }))
          }
        />
      )}
    </section>
  );
}
