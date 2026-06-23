const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  const adminExists = await prisma.user.findUnique({ where: { username: 'admin' }});
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('password', SALT_ROUNDS);
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Created admin user (password: "password")');
  }

  const staffExists = await prisma.user.findUnique({ where: { username: 'staff' }});
  if (!staffExists) {
    const hashedPassword = await bcrypt.hash('password', SALT_ROUNDS);
    await prisma.user.create({
      data: {
        username: 'staff',
        password: hashedPassword,
        role: 'STAFF'
      }
    });
    console.log('Created staff user (password: "password")');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
