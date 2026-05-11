import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('cms_token') || (typeof window !== 'undefined' ? localStorage.getItem('cms_token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('cms_token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cms_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.put('/auth/me', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
};

// Pages
export const pagesApi = {
  list: (params?: any) => api.get('/pages', { params }),
  get: (id: string) => api.get(`/pages/${id}`),
  create: (data: any) => api.post('/pages', data),
  update: (id: string, data: any) => api.put(`/pages/${id}`, data),
  delete: (id: string) => api.delete(`/pages/${id}`),
};

// Posts
export const postsApi = {
  list: (params?: any) => api.get('/posts', { params }),
  get: (id: string) => api.get(`/posts/${id}`),
  create: (data: any) => api.post('/posts', data),
  update: (id: string, data: any) => api.put(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

// Media
export const mediaApi = {
  list: (params?: any) => api.get('/media', { params }),
  upload: (formData: FormData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id: string, data: any) => api.put(`/media/${id}`, data),
  delete: (id: string) => api.delete(`/media/${id}`),
  getUrl: (key: string) => `${API_URL}/media/file/${encodeURIComponent(key)}`,
};

// Settings
export const settingsApi = {
  get: (group?: string) => api.get('/settings', { params: group ? { group } : {} }),
  update: (data: Record<string, string>) => api.put('/settings', data),
  updateOne: (key: string, value: string) => api.put(`/settings/${key}`, { value }),
};

// Users
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  get: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Languages
export const languagesApi = {
  list: () => api.get('/languages'),
  create: (data: any) => api.post('/languages', data),
  update: (id: string, data: any) => api.put(`/languages/${id}`, data),
  delete: (id: string) => api.delete(`/languages/${id}`),
};

// Translations
export const translationsApi = {
  list: (params?: any) => api.get('/translations', { params }),
  flat: (lang: string, ns: string) => api.get(`/translations/flat/${lang}/${ns}`),
  upsert: (data: any) => api.post('/translations', data),
  bulk: (data: any) => api.post('/translations/bulk', data),
  delete: (id: string) => api.delete(`/translations/${id}`),
};

// Taxonomy
export const taxonomyApi = {
  listCategories: () => api.get('/taxonomy/categories'),
  createCategory: (data: any) => api.post('/taxonomy/categories', data),
  updateCategory: (id: string, data: any) => api.put(`/taxonomy/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/taxonomy/categories/${id}`),
  listTags: () => api.get('/taxonomy/tags'),
  createTag: (data: any) => api.post('/taxonomy/tags', data),
  updateTag: (id: string, data: any) => api.put(`/taxonomy/tags/${id}`, data),
  deleteTag: (id: string) => api.delete(`/taxonomy/tags/${id}`),
};

// Navigation
export const navigationApi = {
  getAll: () => api.get('/navigation'),
  getByLocation: (location: string) => api.get(`/navigation/${location}`),
  createMenu: (data: any) => api.post('/navigation/menus', data),
  addItem: (menuId: string, data: any) => api.post(`/navigation/${menuId}/items`, data),
  updateItem: (id: string, data: any) => api.put(`/navigation/items/${id}`, data),
  deleteMenu: (id: string) => api.delete(`/navigation/menus/${id}`),
  deleteItem: (id: string) => api.delete(`/navigation/items/${id}`),
};

// Dashboard
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
};

// Public API (no auth needed)
export const publicApi = {
  settings: () => axios.get(`${API_URL}/public/settings`),
  page: (slug: string) => axios.get(`${API_URL}/public/pages/${slug}`),
  posts: (params?: any) => axios.get(`${API_URL}/public/posts`, { params }),
  post: (slug: string) => axios.get(`${API_URL}/public/posts/${slug}`),
  navigation: (location: string) => axios.get(`${API_URL}/public/navigation/${location}`),
  translations: (lang: string, ns: string) => axios.get(`${API_URL}/public/translations/${lang}/${ns}`),
};
