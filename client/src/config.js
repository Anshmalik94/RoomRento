const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : 'https://roomrento.onrender.com';

export default BASE_URL;
