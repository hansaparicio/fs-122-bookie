import React from "react";
import Chat from "../components/Chat/Chat";
import "./Chat1.css";
import portadaLibro from "../assets/img/portada_Libro.png";
import { useBook } from "../components/BookContext";
import { useChat } from "../components/ChatContext";
import { Link } from "react-router-dom";

export const Chat1 = () => {
    const { selectedBook } = useBook();
    const { usersInRoom } = useChat();

    // Si no hay libro seleccionado, mostrar mensaje
    if (!selectedBook) {
        return (
            <div className="page-layout">
                <div className="no-book-selected">
                    <div className="text-center py-5">
                        <h3>📚 No has seleccionado un libro</h3>
                        <p className="text-muted">
                            Ve al Home y selecciona un libro para empezar a chatear con otros lectores
                        </p>
                        <Link to="/">
                            <button className="btn btn-wine mt-3">
                                Ir al Home
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-layout">
            {/* Barra Lateral Izquierda */}
            <aside className="sidebar">
                <div className="book-section">
                    <h4>Your Reading</h4>
                    <img
                        src={selectedBook.thumbnail || portadaLibro}
                        alt={selectedBook.title}
                        className="book-cover"
                    />
                    <p className="book-title">{selectedBook.title}</p>
                    {selectedBook.authors && selectedBook.authors.length > 0 && (
                        <p className="book-author text-muted small">
                            {selectedBook.authors.join(", ")}
                        </p>
                    )}
                    {selectedBook.publishedDate && (
                        <p className="book-date text-muted small">
                            📅 {selectedBook.publishedDate}
                        </p>
                    )}
                </div>

                <div className="readers-section">
                    <h4>Active chat readers</h4>
                    <div className="avatar-group">
                        <img src="https://i.pravatar.cc/40?u=1" alt="user1" className="avatar" />
                        <img src="https://i.pravatar.cc/150?img=47" alt="user2" className="avatar" />
                        <img src="https://i.pravatar.cc/150?img=12" alt="user3" className="avatar" />
                    </div>
                    <p className="readers-count">
                        {usersInRoom > 0 ? (
                            <>
                                {usersInRoom} {usersInRoom === 1 ? 'persona' : 'personas'} leyendo ahora
                            </>
                        ) : (
                            'Nadie más está aquí ahora'
                        )}
                    </p>
                </div>

                <div className="back-home-section">
                    <Link to="/">
                        <button className="btn btn-outline-wine w-100">
                            ← Volver al Home
                        </button>
                    </Link>
                </div>
            </aside>

            {/* Componente Chat */}
            <main className="chat-main">
                <Chat />
            </main>
        </div>
    );
}