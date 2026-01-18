import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [currentBookRoom, setCurrentBookRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [usersInRoom, setUsersInRoom] = useState(0);
    const [typingUsers, setTypingUsers] = useState(new Set());

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const newSocket = io('http://localhost:8080', {
                auth: { token }
            });

            newSocket.on('connect', () => {
                console.log('✅ Conectado al servidor de chat');
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Desconectado del servidor de chat');
            });

            newSocket.on('receive_book_message', (message) => {
                setMessages(prev => [...prev, message]);
            });

            newSocket.on('user_joined_room', (data) => {
                console.log(`${data.username} se unió al chat`);
                setUsersInRoom(prev => prev + 1);
            });

            newSocket.on('user_left_room', (data) => {
                console.log(`Usuario ${data.user_id} salió del chat`);
                setUsersInRoom(prev => Math.max(0, prev - 1));
            });

            newSocket.on('user_typing_in_book', (data) => {
                setTypingUsers(prev => new Set([...prev, data.username]));

                setTimeout(() => {
                    setTypingUsers(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(data.username);
                        return newSet;
                    });
                }, 3000);
            });

            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, []);

    const joinBookRoom = async (bookId, userId, username) => {
        if (socket) {
            if (currentBookRoom) {
                await socket.emitWithAck('leave_book_room', {
                    book_id: currentBookRoom
                });
            }

            const response = await socket.emitWithAck('join_book_room', {
                book_id: bookId,
                user_id: userId,
                username: username
            });

            if (response.success) {
                setCurrentBookRoom(bookId);
                setUsersInRoom(response.users_in_room);
                await loadBookMessages(bookId);
                return true;
            }
            return false;
        }
    };

    const leaveBookRoom = async (bookId) => {
        if (socket && currentBookRoom) {
            await socket.emitWithAck('leave_book_room', {
                book_id: bookId
            });

            setCurrentBookRoom(null);
            setMessages([]);
            setUsersInRoom(0);
        }
    };

    const sendMessage = async (bookId, userId, username, message) => {
        if (socket) {
            const response = await socket.emitWithAck('send_book_message', {
                book_id: bookId,
                user_id: userId,
                username: username,
                message
            });
            return response;
        }
    };

    const notifyTyping = (bookId, username) => {
        if (socket) {
            socket.emit('typing_in_book', {
                book_id: bookId,
                username: username
            });
        }
    };

    const loadBookMessages = async (bookId) => {
        if (socket) {
            const response = await socket.emitWithAck('get_book_messages', {
                book_id: bookId,
                limit: 50
            });

            if (response.messages) {
                setMessages(response.messages);
            }
        }
    };

    return (
        <ChatContext.Provider value={{
            socket,
            currentBookRoom,
            messages,
            usersInRoom,
            typingUsers,
            joinBookRoom,
            leaveBookRoom,
            sendMessage,
            notifyTyping,
            loadBookMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
};