# Deal Pipeline CRM

This project is a custom CRM system designed to manage a deal pipeline, track client interactions, manage payments, and integrate with external services like Monday.com for project management kickoff.

It was developed based on specific requirements provided, featuring a backend API built with Flask and PostgreSQL, a frontend interface built with Next.js and React, and automation workflows designed for n8n.

## Features

*   **Client Management:** Store and manage client information.
*   **User Management:** Basic user roles (Owner, Admin, SalesRep) - currently managed via database, authentication via Supabase.
*   **Deal Pipeline:** Track deals through customizable stages (Lead, Prospect, Proposal, Contract, Deposit, etc.).
*   **Kanban View:** Visualize the deal pipeline using a drag-and-drop Kanban board (React frontend).
*   **Estimated Value & Probability:** Track key deal metrics.
*   **Payment Schedules:** Define and track payment milestones for deals.
*   **Stage History:** Log changes in deal stages.
*   **Action Items:** Assign and track tasks related to specific deals.
*   **Statistics Dashboard:** Placeholder for visualizing key metrics (implementation details pending).
*   **Authentication:** Frontend authentication handled via Supabase Auth.
*   **Monday.com Integration (via n8n):** Automatically create/update Monday.com boards/items when a deal deposit is marked as paid.
*   **Automated Reporting (via n8n):** Generate weekly summary reports (requires manual trigger or external scheduling).

## Technology Stack

*   **Backend:**
    *   Python 3.11
    *   Flask
    *   SQLAlchemy
    *   PostgreSQL
    *   Psycopg2 (PostgreSQL adapter)
*   **Frontend:**
    *   Node.js 20
    *   Next.js
    *   React
    *   TypeScript
    *   Tailwind CSS
    *   shadcn/ui (potentially, based on template)
    *   @dnd-kit (for Kanban drag-and-drop)
    *   Supabase Client (for authentication)
    *   Axios (for API communication)
*   **Database:** PostgreSQL 14
*   **Automation:** n8n (Workflows provided as JSON)
*   **Deployment:** Docker, Docker Compose

## Project Structure

```
/
├── crm_backend/
│   ├── src/
│   │   ├── models/       # SQLAlchemy models (client.py, deal.py, etc.)
│   │   ├── routes/       # Flask Blueprints for API endpoints
│   │   ├── static/       # Static files (if any)
│   │   ├── __init__.py
│   │   └── main.py       # Flask app entry point
│   ├── venv/           # Python virtual environment
│   ├── .env.sample     # Sample environment variables
│   ├── requirements.txt # Python dependencies
│   └── Dockerfile      # Dockerfile for backend
├── crm_frontend/
│   ├── public/         # Static assets (e.g., logo.png)
│   ├── src/
│   │   ├── app/        # Next.js app router pages (page.tsx, layout.tsx)
│   │   ├── components/ # React components (KanbanBoard, DealCard, Login, etc.)
│   │   ├── hooks/      # Custom React hooks (useAuth.tsx)
│   │   ├── lib/        # Utility functions (apiClient.ts, supabaseClient.ts)
│   │   └── types/      # TypeScript type definitions (crm.ts)
│   ├── .env.local      # Local environment variables (Created from .env.sample)
│   ├── .env.sample     # Sample environment variables
│   ├── next.config.mjs # Next.js configuration
│   ├── package.json    # Node.js dependencies
│   ├── pnpm-lock.yaml  # Lockfile for pnpm
│   ├── tsconfig.json   # TypeScript configuration
│   └── Dockerfile      # Dockerfile for frontend
├── docker-compose.yml  # Docker Compose setup for all services
├── n8n_documentation.md # Instructions for setting up n8n workflows
├── n8n_workflow_monday_kickoff.json # n8n workflow export
├── n8n_workflow_weekly_report.json  # n8n workflow export
├── todo.md             # Development task list
└── README.md           # This file
```

## Setup and Deployment (Docker Compose)

This project is designed to be run using Docker and Docker Compose for ease of setup and deployment.

### Prerequisites

*   Docker installed: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
*   Docker Compose installed: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)
*   Git (for cloning the repository)
*   A Supabase project (for authentication): [https://supabase.com/](https://supabase.com/)
*   An n8n instance (Cloud or Self-Hosted) for automation: [https://n8n.io/](https://n8n.io/)
*   API keys/credentials for Monday.com, Email (SMTP), and optionally Slack.

### Steps

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Configure Backend Environment:**
    *   Navigate to the `crm_backend` directory.
    *   Copy `.env.sample` to `.env`:
        ```bash
        cp .env.sample .env
        ```
    *   Edit the `.env` file:
        *   Set `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` (these should match the `POSTGRES_*` variables in `docker-compose.yml` unless you override them there).
        *   Set a strong `SECRET_KEY` for Flask session security.
        *   Change `FLASK_ENV` to `production` for deployment.

3.  **Configure Frontend Environment:**
    *   Navigate to the `crm_frontend` directory.
    *   Copy `.env.sample` to `.env.local`:
        ```bash
        cp .env.sample .env.local
        ```
    *   Edit the `.env.local` file:
        *   Replace `YOUR_SUPABASE_PROJECT_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project URL and public anon key (found in your Supabase project settings under API).
        *   Verify `NEXT_PUBLIC_API_URL`. If running via the provided `docker-compose.yml`, the default `http://localhost:5000/api` should work when accessing the frontend from your host machine's browser at `http://localhost:3000`. If deploying differently, adjust this URL to where the backend API is accessible from the user's browser.

4.  **Build and Run Docker Containers:**
    *   From the root project directory (where `docker-compose.yml` is located):
        ```bash
        docker-compose up --build -d
        ```
    *   `--build` forces Docker to rebuild the images if the Dockerfiles or context have changed.
    *   `-d` runs the containers in detached mode (in the background).

5.  **Database Initialization (First Run):**
    *   The backend application includes logic (`db.create_all()`) to create the necessary database tables when it starts if they don't exist. Check the backend container logs to ensure this completes successfully:
        ```bash
        docker-compose logs backend
        ```

6.  **Accessing the Application:**
    *   **Frontend:** Open your web browser and navigate to `http://localhost:3000`.
    *   **Backend API:** The API is accessible at `http://localhost:5000` (e.g., `http://localhost:5000/api/deals`).
    *   **Database:** The PostgreSQL database is exposed on port `5432` of your host machine.

7.  **Creating Initial User(s):**
    *   **Supabase Authentication:** Users need to be created within your Supabase project (Authentication -> Users -> Add user). Ensure you use the same email for Supabase Auth and the CRM database user record.
    *   **CRM Database:** You will need to manually insert corresponding user records into the `users` table in the PostgreSQL database (`crm_db`). Connect to the database (e.g., using `psql` or a GUI tool) and insert records with appropriate roles (`Owner`, `Admin`, `SalesRep`). The `email` must match the Supabase Auth user.
        ```sql
        -- Example using psql after connecting to the database
        INSERT INTO users (name, email, role, created_at, updated_at) VALUES
        ("Admin User", "admin@example.com", "Admin", NOW(), NOW());
        ```

8.  **Setting up n8n Workflows:**
    *   Follow the instructions in `n8n_documentation.md` to import and configure the provided workflow JSON files (`n8n_workflow_monday_kickoff.json`, `n8n_workflow_weekly_report.json`) in your n8n instance.
    *   This involves connecting n8n to your CRM API, Monday.com, Email, and Slack.

## Usage

*   Access the frontend at `http://localhost:3000`.
*   Log in using the email and password you set up in Supabase Auth.
*   Use the "+ Create Deal" button to add new deals.
*   Drag and drop deals between columns on the Kanban board to update their stage.
*   (Further usage details based on implemented features like inline editing, stats dashboard interaction, etc., would be added here as those features are fully built out).

## Stopping the Application

*   From the root project directory:
    ```bash
    docker-compose down
    ```
*   To remove the database volume as well (use with caution, data will be lost):
    ```bash
    docker-compose down -v
    ```

## API Documentation

(See separate API documentation file/section - to be created).

## Future Work / Potential Improvements

*   Implement the optional Stripe/QuickBooks integration.
*   Flesh out the Statistics Dashboard component with actual data visualizations.
*   Implement inline editing for fields on the DealCard.
*   Add filtering and searching capabilities to the Kanban board/deal list.
*   Enhance RBAC within the backend API (currently relies mainly on frontend logic and Supabase Auth).
*   Implement password reset functionality via Supabase.
*   Add more comprehensive tests (unit, integration, end-to-end).
*   Refine UI/UX based on user feedback.

