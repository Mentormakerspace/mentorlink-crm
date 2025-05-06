   // Trigger redeploy: test comment

import axios from 'axios';
import { StageHistory, PaymentSchedule, Client as CrmClient, User } from '../types/crm';

// Define types for our data structures
export interface Deal {
  id: number;
  title: string;
  description: string;
  status: string;
  client_id: number;
  amount: number;
  created_at: string;
  updated_at: string;
  sales_rep_id: number;     
  stage: string;             
  estimated_value: string;   
  probability: number;      
  expected_close?: string;
  won_on?: string;
  lost_on?: string;
  client_company?: string;
  sales_rep_name?: string;
}

// Use the Client type from crm.ts
export type Client = CrmClient;

export interface Payment {
  id: number;
  deal_id: number;
  amount: number;
  payment_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API client class
class ApiClient {
  // Deals
  async getDeals(): Promise<Deal[]> {
    const response = await api.get('/deals');
    return response.data;
  }

  async createDeal(deal: Partial<Deal>): Promise<Deal> {
    const response = await api.post('/deals', deal);
    return response.data;
  }

  async updateDeal(id: number, deal: Partial<Deal>): Promise<Deal> {
    const response = await api.put(`/deals/${id}`, deal);
    return response.data;
  }

  async deleteDeal(id: number): Promise<void> {
    await api.delete(`/deals/${id}`);
  }

  // Clients
  async getClients(): Promise<Client[]> {
    const response = await api.get('/clients');
    return response.data;
  }

  async createClient(client: Partial<Client>): Promise<Client> {
    const response = await api.post('/clients', client);
    return response.data;
  }

  async updateClient(id: number, client: Partial<Client>): Promise<Client> {
    const response = await api.put(`/clients/${id}`, client);
    return response.data;
  }

  async deleteClient(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  }

  // Payments
  async getPayments(dealId: number): Promise<Payment[]> {
    const response = await api.get(`/deals/${dealId}/payments`);
    return response.data;
  }

  async createPayment(dealId: number, payment: Partial<Payment>): Promise<Payment> {
    const response = await api.post(`/deals/${dealId}/payments`, payment);
    return response.data;
  }

  async updatePayment(dealId: number, paymentId: number, payment: Partial<Payment>): Promise<Payment> {
    const response = await api.put(`/deals/${dealId}/payments/${paymentId}`, payment);
    return response.data;
  }

  async deletePayment(dealId: number, paymentId: number): Promise<void> {
    await api.delete(`/deals/${dealId}/payments/${paymentId}`);
  }

  // Stats and Analytics
  async getDealStats(): Promise<any> {
    const response = await api.get('/stats/deals');
    return response.data;
  }

  async getClientStats(): Promise<any> {
    const response = await api.get('/stats/clients');
    return response.data;
  }

  async getPaymentStats(): Promise<any> {
    const response = await api.get('/stats/payments');
    return response.data;
  }

  // Users
  async createUser(user: { name: string; email: string; password: string; role: string }): Promise<User> {
    const response = await api.post('/users', user);
    return response.data;
  }

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// --- Legacy/Named Exports for Compatibility ---

export const fetchDeals = () => apiClient.getDeals();
export const fetchClients = () => apiClient.getClients();
export const fetchUsers = async () => { /* TODO: implement or replace with real logic */ return []; };
export const createDeal = (deal: Partial<Deal>) => apiClient.createDeal(deal);
export const updateDeal = (id: number, deal: Partial<Deal>) => apiClient.updateDeal(id, deal);
export const fetchStageHistory = async (dealId: number): Promise<StageHistory[]> => { /* TODO: implement or replace with real logic */ return []; };
export const fetchPaymentSchedules = async (dealId: number): Promise<PaymentSchedule[]> => { /* TODO: implement or replace with real logic */ return []; };
export const createPaymentSchedule = async (...args: any[]) => { /* TODO: implement or replace with real logic */ return {}; };
export const login = (email: string, password: string) => apiClient.login(email, password);
export const createUser = (user: { name: string; email: string; password: string; role: string }) => apiClient.createUser(user);

// --- Default Export for Compatibility ---
export default apiClient;
