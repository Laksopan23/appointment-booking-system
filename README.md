# 📅 BookMe - Appointment Booking System

A modern, full-stack appointment booking platform built with Next.js 16, featuring role-based access control, real-time availability management, and a beautiful Aurora Mint themed UI.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)

## ✨ Features

### 👤 For Customers
- Browse available services and providers
- View real-time availability slots
- Book appointments with preferred providers
- Manage and cancel bookings
- View booking history

### 👨‍⚕️ For Providers
- Set and manage availability blocks
- View incoming bookings
- Mark appointments as completed or cancelled
- Track booking history

### 🛡️ For Administrators
- Manage services (create, update, deactivate)
- Approve/reject provider registrations
- View comprehensive audit logs
- System-wide oversight

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 (OKLCH colors) |
| **Database** | PostgreSQL with Prisma ORM 7 |
| **Authentication** | JWT (HTTP-only cookies) |
| **UI Components** | shadcn/ui, Lucide React icons |
| **Theme** | next-themes (Light/Dark mode) |
| **Validation** | Zod |
| **API Docs** | Swagger UI |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Laksopan23/appointment-booking-system.git
   cd appointment-booking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/bookme?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed the database with sample data
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After seeding, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gmail.com | password123 |
| Provider | sarah.johnson@gmail.com | password123 |
| Provider | john.smith@gmail.com | password123 |

## 📁 Project Structure

```
appointment-booking-system/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.ts                 # Seed data
├── src/
│   ├── app/
│   │   ├── admin/              # Admin pages
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── customer/           # Customer pages
│   │   ├── provider/           # Provider pages
│   │   ├── docs/               # API documentation
│   │   ├── globals.css         # Aurora Mint theme
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── PageShell.tsx       # Page wrapper
│   │   └── EmptyState.tsx      # Empty state component
│   ├── lib/
│   │   ├── db.ts               # Prisma client
│   │   ├── http.ts             # API helper
│   │   └── utils.ts            # Utility functions
│   └── server/
│       ├── common/             # Shared server logic
│       ├── bookings/           # Booking schemas
│       └── audit/              # Audit logging
├── middleware.ts               # Route protection
└── package.json
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services |
| POST | `/api/services` | Create service (Admin) |
| PATCH | `/api/services/:id` | Update service (Admin) |
| DELETE | `/api/services/:id` | Soft delete service (Admin) |

### Providers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/providers` | List approved providers |
| GET | `/api/admin/providers` | List all providers (Admin) |
| PATCH | `/api/admin/providers/:id` | Approve/reject provider |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability` | Get availability blocks |
| POST | `/api/availability` | Create availability (Provider) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | List user's bookings |
| POST | `/api/bookings` | Create booking (Customer) |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| PATCH | `/api/bookings/:id/status` | Update status (Provider) |

### Slots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slots` | Get available time slots |

📖 **Full API documentation available at:** `/docs`

## 🎨 Theme System

BookMe uses an **Aurora Mint** theme with OKLCH colors for perceptual uniformity:

- **Primary:** Mint Teal (`oklch(0.65 0.15 175)`)
- **Accent:** Cyan (`oklch(0.7 0.15 195)`)
- **Success:** Green (`oklch(0.65 0.2 145)`)
- **Warning:** Amber (`oklch(0.75 0.15 75)`)
- **Destructive:** Red (`oklch(0.6 0.2 25)`)

Supports **Light** and **Dark** modes with smooth transitions.

## 📜 Available Scripts

```bash
# Development
npm run dev           # Start dev server with Turbopack

# Production
npm run build         # Build for production
npm run start         # Start production server

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run typecheck     # Run TypeScript compiler

# Validation
npm run validate      # Run lint + typecheck + build
npm run security      # Run npm audit

# Database
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db seed    # Seed database
npx prisma studio     # Open Prisma Studio GUI
```

## 🔒 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Role-based access control** (Customer, Provider, Admin)
- **Route protection** via middleware
- **Input validation** with Zod schemas
- **Audit logging** for sensitive operations
- **CSRF protection** built-in

## 🚢 Deployment

### Docker

```bash
docker-compose up -d
```

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm run start
```

## 🧪 CI/CD Pipeline

The project includes a GitHub Actions CI/CD pipeline that runs:

- 🔍 **Lint & Code Quality** - ESLint checks
- 🔷 **TypeScript Check** - Type validation
- 🏗️ **Build** - Production build verification
- 🔒 **Security Audit** - npm vulnerability scan
- 🗄️ **Prisma Validation** - Schema checks

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
</p>
