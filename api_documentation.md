# CRM Backend API Documentation

This document outlines the available API endpoints for the Deal Pipeline CRM backend.

**Base URL:** `/api` (e.g., `http://localhost:5000/api`)

## Authentication

Currently, the backend API does not enforce authentication on its endpoints. Authentication is handled by the frontend using Supabase Auth. For production use, it is highly recommended to implement token-based authentication (e.g., validating Supabase JWTs) on the backend API endpoints to protect data.

## Clients (`/clients`)

### `GET /clients`

*   **Description:** Retrieves a list of all clients.
*   **Response (Success - 200):**
    ```json
    {
      "clients": [
        {
          "id": 1,
          "company": "Client A Inc.",
          "contact_name": "Alice Smith",
          "email": "alice@clienta.com",
          "phone": "123-456-7890",
          "monday_board_id": "123456789",
          "created_at": "2025-05-03T00:00:00Z",
          "updated_at": "2025-05-03T00:00:00Z"
        },
        // ... other clients
      ]
    }
    ```

### `POST /clients`

*   **Description:** Creates a new client.
*   **Request Body:**
    ```json
    {
      "company": "New Client Ltd.",
      "contact_name": "Bob Johnson",
      "email": "bob@newclient.com",
      "phone": "987-654-3210" // Optional
    }
    ```
*   **Response (Success - 201):**
    ```json
    {
      "message": "Client created successfully",
      "client": { ... } // Newly created client object
    }
    ```
*   **Response (Error - 400):** If required fields are missing or invalid.

### `GET /clients/<int:client_id>`

*   **Description:** Retrieves details for a specific client.
*   **Response (Success - 200):**
    ```json
    {
      "client": { ... } // Client object
    }
    ```
*   **Response (Error - 404):** If client not found.

### `PUT /clients/<int:client_id>`

*   **Description:** Updates details for a specific client.
*   **Request Body:** (Include fields to update)
    ```json
    {
      "contact_name": "Robert Johnson",
      "phone": "111-222-3333",
      "monday_board_id": "987654321"
    }
    ```
*   **Response (Success - 200):**
    ```json
    {
      "message": "Client updated successfully",
      "client": { ... } // Updated client object
    }
    ```
*   **Response (Error - 404):** If client not found.

### `DELETE /clients/<int:client_id>`

*   **Description:** Deletes a specific client.
*   **Response (Success - 200):**
    ```json
    {
      "message": "Client deleted successfully"
    }
    ```
*   **Response (Error - 404):** If client not found.

---

## Users (`/users`)

### `GET /users`

*   **Description:** Retrieves a list of users. Can filter by role.
*   **Query Parameters:**
    *   `role` (optional): Comma-separated list of roles to filter by (e.g., `?role=Admin,SalesRep`).
*   **Response (Success - 200):**
    ```json
    {
      "users": [
        {
          "id": 1,
          "name": "Admin User",
          "email": "admin@example.com",
          "role": "Admin",
          "created_at": "2025-05-03T00:00:00Z",
          "updated_at": "2025-05-03T00:00:00Z"
        },
        // ... other users
      ]
    }
    ```

### `POST /users`

*   **Description:** Creates a new user.
*   **Request Body:**
    ```json
    {
      "name": "Sales Rep Name",
      "email": "sales@example.com",
      "role": "SalesRep" // Must be one of Owner, Admin, SalesRep
    }
    ```
*   **Response (Success - 201):**
    ```json
    {
      "message": "User created successfully",
      "user": { ... } // Newly created user object
    }
    ```
*   **Response (Error - 400):** If required fields are missing or invalid role.

### `GET /users/<int:user_id>`

*   **Description:** Retrieves details for a specific user.
*   **Response (Success - 200):**
    ```json
    {
      "user": { ... } // User object
    }
    ```
*   **Response (Error - 404):** If user not found.

### `PUT /users/<int:user_id>`

*   **Description:** Updates details for a specific user.
*   **Request Body:** (Include fields to update)
    ```json
    {
      "name": "Updated Name",
      "role": "Admin"
    }
    ```
*   **Response (Success - 200):**
    ```json
    {
      "message": "User updated successfully",
      "user": { ... } // Updated user object
    }
    ```
*   **Response (Error - 404):** If user not found.

### `DELETE /users/<int:user_id>`

*   **Description:** Deletes a specific user.
*   **Response (Success - 200):**
    ```json
    {
      "message": "User deleted successfully"
    }
    ```
