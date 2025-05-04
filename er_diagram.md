```mermaid
erDiagram
    CLIENT ||--o{ DEAL : has
    USER ||--o{ DEAL : assigned_to (SalesRep)
    USER ||--o{ ACTION_ITEM : owns
    DEAL ||--o{ PAYMENT_SCHEDULE : includes
    DEAL ||--o{ STAGE_HISTORY : tracks
    DEAL ||--o{ ACTION_ITEM : requires

    CLIENT {
        INT id PK
        VARCHAR company
        VARCHAR contact_name
        VARCHAR email UK
        VARCHAR phone
        VARCHAR monday_board_id NULL
    }

    USER {
        INT id PK
        VARCHAR name
        VARCHAR email UK
        VARCHAR role "Enum: Owner, Admin, SalesRep"
    }

    DEAL {
        INT id PK
        INT client_id FK
        INT sales_rep_id FK "References User(id)"
        VARCHAR stage "Configurable stages"
        DECIMAL estimated_value
        FLOAT probability "0.0 to 1.0"
        TIMESTAMP created_at
        TIMESTAMP updated_at
        DATE expected_close
        DATE won_on NULL
        DATE lost_on NULL
    }

    PAYMENT_SCHEDULE {
        INT id PK
        INT deal_id FK
        VARCHAR milestone_name
        DECIMAL amount_due
        DATE due_date
        VARCHAR status "Enum: pending, paid"
        DATE paid_on NULL
    }

    STAGE_HISTORY {
        INT id PK
        INT deal_id FK
        VARCHAR stage "References Deal stage value at the time"
        TIMESTAMP entered_at
        TIMESTAMP exited_at NULL
    }

    ACTION_ITEM {
        INT id PK
        INT deal_id FK
        TEXT description
        INT owner_id FK "References User(id)"
        DATE due_date
        TIMESTAMP completed_at NULL
    }
```
