import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App/><Toaster position="top-right" toastOptions={{duration:3200, style:{borderRadius:14, background:'#242821', color:'#fff'}}}/></BrowserRouter></React.StrictMode>);
