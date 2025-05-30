import axios, { AxiosInstance } from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UpdateUserPayload {
  role: string;
}

const apiClient: AxiosInstance & {
  getUsers: () => Promise<User[]>;
  createUser: (payload: CreateUserPayload) => Promise<void>;
  updateUser: (id: number, payload: UpdateUserPayload) => Promise<void>;
} = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.getUsers = async () => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

apiClient.createUser = async (payload: CreateUserPayload) => {
  await apiClient.post('/users', payload);
};

apiClient.updateUser = async (id: number, payload: UpdateUserPayload) => {
  await apiClient.patch(`/users/${id}`, payload);
};

export default apiClient;