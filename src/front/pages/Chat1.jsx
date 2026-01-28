import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Chat from "../components/Chat/Chat";
import "./Chat1.css";
import portadaLibro from "../assets/img/portada_Libro.png";

export const Chat1 = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [activeChannelId, setActiveChannelId] = useState(null);
    const [bookTitle, setBookTitle] = useState("");
    const [bookIsbn, setBookIsbn] = useState("");
    const [bookThumbnail, setBookThumbnail] = useState(null);

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = () => {
            const streamToken = localStorage.getItem("stream_token");
            const userData = localStorage.getItem("user_data");
            const accessToken = localStorage.getItem("access_token");

            // Debug: log auth state
            console.log("Chat1 Auth Check:", {
                hasAccessToken: !!accessToken,
                hasStreamToken: !!streamToken,
                hasUserData: !!userData
            });

            // Check if user is authenticated
            if (!accessToken) {
                console.log("No access token, redirecting to login");
                navigate("/");
                return false;
            }

        
            return true;
        };

        if (!checkAuth()) return;

        const channelFromUrl = searchParams.get("channel");
        const bookFromUrl = searchParams.get("book");
        const isbnFromUrl = searchParams.get("isbn");

        if (channelFromUrl) {
            setActiveChannelId(channelFromUrl);
        }
        if (bookFromUrl) {
            setBookTitle(decodeURIComponent(bookFromUrl));
        }
        if (isbnFromUrl) {
            setBookIsbn(decodeURIComponent(isbnFromUrl));
        }

        try {
            const savedBook = localStorage.getItem("selected_book");
            if (savedBook) {
                const bookData = JSON.parse(savedBook);
                if (bookData.thumbnail) {
                    setBookThumbnail(bookData.thumbnail);
                }
            }
        } catch (e) {
            console.error("Error loading book thumbnail:", e);
        }
    }, [navigate, searchParams]);

    const handleJoinChannel = (channelId, title) => {
        setActiveChannelId(channelId);
        setBookTitle(title);
        navigate(`/chat?channel=${channelId}&book=${encodeURIComponent(title)}`, { replace: true });
    };

    const handleCloseChannel = () => {
        setActiveChannelId(null);
        setBookTitle("");
        setBookIsbn("");
        navigate("/home", { replace: true });
    };

    return (
        <div className="page-layout">
            {/* Barra Lateral Izquierda */}
            <aside className="sidebar">
                {bookTitle && (
                    <div className="book-section">
                        <h4>Discusión Actual</h4>
                        <img
                            src={bookThumbnail || portadaLibro}
                            alt="Portada del libro"
                            className="book-cover"
                            onError={(e) => { e.currentTarget.src = portadaLibro; }}
                        />
                        <p className="book-title">{bookTitle}</p>
                        {bookIsbn && (
                            <p className="book-isbn" style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px" }}>
                                ISBN: {bookIsbn}
                            </p>
                        )}
                    </div>
                )}

                {!bookTitle && (
                    <div className="book-section empty-state">
                        <h4>Bienvenido al Chat</h4>
                        <p className="empty-text">Selecciona un libro en el Home para chatear con otros lectores del mismo libro</p>
                    </div>
                )}

                <div className="readers-section">
                    <h4>Lectores activos en el chat</h4>
                    <div className="avatar-group">
                        <img src="https://i.pravatar.cc/40?u=1" alt="user1" className="avatar" />
                        <img src="https://i.pravatar.cc/150?img=47" alt="user2" className="avatar" />
                        <img src="https://i.pravatar.cc/150?img=12" alt="user3" className="avatar" />
                    </div>
                    <p className="readers-count">Aure y 12 más están aquí ahora</p>
                </div>

            </aside>

            {/* Componente Chat Principal */}
            <main className="chat-main">
                <Chat
                    channelId={activeChannelId}
                    bookTitle={bookTitle}
                    onJoinChannel={handleJoinChannel}
                    onCloseChannel={handleCloseChannel}
                />
            </main>

        </div>
    );
};