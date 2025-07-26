# Stock Track Alert

This is a stock tracking and alert application designed to monitor stock prices and notify users when predefined thresholds are met. It features a web-based interface for managing stock alerts (CRUD operations) and backend services for polling stock prices and sending notifications.

## Features

*   **Stock Watchlist Management:** Add, view, edit, and delete stock alerts with specified upper and lower price thresholds.
*   **Price Monitoring:** Backend services (Poller) periodically fetch stock prices.
*   **Threshold Alerts:** Notifications are triggered (Notifier) when a stock's price crosses its defined upper or lower threshold.

## Technologies Used

*   **Frontend:** Next.js (React) with App Router
*   **Backend (API/Server Actions):** Next.js Server Actions, AWS SDK for JavaScript
*   **Database:** AWS DynamoDB (local setup for development)
*   **Polling/Notification Services:** Deno
*   **Containerization:** Docker
*   **Infrastructure as Code:** Terraform

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

*   **Node.js:** v18.x or higher (includes npm)
*   **Docker:** Latest version (for local DynamoDB)
*   **AWS CLI:** Configured with dummy credentials for local DynamoDB access.
*   **Terraform:** Latest version (for setting up local DynamoDB table)
*   **Deno:** Latest version (for running poller and notifier services)

## Local Setup

Follow these steps to get the application running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/stock-track-alert.git
cd stock-track-alert
```

### 2. Install Frontend Dependencies

Navigate to the `src/app` directory and install the Node.js dependencies:

```bash
cd src/app
npm install
cd ../.. # Go back to the project root
```

### 3. Set up Local DynamoDB

We'll use Docker to run a local instance of DynamoDB and Terraform to create the necessary table.

#### Start Local DynamoDB with Docker

```bash
docker-compose up -d dynamodb
```

#### Create DynamoDB Table using Terraform

Navigate to the `infra/envs/dev` directory and initialize Terraform, then apply the configuration to create the `stock-track-alert-watchlist-dev` table.

```bash
cd infra/envs/dev
terraform init
terraform apply -auto-approve
cd ../../.. # Go back to the project root
```

#### Configure AWS CLI for Local DynamoDB

You need to configure your AWS CLI to point to the local DynamoDB instance. You can use dummy credentials as they won't be used for actual AWS services.

```bash
aws configure
# AWS Access Key ID [None]: test
# AWS Secret Access Key [None]: test
# Default region name [None]: us-east-1
# Default output format [None]: json
```

Also, set the DynamoDB endpoint in your environment variables. You can add this to your `.bashrc`, `.zshrc`, or equivalent, or set it temporarily in your terminal session:

```bash
export AWS_REGION=us-east-1
export DYNAMODB_ENDPOINT=http://localhost:8000
```

### 4. Run the Next.js Application

Now, you can start the Next.js development server.

```bash
cd src/app
npm run dev
```

The application should now be running at `http://localhost:3000`. Open your browser and navigate to this address to access the Stock Track Alert UI.

### 5. Running Poller and Notifier Services (Optional)

The `poller` and `notifier` services are implemented in Deno. You can run them separately to test the full alerting flow.

#### Poller

The poller fetches stock prices and puts messages into an SQS queue (which would typically be set up via Terraform for a real environment). For local testing, you might need to mock or manually trigger this.

```bash
deno run --allow-net --allow-env src/poller/main.ts
```

#### Notifier

The notifier consumes messages from the SQS queue and sends alerts.

```bash
deno run --allow-net --allow-env src/notifier/main.ts
```

**Note:** For a complete local testing of the poller and notifier, you would typically need a local SQS setup (e.g., using LocalStack or a similar Docker image) and proper configuration for Finnhub API keys. This README focuses on getting the main CRUD application running.

## Project Structure

*   `src/app/`: Next.js application (frontend and server actions).
    *   `src/app/app/`: App Router pages and layout.
    *   `src/app/lib/`: Database client and server actions.
    *   `src/app/ui/`: React client components.
*   `src/notifier/`: Deno service for sending notifications.
*   `src/poller/`: Deno service for polling stock prices.
*   `infra/`: Terraform configurations for AWS resources (DynamoDB, Lambda, SQS).
    *   `infra/envs/dev/`: Development environment specific Terraform.
*   `docker/`: Dockerfiles for various services.
*   `test/`: Test files.