*   **Response (Error - 404):** If user not found.

---

## Deals (`/deals`)

### `GET /deals`

*   **Description:** Retrieves a list of all deals.
*   **Response (Success - 200):**
    ```json
    {
      "deals": [
        {
          "id": 1,
          "client_id": 1,
          "sales_rep_id": 2,
          "stage": "Proposal",
          "estimated_value": "5000.00",
          "probability": 0.75,
          "created_at": "2025-05-03T00:00:00Z",
          "updated_at": "2025-05-03T00:00:00Z",
          "expected_close": "2025-06-15",
          "won_on": null,
          "lost_on": null,
          "client_company": "Client A Inc.", // Added via serialization
          "sales_rep_name": "Sales Rep Name" // Added via serialization
        },
        // ... other deals
      ]
    }
    ```

### `POST /deals`

*   **Description:** Creates a new deal.
*   **Request Body:**
    ```json
    {
      "client_id": 1,
      "sales_rep_id": 2,
      "stage": "Lead",
      "estimated_value": "10000.00",
      "probability": 0.1,
      "expected_close": "2025-07-01"
    }
    ```
*   **Response (Success - 201):**
    ```json
    {
      "message": "Deal created successfully",
      "deal": { ... } // Newly created deal object
    }
    ```
*   **Response (Error - 400):** If required fields are missing or invalid.
*   **Note:** Automatically creates an initial `StageHistory` record.

### `GET /deals/<int:deal_id>`

*   **Description:** Retrieves details for a specific deal.
*   **Response (Success - 200):**
    ```json
    {
      "deal": { ... } // Deal object
    }
    ```
*   **Response (Error - 404):** If deal not found.

### `PUT /deals/<int:deal_id>`

*   **Description:** Updates details for a specific deal.
*   **Request Body:** (Include fields to update)
    ```json
    {
      "stage": "Contract",
      "estimated_value": "12000.00",
      "probability": 0.9
    }
    ```
*   **Response (Success - 200):**
    ```json
    {
      "message": "Deal updated successfully",
      "deal": { ... } // Updated deal object
    }
    ```
*   **Response (Error - 404):** If deal not found.
*   **Note:** If `stage` is updated, automatically creates a new `StageHistory` record and updates the previous one.

### `DELETE /deals/<int:deal_id>`

*   **Description:** Deletes a specific deal.
*   **Response (Success - 200):**
    ```json
    {
      "message": "Deal deleted successfully"
    }
    ```
*   **Response (Error - 404):** If deal not found.

---

## Payment Schedules (`/deals/<int:deal_id>/payment_schedules`)

### `GET /deals/<int:deal_id>/payment_schedules`

*   **Description:** Retrieves payment schedules for a specific deal.
*   **Response (Success - 200):**
    ```json
    {
      "payment_schedules": [
        {
          "id": 1,
          "deal_id": 1,
          "milestone_name": "Deposit",
          "amount_due": "2000.00",
          "due_date": "2025-06-20",
          "status": "pending",
          "paid_on": null,
          "created_at": "2025-05-03T00:00:00Z",
          "updated_at": "2025-05-03T00:00:00Z"
        },
        // ... other schedules
      ]
    }
    ```
*   **Response (Error - 404):** If deal not found.

### `POST /deals/<int:deal_id>/payment_schedules`

*   **Description:** Creates a new payment schedule for a deal.
*   **Request Body:**
    ```json
    {
      "milestone_name": "Milestone 1",
      "amount_due": "5000.00",
      "due_date": "2025-07-15",
      "status": "pending" // Optional, defaults to pending
    }
    ```
*   **Response (Success - 201):**
    ```json
    {
      "message": "Payment schedule created successfully",
      "payment_schedule": { ... } // Newly created schedule object
    }
    ```
*   **Response (Error - 404):** If deal not found.
*   **Response (Error - 400):** If required fields are missing.

### `PUT /payment_schedules/<int:schedule_id>`

*   **Description:** Updates a specific payment schedule.
*   **Request Body:** (Include fields to update)
    ```json
    {
      "status": "paid",
      "paid_on": "2025-07-10"
    }
    ```
*   **Response (Success - 200):**
    ```json
    {
      "message": "Payment schedule updated successfully",
      "payment_schedule": { ... } // Updated schedule object
    }
    ```
