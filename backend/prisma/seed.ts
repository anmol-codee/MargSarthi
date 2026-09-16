/**
 * MargSarthi — Prisma Seed Script
 *
 * Seeds:
 * 1. Admin user (email + password from env vars — NEVER hardcoded)
 * 2. Ticket categories
 * 3. Ticket priorities with amounts
 * 4. Sample notices (dev only)
 * 5. Sample appointment slots (dev only)
 *
 * Run: npm run prisma:seed
 */

import { PrismaClient, Role, NoticeStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // -------------------------------------------------------
  // 1. ADMIN USER
  // -------------------------------------------------------
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be set in environment variables.'
    );
  }

  const passwordHash = await argon2.hash(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      phone: '0000000000', // placeholder for admin — can be updated via settings
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin user: ${admin.email} (id: ${admin.id})`);

  // -------------------------------------------------------
  // 2. TICKET CATEGORIES
  // -------------------------------------------------------
  const categories = [
    { name: 'Admissions', description: 'Help with college/university admissions', sortOrder: 1 },
    { name: 'Scholarships', description: 'Scholarship search and application assistance', sortOrder: 2 },
    { name: 'Internships', description: 'Internship search and guidance', sortOrder: 3 },
    { name: 'Career Guidance', description: 'Career path and planning advice', sortOrder: 4 },
    { name: 'College Selection', description: 'Help choosing the right college', sortOrder: 5 },
    { name: 'Education', description: 'General education queries', sortOrder: 6 },
    { name: 'Other', description: 'Other queries and support', sortOrder: 7 },
  ];

  for (const cat of categories) {
    await prisma.ticketCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description, sortOrder: cat.sortOrder },
      create: cat,
    });
  }

  console.log(`✅ ${categories.length} ticket categories seeded`);

  // -------------------------------------------------------
  // 3. TICKET PRIORITIES
  // -------------------------------------------------------
  const priorities = [
    { name: 'LOW', label: 'Low', sortOrder: 1 },
    { name: 'MEDIUM', label: 'Medium', sortOrder: 2 },
    { name: 'HIGH', label: 'High', sortOrder: 3 },
    { name: 'URGENT', label: 'Urgent', sortOrder: 4 },
  ];

  for (const p of priorities) {
    await prisma.ticketPriority.upsert({
      where: { name: p.name },
      update: { label: p.label, sortOrder: p.sortOrder },
      create: p,
    });
  }

  console.log(`✅ ${priorities.length} ticket priorities seeded`);

  // -------------------------------------------------------
  // 4. SAMPLE DATA (development only)
  // -------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Seeding development sample data...');

    // Sample notices
    const notices = [
      {
        title: 'Welcome to MargSarthi!',
        content:
          'We are delighted to welcome you to MargSarthi — India\'s trusted education guidance platform. Our expert team is here to guide you through admissions, scholarships, and career decisions. Get started by completing your profile and raising a request!',
        category: 'General',
        status: NoticeStatus.PUBLISHED,
        publishedAt: new Date(),
        isPinned: true,
        authorId: admin.id,
      },
      {
        title: 'Admission Season 2026 — Key Dates',
        content:
          'Important admission deadlines for 2026: Central University applications close on 30th September. State University forms available from 1st October. CUET registration begins shortly. Raise a ticket under "Admissions" for personalised guidance.',
        category: 'Admissions',
        status: NoticeStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: admin.id,
      },
      {
        title: 'Scholarship Opportunities for SC/ST Students',
        content:
          'Various government scholarships are available for SC/ST/OBC students. Pre-matric and post-matric scholarships, NSP portal scholarships, and state-specific schemes are open for applications. Contact us for guidance on eligibility and application.',
        category: 'Scholarships',
        status: NoticeStatus.PUBLISHED,
        publishedAt: new Date(),
        authorId: admin.id,
      },
    ];

    for (const notice of notices) {
      await prisma.notice.create({ data: notice }).catch(() => {
        // May already exist on re-seed
      });
    }

    console.log(`✅ ${notices.length} sample notices created`);

    // Sample appointment slots (next 7 days)
    const today = new Date();
    const timeSlots = [
      { start: '10:00', end: '10:30' },
      { start: '11:00', end: '11:30' },
      { start: '14:00', end: '14:30' },
      { start: '15:00', end: '15:30' },
      { start: '16:00', end: '16:30' },
    ];

    let slotsCreated = 0;
    for (let i = 1; i <= 7; i++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + i);
      // Skip weekends
      if (slotDate.getDay() === 0 || slotDate.getDay() === 6) continue;

      const dateOnly = new Date(slotDate.toISOString().split('T')[0] + 'T00:00:00.000Z');

      for (const slot of timeSlots) {
        await prisma.appointmentSlot
          .upsert({
            where: {
              date_startTime: {
                date: dateOnly,
                startTime: slot.start,
              },
            },
            update: {},
            create: {
              date: dateOnly,
              startTime: slot.start,
              endTime: slot.end,
              capacity: 1,
            },
          })
          .catch(() => {});
        slotsCreated++;
      }
    }

    console.log(`✅ ~${slotsCreated} sample appointment slots created`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
