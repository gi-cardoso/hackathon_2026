import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export async function uploadInvoice(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<unknown>('/invoices/parse', formData);
  return response.data;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@COCAPEC_FORNECEDOR:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
