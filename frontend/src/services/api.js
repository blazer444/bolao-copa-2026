import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15_000,
});

// Response interceptor — trata erros globalmente
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.error || 'Ocorreu um erro. Tente novamente.';

    if (error.response?.status === 401) {
      // Token expirado — redireciona para login
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status !== 404) {
      toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export default api;
