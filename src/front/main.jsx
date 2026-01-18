import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { StoreProvider } from './hooks/useGlobalReducer';
import { BackendURL } from './components/BackendURL';
import { BookProvider } from './components/BookContext';
import { ChatProvider } from './components/ChatContext';

const Main = () => {

    if (! import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL == "") return (
        <React.StrictMode>
            <BackendURL />
        </React.StrictMode>
    );
    return (
        <React.StrictMode>
            <StoreProvider>
                <BookProvider>
                    <ChatProvider>
                        <RouterProvider router={router} />
                    </ChatProvider>
                </BookProvider>
            </StoreProvider>
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />)