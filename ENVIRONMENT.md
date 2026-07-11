# BEXO Monorepo Environment Variables Checklist

This document details every environment variable used across the BEXO monorepo, divided by component. Every variable has a built-in fallback default for local development, meaning they are not strictly required for local dev, but must be configured for staging/production deployments.

---

## 1. NestJS Backend API Server (`apps/api`)

| Variable | Description | Local Dev Fallback |
| :--- | :--- | :--- |
| `PORT` | Listening port for the backend server | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://localhost:5432/bexo_dev` |
| `REDIS_URL` | Redis URL for BullMQ queues and parsing cache | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for signing authorization JWTs | `bexo-super-secret-jwt-key-2026` |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh JWTs | `bexo-super-secret-refresh-key-2026` |
| `ADMIN_PHONES` | Comma-separated list of phone numbers authorized for the Admin Console | `+919876543210,+919999999999` |
| `RAZORPAY_KEY_ID` | Razorpay checkout API public key ID | `rzp_test_mockKeyId` |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret key | `mockKeySecret` |
| `RAZORPAY_WEBHOOK_SECRET` | Cryptographic key to verify payment confirmation webhook signatures | `bexo_webhook_secret_2026` |
| `S3_ENDPOINT` | MinIO/S3 object storage endpoint | `http://localhost:9000` |
| `S3_BUCKET` | Storage bucket name for assets | `bexo-assets` |
| `S3_REGION` | S3 endpoint region | `us-east-1` |
| `S3_ACCESS_KEY` | Access Key ID for MinIO/S3 storage | `bexo_admin` |
| `S3_SECRET_KEY` | Secret Access Key for MinIO/S3 storage | `bexo_minio_secret` |
| `NODE_ENV` | Environment identifier (sets cookie flags secure/insecure) | `development` |

---

## 2. Next.js Portfolio Rendering Engine (`apps/rendering`)

| Variable | Description | Local Dev Fallback |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string (must match the API DB) | `postgresql://localhost:5432/bexo_dev` |
| `REDIS_URL` | Redis connection URL for caching compiled pages | `redis://redis://localhost:6379` |
| `NEXT_PUBLIC_CDN_BASE_URL` | CDN base address for rendering profiles images/files | `http://localhost:9000/bexo-assets` |

---

## 3. Student Web App Onboarding Wizard (`apps/web`)

| Variable | Description | Local Dev Fallback |
| :--- | :--- | :--- |
| `VITE_API_URL` | Destination URL of the NestJS backend API | `http://localhost:3000/api/v1` |
| `VITE_RENDERING_URL` | URL of the Next.js portfolio rendering engine (used by Step 8 iframe and Step 9 view link) | `http://localhost:3000` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key loaded by official `checkout.js` script | `rzp_test_mockKeyId` |

---

## 4. Admin Console (`apps/admin`)

| Variable | Description | Local Dev Fallback |
| :--- | :--- | :--- |
| `VITE_API_URL` | Destination URL of the NestJS backend API | `http://localhost:3000/api/v1` |
