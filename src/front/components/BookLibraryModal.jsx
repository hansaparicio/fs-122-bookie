import React, { useState } from "react";

const BookLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchBooks = async () => {
        setError(null);
        setResults([]);

        if (!query.trim()) {
            setError("Escribe el nombre de un libro.");
            return;
        }

        try {
            setLoading(true);
            const resp = await fetch(
                `${backendUrl}/api/books/search?title=${encodeURIComponent(query)}`
            );

            if (!resp.ok) throw new Error("Error buscando libros");

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
            {/* Backdrop */}
            <div className="modal-backdrop fade show" onClick={onClose} />

            <div className="modal fade show" style={{ display: "block" }}>
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content rounded-4">
                        <div className="modal-header">
                            <h5 className="modal-title">📚 Biblioteca</h5>
                            <button className="btn-close" onClick={onClose} />
                        </div>

                        <div className="modal-body">
                            <div className="d-flex gap-2 mb-3">
                                <input
                                    className="form-control"
                                    placeholder="Buscar por título (ej: El principito)"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && searchBooks()}
                                />
                                <button className="btn btn-wine" onClick={searchBooks}>
                                    Buscar
                                </button>
                            </div>

                            {error && <div className="text-danger small">{error}</div>}
                            {loading && <div className="text-muted small">Buscando...</div>}

                            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                {results.map((book) => (
                                    <div
                                        key={book.id}
                                        className="d-flex gap-3 align-items-center border rounded-3 p-2 mb-2 bg-white"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            onSelect(book);
                                            onClose();
                                        }}
                                    >
                                        <div style={{ width: 50, height: 70 }}>
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
                                                {book.authors?.join(", ") || "Autor desconocido"}
                                            </div>
                                        </div>

                                        <span className="btn btn-outline-wine btn-sm">
                                            Elegir
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline-secondary" onClick={onClose}>
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
