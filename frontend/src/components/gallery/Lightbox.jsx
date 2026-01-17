
import "../../styles/gallery.css";

// export default function Lightbox({ images, index, onClose, onPrev, onNext }) {

//   // Bloquear scroll del body
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   // Navegación con teclado
//   useEffect(() => {
//     const handleKey = (e) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowRight") onNext();
//       if (e.key === "ArrowLeft") onPrev();
//     };

//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [onClose, onNext, onPrev]);

//   return (
//     <div className="lightbox-overlay">
//       <button className="lightbox-close" onClick={onClose}>✕</button>

//       {images.length > 1 && (
//         <>
//           <button className="lightbox-nav left" onClick={onPrev}>‹</button>
//           <button className="lightbox-nav right" onClick={onNext}>›</button>
//         </>
//       )}

//       <div className="lightbox-content">
//         <img src={images[index].url} alt="" />
//       </div>
//     </div>
//   );
// }

// export default function Lightbox({ images, index, onClose, onNext, onPrev }) {

//    // Bloquear scroll del body
//   useEffect(() => {
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []);

//   // Navegación con teclado
//   useEffect(() => {
//     const handleKey = (e) => {
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowRight") onNext();
//       if (e.key === "ArrowLeft") onPrev();
//     };

//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [onClose, onNext, onPrev]);

//   return (
//     <div className="lightbox-overlay" onClick={onClose}>
//       <button className="lightbox-close">✕</button>

//       <button className="lightbox-nav left" onClick={(e) => { e.stopPropagation(); onPrev(); }}>
//         ‹
//       </button>

//       <img
//         src={images[index].url}
//         alt={images[index].alt || ""}
//         className="lightbox-img"
//       />

//       <button className="lightbox-nav right" onClick={(e) => { e.stopPropagation(); onNext(); }}>
//         ›
//       </button>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState } from "react";

export default function Lightbox({ images, index = 0, onClose, onNext, onPrev }) {
  const startXRef = useRef(null);
  const deltaXRef = useRef(0);
  const draggingRef = useRef(false);
  const [deltaX, setDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const threshold = 60; // px necesarios para considerar swipe

  // Bloquear scroll del body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "auto";
    };
  }, []);

  // Navegación con teclado
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev]);

  // Handlers táctiles / pointer
  const onTouchStart = (clientX) => {
    startXRef.current = clientX;
    deltaXRef.current = 0;
    draggingRef.current = true;
    setIsDragging(true);
  };

  const onTouchMove = (clientX) => {
    if (!draggingRef.current || startXRef.current === null) return;
    const dx = clientX - startXRef.current;
    deltaXRef.current = dx;
    setDeltaX(dx);
  };

  const onTouchEnd = () => {
    draggingRef.current = false;
    setIsDragging(false);

    const dx = deltaXRef.current;
    deltaXRef.current = 0;
    setDeltaX(0);

    if (Math.abs(dx) > threshold) {
      if (dx < 0) {
        // swipe left -> siguiente
        onNext();
      } else {
        // swipe right -> anterior
        onPrev();
      }
    }
  };

  // DOM event wrappers para touch y pointer
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) onTouchStart(e.touches[0].clientX);
  };
  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length === 1) {
      onTouchMove(e.touches[0].clientX);
      
    }
  };
  const handleTouchEnd = () => onTouchEnd();

  // Soporte pointer (ratón) para arrastrar en escritorio
  const handlePointerDown = (e) => {
    // solo botón principal
    if (e.pointerType === "mouse" && e.button !== 0) return;
    (e.target).setPointerCapture?.(e.pointerId);
    onTouchStart(e.clientX);
  };
  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    onTouchMove(e.clientX);
  };
  const handlePointerUp = (e) => {
    try { (e.target).releasePointerCapture?.(e.pointerId); } catch {}
    onTouchEnd();
  };

  // Evitar cerrar cuando se hace click dentro del contenido
  const stopPropagation = (e) => e.stopPropagation();

  // Estilo dinámico para la imagen durante el arrastre
  const imgStyle = {
    transform: `translateX(${deltaX}px)`,
    transition: isDragging ? "none" : "transform 220ms ease",
    touchAction: "pan-y", // permite scroll vertical en la página si fuera necesario
    cursor: isDragging ? "grabbing" : "auto",
    maxWidth: "90%",
    maxHeight: "85%",
    borderRadius: 12,
  };

  // Previene errores si index fuera de rango
  const safeIndex = Math.max(0, Math.min(index, images.length - 1));
  const current = images[safeIndex] || { url: "", alt: "" };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div
        className="lightbox-inner"
        onClick={stopPropagation}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <button
          className="lightbox-close"
          aria-label="Cerrar"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          ✕
        </button>

        <button
          className="lightbox-nav left"
          aria-label="Anterior"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
        >
          ‹
        </button>

        <img
          src={current.url}
          alt={current.alt || ""}
          className="lightbox-img"
          style={imgStyle}
          draggable={false}
        />

        <button
          className="lightbox-nav right"
          aria-label="Siguiente"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
        >
          ›
        </button>
      </div>
    </div>
  );
}