*   **Response (Error - 404):** If schedule not found.

### `DELETE /payment_schedules/<int:schedule_id>`

*   **Description:** Deletes a specific payment schedule.
*   **Response (Success - 200):**
    ```json
    {
      "message": "Payment schedule deleted successfully"
    }
    ```
*   **Response (Error - 404):** If schedule not found.

---

## Stage History (`/deals/<int:deal_id>/stage_history`)

### `GET /deals/<int:deal_id>/stage_history`

*   **Description:** Retrieves the stage history for a specific deal.
*   **Response (Success - 200):**
    ```json
    {
      "stage_history": [
        {
          "id": 1,
          "deal_id": 1,
          "stage": "Lead",
          "entered_at": "2025-05-01T10:00:00Z",
          "exited_at": "2025-05-02T15:30:00Z"
        },
        {
          "id": 2,
          "deal_id": 1,
          "stage": "Proposal",
          "entered_at": "2025-05-02T15:30:00Z",
          "exited_at": null
        }
        // ... other history records
      ]
    }
    ```
*   **Response (Error - 404):** If deal not found.

---

## Action Items (`/action_items`, `/deals/<int:deal_id>/action_items`)

### `GET /action_items`

*   **Description:** Retrieves a list of action items. Can be filtered.
*   **Query Parameters:**
    *   `completed` (optional, boolean): Filter by completion status (e.g., `?completed=false`).
    *   `owner_id` (optional, int): Filter by owner user ID.
    *   `deal_id` (optional, int): Filter by deal ID.
*   **Response (Success - 200):**
    ```json
    {
      "action_items": [
        {
          "id": 1,
          "deal_id": 1,
          "description": "Follow up call with client",
          "owner_id": 2,
          "due_date": "2025-05-10",
          "completed_at": null,
          "created_at": "2025-05-03T00:00:00Z",
          "updated_at": "2025-05-03T00:00:00Z",
          "owner_name": "Sales Rep Name" // Added via serialization
        },
        // ... other action items
      ]
    }
    ```

### `GET /deals/<int:deal_id>/action_items`

*   **Description:** Retrieves action items specifically for a given deal.
*   **Response (Success - 200):** Same format as `GET /action_items` but filtered by `deal_id`.
*   **Response (Error - 404):** If deal not found.

### `POST /deals/<int:deal_id>/action_items`

*   **Description:** Creates a new action item for a specific deal.
*   **Request Body:**
    ```json
    {
      "description": "Prepare proposal document",
      "owner_id": 2,
      "due_date": "2025-05-15"
    }
    ```
*   **Response (Success - 201):**
    ```json
    {
      "message": "Action item created successfully",
      "action_item": { ... } // Newly created action item object
    }
    ```
*   **Response (Error - 404):** If deal not found.
*   **Response (Error - 400):** If required fields are missing.

### `PUT /action_items/<int:item_id>`

*   **Description:** Updates a specific action item.
*   **Request Body:** (Include fields to update)
    ```json
    {
      "description": "Send final proposal document",
      "completed_at": "2025-05-14T11:00:00Z"
    }
    ```
*   **Response (Success - 200):**
    ```json
    {
      "message": "Action item updated successfully",
      "action_item": { ... } // Updated action item object
    }
    ```
*   **Response (Error - 404):** If action item not found.

### `DELETE /action_items/<int:item_id>`

*   **Description:** Deletes a specific action item.
*   **Response (Success - 200):**
    ```json
    {
      "message": "Action item deleted successfully"
    }
    ```
*   **Response (Error - 404):** If action item not found.

---

## Statistics (`/stats` - Example)

*   **Note:** This endpoint was assumed for the n8n reporting workflow but not explicitly implemented in the provided backend code. It needs to be created.

### `GET /stats`

*   **Description:** Retrieves key business metrics calculated from the CRM data.
*   **Response (Success - 200 - Example):**
    ```json
    {
      "totalPipelineValue": 150000.00,
      "totalContractedValue": 75000.00,
      "currentReceivables": 15000.00,
      "averageDealSize": 12500.00,
      "averageLeadTimePerStage": {
          "Lead": 5.2,
          "Prospect": 10.1,
          "Proposal": 7.5
          // ... other stages
      },
      "averageTimeInStage": {
          "Lead": 7.0,
          "Prospect": 12.5,
          "Proposal": 9.8
          // ... other stages
      }
    }
    ```

