# RoomRento - Room & Property Rental Platform 🏠

A modern, responsive web application built with React and Bootstrap for room, hotel, and shop rentals.

## 🚀 Features

- **Room Listings**: Browse and search verified rooms with detailed information
- **Hotel Bookings**: Find and book hotel accommodations
- **Shop Rentals**: Commercial space listings for businesses
- **User Authentication**: Secure login with Google OAuth integration
- **Property Management**: Owner dashboard for managing listings
- **Booking System**: Complete booking workflow with notifications
- **Responsive Design**: Optimized for all devices using Bootstrap 5
- **Real-time Notifications**: Stay updated with booking requests and updates

## 🛠️ Tech Stack

- **Frontend**: React 19, React Router DOM, Bootstrap 5
- **Styling**: Bootstrap 5, Bootstrap Icons, Custom CSS
- **Authentication**: Google OAuth 2.0
- **Maps**: Google Maps API integration
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **Deployment**: Netlify & Vercel ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/RoomRento.git
   cd RoomRento
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=your_backend_url
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start development server**
   ```bash
   npm start
   ```

## 🌐 Deployment

### Netlify Deployment

1. **Automatic Deployment**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Set base directory: `client`

2. **Manual Deployment**
   ```bash
   npm run build
   # Upload the 'build' folder to Netlify
   ```

3. **Environment Variables**
   Add these in Netlify dashboard:
   - `REACT_APP_API_URL`
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_MAPS_API_KEY`

### Vercel Deployment

1. **Automatic Deployment**
   - Connect your GitHub repository to Vercel
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `build`

2. **Manual Deployment**
   ```bash
   npm install -g vercel
   cd client
   npm run build
   vercel --prod
   ```

3. **Environment Variables**
   Add these in Vercel dashboard:
   - `REACT_APP_API_URL`
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_MAPS_API_KEY`

## 📁 Project Structure

```
client/
├── public/
│   ├── _redirects              # Netlify redirects
│   ├── index.html             # HTML template
│   ├── manifest.json          # PWA manifest
│   └── images/                # Static images and favicons
├── src/
│   ├── components/            # React components
│   ├── hooks/                 # Custom hooks
│   ├── styles/                # CSS files
│   ├── App.js                 # Main App component
│   ├── index.js               # Entry point
│   └── config.js              # Configuration
├── vercel.json                # Vercel configuration
├── package.json               # Dependencies
└── .gitignore                 # Git ignore rules
```

## 🎨 Design System

- **Primary Color**: Red (#dc3545)
- **Framework**: Bootstrap 5
- **Icons**: Bootstrap Icons
- **Typography**: System fonts with Roboto fallback
- **Responsive**: Mobile-first design approach

## 🔧 Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 🔒 Security Features

- XSS Protection
- Content Security Policy
- Secure headers configuration
- Input validation and sanitization

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: support@roomrento.com
- WhatsApp: +91 8929082629

## 🚀 Performance

- Lighthouse Score: 90+
- First Contentful Paint: < 2s
- Time to Interactive: < 3s
- Bundle size optimized with code splitting

---

**Happy Coding! 🎉**
