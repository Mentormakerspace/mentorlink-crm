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

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})as AxiosInstance & {
  getUsers: () => Promise<User[]>;
  createUser: (payload: CreateUserPayload) => Promise<void>;
  updateUser: (id: number, payload: UpdateUserPayload) => Promise<void>;
  fetchDeals: () => Promise<any[]>;
  updateDeal: (dealId: number, data: any) => Promise<any>;
  fetchStageHistory: (dealId: number) => Promise<any[]>;
  fetchPaymentSchedules: (dealId: number) => Promise<any[]>;
  fetchClients: () => Promise<any[]>;
  fetchUsers: () => Promise<any[]>;
  createDeal: (dealData: any) => Promise<any>;
  createPaymentSchedule: (dealId: number, scheduleData: any) => Promise<any>;
};

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

apiClient.fetchDeals = async () => {
  const response = await apiClient.get('/deals');
  return response.data.deals;
};

apiClient.updateDeal = async (dealId: number, data: any) => {
  const response = await apiClient.put(`/deals/${dealId}`, data);
  return response.data;
};

apiClient.fetchStageHistory = async (dealId: number) => {
  const response = await apiClient.get(`/deals/${dealId}/stage_history`);
  return response.data.stage_history;
};

apiClient.fetchPaymentSchedules = async (dealId: number) => {
  const response = await apiClient.get(`/deals/${dealId}/payment_schedules`);
  return response.data.payment_schedules;
};

export const login = async (credentials: { email: string; password: string }) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

apiClient.fetchClients = async () => {
  const response = await apiClient.get('/clients');
  return response.data.clients || response.data;
};

apiClient.fetchUsers = async () => {
  return await apiClient.getUsers();
};

apiClient.createDeal = async (dealData: any) => {
  const response = await apiClient.post('/deals', dealData);
  return response.data;
};

apiClient.createPaymentSchedule = async (dealId: number, scheduleData: any) => {
  const response = await apiClient.post(`/deals/${dealId}/payment_schedules`, scheduleData);
  return response.data;
};

export const fetchDeals = apiClient.fetchDeals;
export const fetchStageHistory = apiClient.fetchStageHistory;
export const fetchPaymentSchedules = apiClient.fetchPaymentSchedules;
export const fetchClients = apiClient.fetchClients;
export const fetchUsers = apiClient.fetchUsers;
export const createDeal = apiClient.createDeal;
export const createPaymentSchedule = apiClient.createPaymentSchedule;

export default apiClient;
