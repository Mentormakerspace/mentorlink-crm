  // Test change to force git to track this file
import axios from 'axios';

// Base URL for the Flask backend API
// Assuming the backend runs on port 5000 locally
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Attach JWT token to all requests if present
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

// Add error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor to include the auth token if available
// This assumes you store the Supabase session token somewhere accessible
// For simplicity, this part is omitted for now, but crucial for protected routes
// apiClient.interceptors.request.use(async (config) => {
//   const { data: { session } } = await supabase.auth.getSession();
//   if (session?.access_token) {
//     config.headers.Authorization = `Bearer ${session.access_token}`;
//   }
//   return config;
// });

// --- API Functions ---

// Deals
export const fetchDeals = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/deals`);
    return response.data;
  } catch (error) {
    console.error('Error fetching deals:', error);
    throw error;
  }
};

export const createDeal = async (dealData: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/deals`, dealData);
    return response.data;
  } catch (error) {
    console.error('Error creating deal:', error);
    throw error;
  }
};

export const updateDeal = async (dealId: number, dealData: any) => {
  const response = await apiClient.put(`/deals/${dealId}`, dealData);
  return response.data;
};

export const deleteDeal = async (dealId: number) => {
  const response = await apiClient.delete(`/deals/${dealId}`);
  return response.data;
};

// Clients
export const fetchClients = async () => {
  const response = await apiClient.get('/clients');
  return response.data.clients;
};

// Users (Sales Reps)
export const fetchUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data.users;
};

// Payment Schedules
export const fetchPaymentSchedules = async (dealId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/deals/${dealId}/payments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payment schedules:', error);
    throw error;
  }
};

// Create Payment Schedule
export const createPaymentSchedule = async (dealId: number, paymentData: any) => {
  const response = await apiClient.post(`/deals/${dealId}/payment_schedules`, paymentData);
  return response.data;
};

// Action Items
export const fetchActionItems = async (dealId: number) => {
  const response = await apiClient.get(`/deals/${dealId}/action_items`);
  return response.data.action_items;
};

// Stage History
export const fetchStageHistory = async (dealId: number) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/deals/${dealId}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stage history:', error);
    throw error;
  }
};

// Add other API functions as needed (e.g., for stats, stages config)

export const login = async (credentials: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export default apiClient;

