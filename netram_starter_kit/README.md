# Netram Eye Health Platform - Monorepo Starter Kit

This starter kit provides the basic structure for the Netram Eye Health Platform, following a modular, service-oriented architecture.

## 📂 Project Structure

The monorepo is organized as follows:

-   **/apps**: Contains frontend applications.
    -   `web-client`: Next.js application for the main web interface (Admin, Doctor, Receptionist, Patient dashboards).
    -   `mobile-client`: Placeholder for the React Native or Flutter mobile application.
    -   `desktop-client`: (Optional) Placeholder for an Electron-based desktop application.
-   **/services**: Contains backend microservices.
    -   `api-gateway`: Handles routing and aggregation of API requests.
    -   `auth-service`: Manages user authentication and authorization.
    -   `patient-service`: Handles patient data management.
    -   `emr-service`: Manages Electronic Medical Records.
    -   `billing-service`: Handles billing and payments.
    -   `ai-service`: Integrates with AI/ML models (e.g., Gemini, GPT-4, TensorFlow) for diagnostics, transcription, etc.
-   **/shared**: Contains shared code and components.
    -   `ui`: Shared UI components (e.g., Design System).
    -   `utils`: Shared utility functions, types, and constants.
-   **/infra**: Contains infrastructure-as-code configurations.
    -   `docker`: Dockerfiles for services and apps.
    -   `k8s`: Kubernetes deployment manifests.
    -   `terraform`: Terraform scripts for cloud resource provisioning.
-   **/docs**: Contains project documentation, API specifications, compliance policies, etc.

## 🚀 Getting Started

### Prerequisites

-   Node.js (latest LTS version)
-   npm or Yarn
-   Python (for AI services)
-   Docker (optional, for containerization)
-   Firebase CLI
-   Access to Google Cloud, AWS, or Azure (depending on deployment choice)

### Setup

1.  **Clone the repository (or initialize based on this starter kit).**
2.  **Environment Variables:**
    *   Copy the `.env.example` file to `.env` in the root directory.
    *   Fill in your Firebase project credentials and any other necessary API keys (OpenAI, Twilio, etc.).
    *   Each service/app might have its own `.env` file or rely on the root one.
3.  **Install Dependencies:**
    *   For the root (if using workspaces with Lerna/Yarn/PNPM): `yarn install` or `pnpm install`
    *   Navigate to each app/service directory and install its specific dependencies:
        *   `cd apps/web-client && npm install` (or yarn/pnpm)
        *   `cd services/api-gateway && npm install`
        *   `cd services/ai-service && pip install -r requirements.txt`
        *   ...and so on for other services.
4.  **Firebase Setup:**
    *   Ensure your Firebase project is created and configured.
    *   Update `firebase.json` with your project ID if needed.
    *   Deploy Firestore rules and Cloud Functions if applicable.
5.  **Run Applications/Services:**
    *   **Web Client (Next.js):**
        ```bash
        cd apps/web-client
        npm run dev
        ```
    *   **API Gateway (Node.js/Express):**
        ```bash
        cd services/api-gateway
        npm run dev
        ```
    *   **AI Service (Python/FastAPI):**
        ```bash
        cd services/ai-service
        uvicorn main:app --reload
        ```
    *   Follow similar steps for other services.

## 🛠️ Technologies Used

-   **Frontend (Web):** Next.js (React)
-   **Frontend (Mobile - Placeholder):** React Native / Flutter
-   **Backend APIs:** Node.js + Express / FastAPI (Python)
-   **Real-time Updates:** Socket.IO / WebSockets
-   **AI/ML Models:** Gemini Pro, GPT-4, TensorFlow Lite (via `ai-service`)
-   **Data Storage:** PostgreSQL (Primary), MongoDB (Optional, e.g., for logs)
-   **File Storage:** Firebase Storage / AWS S3
-   **Authentication:** Firebase Auth / Custom JWT with OAuth 2.0
-   **Notifications:** Firebase Cloud Messaging (FCM), Twilio, WhatsApp API
-   **Video Consultations:** WebRTC, Agora.io, or Daily.co

Refer to the detailed framework documentation for more information on architecture, modules, and best practices.

## 📜 License

This project is licensed under the [MIT License](LICENSE.md) (or your chosen license).
```