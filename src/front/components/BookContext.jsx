import React, { createContext, useContext, useState, useEffect } from 'react';

const BookContext = createContext();

export const useBook = () => {
    const context = useContext(BookContext);
    if (!context) {
        throw new Error('useBook debe usarse dentro de BookProvider');
    }
    return context;
};

export const BookProvider = ({ children }) => {
    const [selectedBook, setSelectedBook] = useState(null);

    // Cargar libro desde localStorage al iniciar
    useEffect(() => {
        const savedBook = localStorage.getItem('selectedBook');
        if (savedBook) {
            try {
                setSelectedBook(JSON.parse(savedBook));
            } catch (e) {
                console.error('Error al cargar libro guardado:', e);
            }
        }
    }, []);

    // Seleccionar libro y guardarlo en localStorage
    const selectBook = (book) => {
        setSelectedBook(book);
        localStorage.setItem('selectedBook', JSON.stringify(book));
    };

    // Limpiar libro seleccionado
    const clearBook = () => {
        setSelectedBook(null);
        localStorage.removeItem('selectedBook');
    };

    return (
        <BookContext.Provider value={{ selectedBook, selectBook, clearBook }}>
            {children}
        </BookContext.Provider>
    );
};