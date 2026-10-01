# CivicConnect

CivicConnect is a digital service-request management platform designed to replace manual, multi-channel fault-reporting workflows (email, WhatsApp, paper) with a controlled digital lifecycle. It establishes operational visibility, ensures staff accountability, and generates accurate data for management reporting.

**Current Project Status:** Milestone 2 (Architecture, Persistence, and API Baseline)  
**Team:** SEN_Group3_381 (Ioannis Karagounis, Jesse Connor Smith, Viashen Pillay)

## Technology Stack
* **Frontend:** React.js (v18.x) - Single Page Application (SPA)
* **Backend:** Node.js (v24.x) with Express - RESTful API
* **Database:** PostgreSQL (v18.x) - Relational persistence
* **Hosting / Deployment:** Amazon Web Services (AWS)

## Core Features & Role-Based Access
* **Requesters (Citizens):** Submit new service requests, select predefined fault categories, and track the live status and history of their submissions.
* **Staff (Operational Workers):** View the live work queue, assign/reassign tickets, update request statuses through controlled lifecycle transitions, and record operational comments.
* **Management:** Access high-level oversight dashboards to track open, overdue, and resolved tickets, and analyze service performance metrics.

## Repository Structure
```text
SEN_Group3_381/
├── civicconnect-backend/     # Express API, business logic, and database connections
├── civicconnect-frontend/    # React.js user interface and client-side routing
└── PED/                      # Project Engineering Documents and architecture diagrams
