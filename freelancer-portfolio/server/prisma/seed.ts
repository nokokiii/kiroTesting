import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@freelanceforge.com' },
    update: {},
    create: {
      username: 'demo-freelancer',
      email: 'demo@freelanceforge.com',
      passwordHash: hashedPassword,
      name: 'Alex Johnson',
      jobTitle: 'Full Stack Developer',
      bio: 'Passionate full-stack developer with 5+ years of experience building modern web applications. I love creating beautiful, functional solutions that solve real-world problems.',
      theme: 'LIGHT',
    },
  });

  // Create demo projects
  await prisma.project.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'E-commerce Platform',
        description: 'A modern e-commerce platform built with React and Node.js, featuring real-time inventory management, payment processing, and admin dashboard.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
        projectUrl: 'https://github.com/demo/ecommerce',
        displayOrder: 1,
      },
      {
        userId: demoUser.id,
        title: 'Task Management App',
        description: 'A collaborative task management application with real-time updates, team collaboration features, and advanced filtering capabilities.',
        technologies: ['Vue.js', 'Express.js', 'MongoDB', 'Socket.io'],
        projectUrl: 'https://github.com/demo/taskmanager',
        displayOrder: 2,
      },
      {
        userId: demoUser.id,
        title: 'Weather Dashboard',
        description: 'A responsive weather dashboard that provides detailed forecasts, historical data, and interactive maps using multiple weather APIs.',
        technologies: ['React', 'TypeScript', 'Chart.js', 'OpenWeather API'],
        projectUrl: 'https://github.com/demo/weather-dashboard',
        displayOrder: 3,
      },
    ],
  });

  // Create demo skills
  await prisma.skill.createMany({
    data: [
      { userId: demoUser.id, name: 'JavaScript', type: 'TEXT', displayOrder: 1 },
      { userId: demoUser.id, name: 'TypeScript', type: 'TEXT', displayOrder: 2 },
      { userId: demoUser.id, name: 'React', type: 'TEXT', displayOrder: 3 },
      { userId: demoUser.id, name: 'Node.js', type: 'TEXT', displayOrder: 4 },
      { userId: demoUser.id, name: 'PostgreSQL', type: 'TEXT', displayOrder: 5 },
      { userId: demoUser.id, name: 'MongoDB', type: 'TEXT', displayOrder: 6 },
      { userId: demoUser.id, name: 'AWS', type: 'TEXT', displayOrder: 7 },
      { userId: demoUser.id, name: 'Docker', type: 'TEXT', displayOrder: 8 },
    ],
  });

  // Create demo experience
  await prisma.experience.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'WORK',
        title: 'Senior Full Stack Developer - TechCorp',
        description: 'Led development of multiple client projects, mentored junior developers, and implemented CI/CD pipelines that reduced deployment time by 60%.',
        startDate: new Date('2021-01-01'),
        endDate: null, // Current position
        displayOrder: 1,
      },
      {
        userId: demoUser.id,
        type: 'WORK',
        title: 'Full Stack Developer - StartupXYZ',
        description: 'Developed and maintained web applications using React and Node.js. Built RESTful APIs and integrated third-party services.',
        startDate: new Date('2019-06-01'),
        endDate: new Date('2020-12-31'),
        displayOrder: 2,
      },
      {
        userId: demoUser.id,
        type: 'EDUCATION',
        title: 'Bachelor of Computer Science - University of Technology',
        description: 'Graduated with honors. Focused on software engineering, algorithms, and database systems.',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-05-31'),
        displayOrder: 3,
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Demo user created: ${demoUser.email} (password: demo123)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });