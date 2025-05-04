# n8n Workflow Documentation

This document explains how to set up and use the provided n8n workflow JSON files for the Deal Pipeline CRM.

Due to technical limitations in the development environment, the n8n service could not be reliably accessed via a public URL. Therefore, the workflows have been exported as JSON files for you to import into your own n8n instance (cloud or self-hosted).

## Prerequisites

*   An active n8n instance (Cloud or Self-Hosted).
*   Credentials configured within your n8n instance for:
    *   **Monday.com:** API Token (You provided one during development: `eyJhbG...fCJA`).
    *   **Email (SMTP):** Server details (host, port, user, password/app password) for sending reports.
    *   **(Optional) Slack:** Bot Token if you want Slack notifications.
*   Access to the CRM Backend API (running locally via Docker Compose or deployed elsewhere).

## Provided Workflows

1.  `n8n_workflow_monday_kickoff.json`: Handles integration with Monday.com when a deal deposit is marked as paid.
2.  `n8n_workflow_weekly_report.json`: Generates and sends a weekly summary report (requires manual triggering).

## Importing Workflows

1.  Log in to your n8n instance.
2.  Navigate to the "Workflows" section.
3.  Click on "Import from File".
4.  Select one of the provided JSON files (`n8n_workflow_monday_kickoff.json` or `n8n_workflow_weekly_report.json`) and import it.
5.  Repeat for the other JSON file.

## Configuring Workflows

After importing, you need to configure each workflow:

### 1. Monday.com Kickoff Workflow (`n8n_workflow_monday_kickoff.json`)

*   **Webhook Trigger:**
    *   Activate the workflow in n8n.
    *   Copy the **Test Webhook URL** provided by the n8n Webhook node.
    *   You will need to configure the CRM Backend to send a POST request to this URL when a deal's payment status indicates a deposit has been received. The backend should send a JSON payload containing at least `{ "deal": { "id": ..., "client_id": ... }, "client": { "id": ..., "company": ..., "contact_name": ..., "email": ... } }`.
    *   Replace the Test URL with the **Production Webhook URL** in your backend configuration once you are ready to go live.
*   **Fetch Full Client Details / Update Client in CRM:**
    *   Verify the `url` parameter in these HTTP Request nodes points to the correct address of your running CRM Backend API (e.g., `http://backend:5000/api/...` if running via the provided Docker Compose, or your deployed backend URL).
*   **Create Monday Board / Create Monday Item (Kickoff):**
    *   Select the Monday.com credentials you configured in n8n from the dropdown menu in these nodes.
*   **Send Welcome Email:**
    *   Select the SMTP credentials you configured in n8n.
    *   Update the `from` email address.
    *   Customize the email `subject` and `html` body, especially the `[Your Agency Name]` placeholder and potentially the Monday board link structure.
*   **Notify #sales on Slack:**
    *   Select the Slack credentials you configured in n8n.
    *   Update the `channel` name if needed.

### 2. Weekly Report Workflow (`n8n_workflow_weekly_report.json`)

*   **Manual/Webhook Trigger:**
    *   This workflow needs to be triggered manually from the n8n UI or via its Webhook URL.
    *   **Note:** Automatic scheduling (e.g., every Monday at 9 AM) is **not** possible within the development environment where this was built. You will need to handle scheduling externally if required.
*   **Fetch CRM Stats / Fetch Outstanding Action Items / Fetch Report Recipients:**
    *   Verify the `url` parameter in these HTTP Request nodes points to the correct address of your running CRM Backend API (e.g., `http://backend:5000/api/...`).
    *   Ensure the corresponding API endpoints (`/api/stats`, `/api/action_items`, `/api/users`) exist and return data in the expected format (see node notes in the workflow JSON for details).
*   **Send Report Email:**
    *   Select the SMTP credentials you configured in n8n.
    *   Update the `from` email address.
    *   Review the `subject` and `html` body for accuracy.
*   **Notify #reports on Slack (Optional):**
    *   Select the Slack credentials you configured in n8n.
    *   Update the `channel` name if needed.

## Activating Workflows

Once configured, make sure to **activate** both workflows in the n8n UI so they can receive webhook triggers or be run manually.

