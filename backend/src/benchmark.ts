import { performance } from 'perf_hooks';
import { getDashboardStats } from './services/admin.service';
import { getStudentTickets } from './services/ticket.service';
import { prisma } from './config/database';

async function run() {
  console.log('--- Benchmarking Dashboard Stats ---');
  let start = performance.now();
  await getDashboardStats();
  let end = performance.now();
  console.log('Admin Dashboard Stats DB Time:', (end - start).toFixed(2), 'ms');

  // get a real student id
  const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  if (student) {
    console.log('\n--- Benchmarking Student Tickets ---');
    start = performance.now();
    await getStudentTickets(student.id);
    end = performance.now();
    console.log('Student Tickets DB Time:', (end - start).toFixed(2), 'ms');
  }

  process.exit(0);
}
run();
