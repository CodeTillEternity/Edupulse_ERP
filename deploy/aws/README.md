# EduPulse ERP — AWS Cloud SaaS Deployment Guide

This guide describes how to deploy the **EduPulse ERP SaaS Central Platform** to Amazon Web Services (AWS) so that **both Web clients and the Windows Desktop Application** connect to the same central cloud backend and database.

---

## Architecture Overview

```
                      +---------------------------------------+
                      |   EduPulse Windows Desktop Edition    |
                      |   (Native DPAPI + Tauri Hardware)     |
                      +-------------------+-------------------+
                                          |
                                          | HTTPS / REST (X-Tenant-Id)
                                          v
+---------------------+      +-----------------------------------------+
|  Web Client (SPA)   | ---> |  AWS Application Load Balancer (ALB)   |
|  (Chrome / Edge)    |      |  (TLS 1.3 / ACM Managed Certificate)    |
+---------------------+      +--------------------+--------------------+
                                                  |
                                                  | Port 8081
                                                  v
                             +-----------------------------------------+
                             |   EduPulse Backend API Container        |
                             |   (Spring Boot 3.3.4 + Java 21)        |
                             |   - Multi-Tenant Header Extraction     |
                             |   - Hikari Connection Pool             |
                             +-----------+-----------------+-----------+
                                         |                 |
                        JPA / Hibernate  |                 | AWS SDK Presigned
                                         v                 v
                 +-------------------------------+   +-----------------------------+
                 | AWS RDS PostgreSQL            |   | Amazon S3 Bucket            |
                 | (Multi-Tenant Schema Partition) | | (Encrypted Student Documents)|
                 +-------------------------------+   +-----------------------------+
```

---

## Deployment Option A: AWS EC2 / Lightsail (Docker Compose)

### 1. Provision Server
- Launch an EC2 instance with **Ubuntu 24.04 LTS** (t3.medium or larger recommended).
- Security Group inbound rules:
  - `80` (HTTP)
  - `443` (HTTPS)
  - `8081` (Direct API, optional if using Nginx reverse proxy)
  - `22` (SSH)

### 2. Configure Environment
Clone the repository and copy the example environment file:
```bash
git clone <repo-url> /opt/edupulse
cd /opt/edupulse/deploy/aws
cp .env.aws.example .env
nano .env
```
Ensure you update:
- `DATABASE_URL` (AWS RDS endpoint)
- `DATABASE_USERNAME` and `DATABASE_PASSWORD`
- `JWT_SECRET` (generate using `openssl rand -hex 32`)
- `AWS_S3_BUCKET` and `AWS_REGION`

### 3. Launch the Stack
```bash
docker compose -f docker-compose.aws.yml up -d --build
```

### 4. Verify Liveness
```bash
curl -f http://localhost:8081/api/health
```
Expected output:
```json
{
  "status": "UP",
  "timestamp": "2026-11-15T11:40:00Z"
}
```

---

## Deployment Option B: AWS ECS Fargate & Application Load Balancer

1. **Push Container to Amazon ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t edupulse-backend -f Institutioanl_ERP_v1.0-main/Institutioanl_ERP_v1.0/backend/Dockerfile .
   docker tag edupulse-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/edupulse-backend:latest
   docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/edupulse-backend:latest
   ```

2. **Register Task Definition**:
   ```bash
   aws ecs register-task-definition --cli-input-json file://deploy/aws/ecs-task-definition.json
   ```

3. **Configure AWS ALB**:
   - Target Group: Port `8081`, Health Check Path `/api/health`.
   - Listener: Port `443` with ACM Certificate forwarding to the backend target group.

---

## Connecting the Desktop Application

Once your AWS SaaS backend is live (e.g. `https://api.edupulse.org`):

1. Launch `EduPulse-ERP-Desktop-v2.exe` on Windows.
2. In the top-right corner of the login screen, click **Switch Endpoint** (or the server pill).
3. Select **EduPulse AWS Cloud (SaaS)** or enter your domain.
4. Click **Test Connection** — the desktop app pings `/api/health` and displays the latency badge (`🟢 Connected (32ms)`).
5. Click **Save & Apply** and log in with your administrative credentials!
