export default function AlbumGrid({ title, photos, onBack, onOpen }) {
  return (
    <section className="album-view">
      <button className="btn-secondary" onClick={onBack}>← Volver</button>
      <h2>{title}</h2>

      <div className="photo-grid">
        {photos.map(photo => (
          <img
            key={photo._id}
            src={photo.url}
            alt={title}
            loading="lazy"
            onClick={() => onOpen(photo.url)}
          />
        ))}
      </div>
    </section>
  );
}
