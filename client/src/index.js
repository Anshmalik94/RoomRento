import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "leaflet/dist/leaflet.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <GoogleOAuthProvider clientId="632276644882-rnbq8prpeepluvtvpdqt0b0hie1rtr2b.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);
