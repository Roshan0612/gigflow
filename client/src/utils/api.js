import axios from 'axios';

const api = axios.create({
  // Use the Vite dev server proxy when VITE_API_URL is not provided.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true
});

export default api;
