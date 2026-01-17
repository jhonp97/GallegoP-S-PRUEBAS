import { useEffect, useState, useRef } from "react";
import apiFetch from "../../services/api";
import AdminLayout from "../../layouts/AdminLayout";
import Lightbox from "../../components/gallery/Lightbox";

const ALBUMS = [
  { value: "comunidades", label: "Comunidades" },
  { value: "casas", label: "Casas" },
  { value: "parkings", label: "Parkings" },
  { value: "vehiculos", label: "Vehículos" },
  { value: "concesionarios", label: "Concesionarios" },
];

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [album, setAlbum] = useState("comunidades");
  const [loading, setLoading] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImages, setActiveImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRefs = useRef({}); // refs de contenedor
  const [showArrows, setShowArrows] = useState({}); // control de visibilidad de flechas

  const loadPhotos = async () => {
    const res = await apiFetch("/photos");
    setPhotos(res.data);
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("album", album);
    setLoading(true);
    await apiFetch("/photos", { method: "POST", body: formData });
    setFile(null);
    await loadPhotos();
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    await apiFetch(`/photos/${id}`, { method: "DELETE" });
    loadPhotos();
  };

  const grouped = photos.reduce((acc, photo) => {
    acc[photo.album] = acc[photo.album] || [];
    acc[photo.album].push(photo);
    return acc;
  }, {});

  // Actualiza si se deben mostrar flechas según el ancho
  const updateArrows = (albumKey) => {
    const container = scrollRefs.current[albumKey];
    if (!container) return;
    setShowArrows((prev) => ({
      ...prev,
      [albumKey]: container.scrollWidth > container.clientWidth,
    }));
  };

  useEffect(() => {
    // después de cargar fotos, revisa cada álbum
    Object.keys(grouped).forEach((albumKey) => {
      setTimeout(() => updateArrows(albumKey), 50); // delay para render
    });
    window.addEventListener("resize", () => {
      Object.keys(grouped).forEach(updateArrows);
    });
    return () => window.removeEventListener("resize", () => {});
  }, [photos]);

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
    <AdminLayout>
      <section className="admin-gallery">
        <h1>🖼️ Gestión de Galería</h1>

        {/* SUBIDA */}
        <div className="gallery-upload">
          <select value={album} onChange={(e) => setAlbum(e.target.value)}>
            {ALBUMS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={handleUpload} disabled={loading || !file}>
            {loading ? "Subiendo..." : "Subir imagen"}
          </button>
        </div>

        {/* ÁLBUMES */}
        {Object.keys(grouped).map((albumKey) => (
          <div key={albumKey} className="admin-album">
            <h2>{ALBUMS.find((a) => a.value === albumKey)?.label || albumKey}</h2>

            <div className="album-carousel-wrapper">
              {showArrows[albumKey] && (
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
                {grouped[albumKey].map((photo, index) => (
                  <div key={photo._id} className="admin-photo-card">
                    <img
                      src={photo.url}
                      alt={photo.title || albumKey}
                      onClick={() => {
                        setActiveImages(grouped[albumKey]);
                        setActiveIndex(index);
                        setLightboxOpen(true);
                      }}
                    />
                    <button
                      className="delete-btn"
                      title="Eliminar"
                      onClick={() => handleDelete(photo._id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              {showArrows[albumKey] && (
                <button
                  className="scroll-btn right"
                  onClick={() => scrollByAmount(albumKey, "right")}
                >
                  ›
                </button>
              )}
            </div>
          </div>
        ))}

        {/* LIGHTBOX */}
        {lightboxOpen && (
          <Lightbox
            images={activeImages}
            index={activeIndex}
            onClose={() => setLightboxOpen(false)}
            onNext={() =>
              setActiveIndex((activeIndex + 1) % activeImages.length)
            }
            onPrev={() =>
              setActiveIndex(
                (activeIndex - 1 + activeImages.length) % activeImages.length
              )
            }
          />
        )}
      </section>
    </AdminLayout>
  );
}