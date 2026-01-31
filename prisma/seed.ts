import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

// Generate IDs like: AD0001, PR0001, CU0001, SV0001, AV0001, BK0001
async function generateId(prefix: "AD" | "PR" | "CU" | "SV" | "AV" | "BK") {
  const counter = await prisma.idCounter.upsert({
    where: { prefix },
    update: { counter: { increment: 1 } },
    create: { prefix, counter: 1 },
    select: { counter: true },
  });
  return `${prefix}${String(counter.counter).padStart(4, "0")}`;
}

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.providerService.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.providerProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.idCounter.deleteMany();

  // Initialize ID counters
  await Promise.all([
    prisma.idCounter.upsert({
      where: { prefix: "AD" },
      update: {},
      create: { prefix: "AD", counter: 0 },
    }),
    prisma.idCounter.upsert({
      where: { prefix: "PR" },
      update: {},
      create: { prefix: "PR", counter: 0 },
    }),
    prisma.idCounter.upsert({
      where: { prefix: "CU" },
      update: {},
      create: { prefix: "CU", counter: 0 },
    }),
    prisma.idCounter.upsert({
      where: { prefix: "SV" },
      update: {},
      create: { prefix: "SV", counter: 0 },
    }),
    prisma.idCounter.upsert({
      where: { prefix: "AV" },
      update: {},
      create: { prefix: "AV", counter: 0 },
    }),
    prisma.idCounter.upsert({
      where: { prefix: "BK" },
      update: {},
      create: { prefix: "BK", counter: 0 },
    }),
  ]);

  // ===================== ADMIN =====================
  const adminId = await generateId("AD");
  const adminPass = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      id: adminId,
      name: "System Administrator",
      email: "admin@gmail.com",
      passwordHash: adminPass,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin created: admin@gmail.com / password123");

  // ===================== SERVICES =====================
  const serviceData = [
    {
      name: "General Consultation",
      description:
        "Initial consultation to discuss your needs and requirements",
      durationMinutes: 30,
    },
    {
      name: "Extended Consultation",
      description: "Comprehensive consultation with detailed analysis",
      durationMinutes: 60,
    },
    {
      name: "Quick Check-up",
      description: "Brief follow-up or quick assessment",
      durationMinutes: 15,
    },
    {
      name: "Therapy Session",
      description: "Professional therapy or counseling session",
      durationMinutes: 45,
    },
    {
      name: "Technical Support",
      description: "IT and technical support services",
      durationMinutes: 30,
    },
    {
      name: "Business Coaching",
      description: "One-on-one business strategy and coaching",
      durationMinutes: 50,
    },
  ];

  const services = await Promise.all(
    serviceData.map(async (s) =>
      prisma.service.create({
        data: {
          id: await generateId("SV"),
          ...s,
          active: true,
        },
      }),
    ),
  );

  console.log(`✅ Created ${services.length} services`);

  // ===================== PROVIDERS =====================
  const providerData = [
    {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@gmail.com",
      bio: "Licensed therapist with 10+ years of experience in cognitive behavioral therapy",
      specialties: ["Therapy", "Counseling", "Mental Health"],
    },
    {
      name: "John Smith",
      email: "john.smith@gmail.com",
      bio: "Senior IT consultant specializing in cloud infrastructure and DevOps",
      specialties: ["Tech Support", "System Architecture", "DevOps"],
    },
    {
      name: "Emily Davis",
      email: "emily.davis@gmail.com",
      bio: "Business strategist and executive coach for startups and enterprises",
      specialties: ["Business Coaching", "Strategy", "Leadership"],
    },
    {
      name: "Michael Chen",
      email: "michael.chen@gmail.com",
      bio: "Wellness coach with expertise in nutrition and fitness planning",
      specialties: ["Wellness", "Fitness", "Nutrition"],
    },
    {
      name: "Lisa Anderson",
      email: "lisa.anderson@gmail.com",
      bio: "Marketing specialist with 8 years of digital marketing experience",
      specialties: ["Marketing", "Branding", "Social Media"],
    },
  ];

  const providers = await Promise.all(
    providerData.map(async (p) => {
      const provPass = await bcrypt.hash("password123", 10);
      const provId = await generateId("PR");
      const profId = await generateId("PR");

      return prisma.user.create({
        data: {
          id: provId,
          name: p.name,
          email: p.email,
          passwordHash: provPass,
          role: "PROVIDER",
          providerProfile: {
            create: {
              id: profId,
              bio: p.bio,
              approved: true,
            },
          },
        },
        include: { providerProfile: true },
      });
    }),
  );

  console.log(`✅ Created ${providers.length} providers`);

  // ===================== PROVIDER-SERVICE LINKS =====================
  // Link providers to services (each provider gets 2-3 services)
  const providerServiceLinks = [
    { providerIndex: 0, serviceIndices: [1, 3] }, // Sarah: Extended Consultation, Therapy Session
    { providerIndex: 1, serviceIndices: [0, 2, 4] }, // John: General, Quick Check-up, Tech Support
    { providerIndex: 2, serviceIndices: [0, 5] }, // Emily: General, Business Coaching
    { providerIndex: 3, serviceIndices: [0, 2] }, // Michael: General, Quick Check-up
    { providerIndex: 4, serviceIndices: [0, 1] }, // Lisa: General, Extended Consultation
  ];

  for (const link of providerServiceLinks) {
    const provider = providers[link.providerIndex];
    for (const serviceIdx of link.serviceIndices) {
      await prisma.providerService.create({
        data: {
          id: await generateId("PR"),
          providerId: provider.providerProfile!.id,
          serviceId: services[serviceIdx].id,
        },
      });
    }
  }

  console.log(`✅ Linked providers to services`);

  // ===================== AVAILABILITY BLOCKS =====================
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  const availabilityBlocks = [];

  for (let provIdx = 0; provIdx < providers.length; provIdx++) {
    const provider = providers[provIdx];
    // Create availability for next 2 weeks (starting from TOMORROW)
    for (let dayOffset = 1; dayOffset <= 15; dayOffset++) {
      const blockDate = new Date(today);
      blockDate.setDate(today.getDate() + dayOffset);

      // Skip weekends
      if (blockDate.getDay() === 0 || blockDate.getDay() === 6) continue;

      // Morning slot: 9 AM - 12 PM
      const morningStart = new Date(blockDate);
      morningStart.setHours(9, 0, 0, 0);
      const morningEnd = new Date(blockDate);
      morningEnd.setHours(12, 0, 0, 0);

      availabilityBlocks.push(
        prisma.availability.create({
          data: {
            id: await generateId("AV"),
            providerId: provider.providerProfile!.id,
            startAt: morningStart,
            endAt: morningEnd,
            active: true,
          },
        }),
      );

      // Afternoon slot: 2 PM - 5 PM (skip for some providers for variety)
      if (provIdx % 2 === 0) {
        const afternoonStart = new Date(blockDate);
        afternoonStart.setHours(14, 0, 0, 0);
        const afternoonEnd = new Date(blockDate);
        afternoonEnd.setHours(17, 0, 0, 0);

        availabilityBlocks.push(
          prisma.availability.create({
            data: {
              id: await generateId("AV"),
              providerId: provider.providerProfile!.id,
              startAt: afternoonStart,
              endAt: afternoonEnd,
              active: true,
            },
          }),
        );
      }
    }
  }

  await Promise.all(availabilityBlocks);
  console.log(`✅ Created availability blocks for all providers`);

  // ===================== CUSTOMERS =====================
  const customerData = [
    {
      name: "Alice Johnson",
      email: "alice@gmail.com",
    },
    {
      name: "Bob Williams",
      email: "bob@gmail.com",
    },
    {
      name: "Carol Martinez",
      email: "carol@gmail.com",
    },
    {
      name: "David Brown",
      email: "david@gmail.com",
    },
  ];

  const customers = await Promise.all(
    customerData.map(async (c) => {
      const custPass = await bcrypt.hash("password123", 10);
      const custId = await generateId("CU");

      return prisma.user.create({
        data: {
          id: custId,
          name: c.name,
          email: c.email,
          passwordHash: custPass,
          role: "CUSTOMER",
        },
      });
    }),
  );

  console.log(`✅ Created ${customers.length} customers`);

  // ===================== BOOKINGS =====================
  const bookings = [];

  // Create some sample bookings for variety
  const bookingConfigs = [
    {
      customerIdx: 0,
      providerIdx: 0,
      serviceIdx: 1,
      dayOffset: 3,
      time: "10:00",
      status: "CONFIRMED" as const,
    },
    {
      customerIdx: 0,
      providerIdx: 1,
      serviceIdx: 4,
      dayOffset: 5,
      time: "11:00",
      status: "CONFIRMED" as const,
    },
    {
      customerIdx: 1,
      providerIdx: 2,
      serviceIdx: 5,
      dayOffset: 4,
      time: "14:30",
      status: "CONFIRMED" as const,
    },
    {
      customerIdx: 2,
      providerIdx: 3,
      serviceIdx: 0,
      dayOffset: 6,
      time: "09:30",
      status: "CONFIRMED" as const,
    },
    {
      customerIdx: 3,
      providerIdx: 4,
      serviceIdx: 0,
      dayOffset: 7,
      time: "15:00",
      status: "CONFIRMED" as const,
    },
  ];

  for (const config of bookingConfigs) {
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + config.dayOffset);

    // Parse time into hours and minutes
    const [hours, minutes] = config.time.split(":").map(Number);
    bookingDate.setHours(hours, minutes, 0, 0);

    const customer = customers[config.customerIdx];
    const provider = providers[config.providerIdx];
    const service = services[config.serviceIdx];

    bookings.push(
      prisma.booking.create({
        data: {
          id: await generateId("BK"),
          customerId: customer.id,
          providerId: provider.id,
          serviceId: service.id,
          startAt: bookingDate,
          durationMinutes: service.durationMinutes,
          status: config.status,
        },
      }),
    );
  }

  await Promise.all(bookings);
  console.log(`✅ Created ${bookings.length} bookings`);

  console.log("\n📊 ===== DATABASE SEEDING COMPLETE =====");
  console.log("\n👥 Test Accounts:\n");
  console.log("🔐 ADMIN:");
  console.log("   Email: admin@gmail.com");
  console.log("   Password: password123");
  console.log("\n👔 PROVIDERS:");
  providers.forEach((p, i) => {
    console.log(`   ${i + 1}. ${p.name}`);
    console.log(`      Email: ${p.email}`);
    console.log("      Password: password123");
  });
  console.log("\n🛍️  CUSTOMERS:");
  customers.forEach((c, i) => {
    console.log(`   ${i + 1}. ${c.name}`);
    console.log(`      Email: ${c.email}`);
    console.log("      Password: password123");
  });
  console.log("\n📋 SERVICES:");
  services.forEach((s, i) => {
    console.log(`   ${i + 1}. ${s.name} (${s.durationMinutes} min)`);
  });
  console.log("\n✅ All test data loaded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
