export const openapi = {
  openapi: "3.0.0",
  info: {
    title: "Appointment Booking System API",
    version: "1.0.0",
    description:
      "Swagger docs for Appointment Booking System (Next.js + Prisma)",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local server",
    },
  ],
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Test User" },
                  email: { type: "string", example: "test@gmail.com" },
                  password: { type: "string", example: "password123" },
                  role: {
                    type: "string",
                    enum: ["CUSTOMER", "PROVIDER"],
                    example: "CUSTOMER",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "User created" },
          "400": { description: "Validation error" },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login (sets token cookie)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "test@gmail.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Logged in (cookie set)" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user (reads token cookie)",
        responses: {
          "200": { description: "Returns user or null" },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (clears token cookie)",
        responses: {
          "200": { description: "Logged out" },
        },
      },
    },
    "/api/services": {
      get: {
        tags: ["Services"],
        summary: "List active services",
        responses: {
          "200": { description: "Returns services" },
        },
      },
      post: {
        tags: ["Services"],
        summary: "Create a service (ADMIN only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "durationMinutes"],
                properties: {
                  name: { type: "string", example: "Dental Checkup" },
                  description: {
                    type: "string",
                    example: "Basic dental checkup",
                  },
                  durationMinutes: { type: "number", example: 30 },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Service created" },
          "403": { description: "Forbidden (not admin)" },
        },
      },
    },
    "/api/services/{id}": {
      patch: {
        tags: ["Services"],
        summary: "Update a service (ADMIN only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  durationMinutes: { type: "number" },
                  active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        tags: ["Services"],
        summary: "Soft delete service (ADMIN only)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Deactivated" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/availability": {
      get: {
        tags: ["Availability"],
        summary: "Get availability blocks for a provider on a date",
        parameters: [
          {
            name: "providerId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "date",
            in: "query",
            required: true,
            schema: { type: "string", example: "2026-01-25" },
          },
        ],
        responses: { "200": { description: "Availability list" } },
      },
      post: {
        tags: ["Availability"],
        summary: "Create availability (PROVIDER only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["startAt", "endAt"],
                properties: {
                  startAt: {
                    type: "string",
                    example: "2026-01-25T09:00:00.000Z",
                    format: "date-time",
                  },
                  endAt: {
                    type: "string",
                    example: "2026-01-25T12:00:00.000Z",
                    format: "date-time",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/slots": {
      get: {
        tags: ["Slots"],
        summary: "Get available time slots for a provider + service + date",
        parameters: [
          {
            name: "providerId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "serviceId",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "date",
            in: "query",
            required: true,
            schema: { type: "string", example: "2026-01-25" },
          },
        ],
        responses: { "200": { description: "Slots list" } },
      },
    },
    "/api/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Create booking (CUSTOMER only)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["providerProfileId", "serviceId", "startAt"],
                properties: {
                  providerProfileId: {
                    type: "string",
                    example: "provider_profile_id_here",
                  },
                  serviceId: { type: "string", example: "service_id_here" },
                  startAt: {
                    type: "string",
                    example: "2026-01-25T09:00:00.000Z",
                    format: "date-time",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Booking created" },
          "400": { description: "Validation error" },
          "403": { description: "Forbidden" },
          "409": { description: "Slot already booked" },
        },
      },
      get: {
        tags: ["Bookings"],
        summary: "List bookings (CUSTOMER/PROVIDER: own bookings, ADMIN: all)",
        responses: { "200": { description: "Bookings list" } },
      },
    },
    "/api/bookings/{id}/cancel": {
      patch: {
        tags: ["Bookings"],
        summary:
          "Cancel booking (CUSTOMER who owns it OR PROVIDER who owns it OR ADMIN)",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Cancelled" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/bookings/{id}/status": {
      patch: {
        tags: ["Bookings"],
        summary: "Update booking status (PROVIDER or ADMIN) - e.g., COMPLETED",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["CONFIRMED", "CANCELLED", "COMPLETED"],
                    example: "COMPLETED",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
    "/api/admin/providers": {
      get: {
        tags: ["Admin"],
        summary: "List provider profiles (ADMIN only)",
        responses: {
          "200": { description: "Providers list" },
          "403": { description: "Forbidden" },
        },
      },
    },
    "/api/admin/providers/{providerProfileId}": {
      patch: {
        tags: ["Admin"],
        summary: "Approve/Reject provider (ADMIN only)",
        parameters: [
          {
            name: "providerProfileId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["approved"],
                properties: { approved: { type: "boolean", example: true } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "403": { description: "Forbidden" },
          "404": { description: "Not found" },
        },
      },
    },
  },
} as const;
