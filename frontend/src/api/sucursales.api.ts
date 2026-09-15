import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/sucursales'
});

export const sucursalesApi = {
  getAll: async () => {
    const res = await api.get('/');
    return res.data;
  },
  getById: async (id: number) => {
    const res = await api.get(`/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post('/', data);
    return res.data;
  },
  update: async (id: number, data: any) => {
    const res = await api.put(`/${id}`, data);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/${id}`);
    return res.data;
  }
};
