# Hungrybuy

A AR based digital menu and table-based ordering system designed to enhance the dining experience for restaurants. Multiple users at the same table can collectievely browse the menu, manage a shared cart, place orders, and track order status in real time - with full auditability.

## Features

- QR based table identification
- Shared cart per table
- Multiple users can contribute to the same cart
- Multiple orders per table
- Role based access control (RBAC)
- Menu with categories and filters available
- Real time updates using websockets
- Complete audit logging for accountability
- Sales report and order history

## Tech Stack

- **Node.js + TypeScript**
- **Express**
- **Prisma ORM**
- **PostgreSQL**
- **Socket.io**
- **Next.js**
- **Redux**
- **Docker**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/gamut-endeavors/hungrybuy.git
cd hungrybuy
```

### 2. Environment Setup

Copy the `.env.example` to `.env` in each service (admin, client and server).
Update the values of environment variables in each of this service.

### 3. Database Setup and Migrations

Generate prisma client

```bash
npx prisma generate
```

Run migrations

```bash
npx prisma migrate dev
```

### 4. Seed Admin user

```bash
npm run seed
```

## Running the App

### Development Mode

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

### Production Mode

```bash
docker compose up -d --build
```

## Running Migrations when Schema Changes

```bash
npx prisma migrate dev --name migration_name
```

## Prisma Studio

```bash
npx prisma studio
```

## Developer Notes

- OPT is fixed to `111111` for development purposes
- Payments are handled outside the system
