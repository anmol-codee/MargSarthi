import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // withCredentials removed — refresh token now stored in localStorage
  // to fix mobile browser cross-domain cookie blocking (Safari ITP, Chrome restrictions)
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken }
        );

        if (data.success) {
          localStorage.setItem('accessToken', data.data.accessToken);
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
