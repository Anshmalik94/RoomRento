
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "leaflet/dist/leaflet.css";
import './custom.css'; // Custom CSS overrides

const root = ReactDOM.createRoot(document.getElementById('root'));

// Google OAuth Client ID - use environment variable for production
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "632276644882-rnbq8prpeepluvtvpdqt0b0hie1rtr2b.apps.googleusercontent.com";

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
