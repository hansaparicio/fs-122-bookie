import React, { useState } from "react";

const BookLibraryModal = ({ isOpen, onClose, onSelect }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:3001";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchBooks = async () => {
    setError(null);
    setResults([]);

    const q = query.trim();
    if (!q) {
      setError("Escribe el nombre del libro para buscar.");
      return;
    }

    try {
      setLoading(true);
      const resp = await fetch(
        `${backendUrl}/api/books/search?title=${encodeURIComponent(q)}&maxResults=10&langRestrict=es`
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || "Error buscando libros");
      }

      const data = await resp.json();
      setResults(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />

      <div className="modal fade show" style={{ display: "block" }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content" style={{ borderRadius: "16px" }}>
            <div className="modal-header">
              <h5 className="modal-title">Seleccionar libro</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>

            <div className="modal-body">
              <div className="d-flex gap-2 mb-3">
                <input
                  className="form-control"
                  placeholder="Buscar por título (ej: El principito)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") searchBooks();
                  }}
                />
                <button className="btn btn-wine" onClick={searchBooks} disabled={loading}>
                  {loading ? "Buscando..." : "Buscar"}
                </button>
              </div>

              {error && <div className="text-danger small">{error}</div>}

              {results.length === 0 && !loading && !error && query.trim() && (
                <div className="text-muted small">No se encontraron resultados para “{query}”.</div>
              )}

              <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                {results.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    className="w-100 d-flex align-items-center gap-3 p-2 border rounded-3 mb-2 bg-white text-start"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      onSelect(book);
                      onClose();
                    }}
                  >
                    <div style={{ width: 50, height: 70, flex: "0 0 auto" }}>
                      {book.thumbnail ? (
                        <img
                          src={book.thumbnail}
                          alt={book.title}
                          className="w-100 h-100 object-fit-cover rounded"
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light rounded" />
                      )}
                    </div>

                    <div className="flex-grow-1">
                      <div className="fw-bold small">{book.title}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {book.authors?.length ? book.authors.join(", ") : "Autor desconocido"}
                        {book.publishedDate ? ` · ${book.publishedDate}` : ""}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        ISBN: <span className="fw-semibold">{book.isbn || "No disponible"}</span>
                      </div>
                    </div>

                    <span className="btn btn-outline-wine btn-sm">Elegir</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookLibraryModal;
