// Define basic types for the frontend based on the backend models

export interface Client {
    id: number;
    company: string;
    contact_name: string;
    email: string;
    phone?: string;
    monday_board_id?: string;
    created_at: string; // ISO string format
    updated_at: string; // ISO string format
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: "Owner" | "Admin" | "SalesRep";
    created_at: string;
    updated_at: string;
}

export interface Deal {
    id: number;
    client_id: number;
    sales_rep_id: number;
    stage: string;
    estimated_value: string; // Keep as string due to DECIMAL
    probability: number;
    created_at: string;
    updated_at: string;
    expected_close?: string;
    won_on?: string;
    lost_on?: string;
    // Optional related data from backend serialization
    client_company?: string;
    sales_rep_name?: string;
}

export interface PaymentSchedule {
    id: number;
    deal_id: number;
    milestone_name: string;
    amount_due: string; // Keep as string due to DECIMAL
    due_date: string;
    status: "pending" | "paid";
    paid_on?: string;
    created_at: string;
    updated_at: string;
}

export interface StageHistory {
    id: number;
    deal_id: number;
    stage: string;
    entered_at: string;
    exited_at?: string;
}

export interface ActionItem {
    id: number;
    deal_id: number;
    description: string;
    owner_id: number;
    due_date: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
    owner_name?: string; // Optional related data
}

// Type for the structure returned by fetchDeals
export interface DealsApiResponse {
    deals: Deal[];
}

// Add other API response types as needed

