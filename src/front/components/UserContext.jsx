import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    // 1. Avatar (Sincronizado)
    const [profileImg, setProfileImg] = useState(() => {
        const savedPic = localStorage.getItem('userAvatar'); // Sin JSON.parse si es solo la URL
        return savedPic || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80";
    });

    // 2. Datos de Usuario (Sincronizado)
    const [userData, setUserData] = useState(() => {
        const currentUser = localStorage.getItem('user_data');
        return currentUser ? JSON.parse(currentUser) : null;
    });

    const updateProfileImg = (newUrl) => {
        setProfileImg(newUrl);
        localStorage.setItem('userAvatar', newUrl);
    };

    const updateProfile = (newUser) => {
        setUserData(newUser);
        // ¡IMPORTANTE!: Usar JSON.stringify para que no se guarde como [object Object]
        localStorage.setItem('user_data', JSON.stringify(newUser));
    };

    return (
        <UserContext.Provider value={{ profileImg, updateProfileImg, userData, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
};