const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Simple "hashing" for prototype. In production, use bcrypt.
  const adminExists = await prisma.user.findUnique({ where: { username: 'admin' }});
  if (!adminExists) {
    await prisma.user.create({
      data: {
        username: 'admin',
        password: 'password', // Hashed in real app
        role: 'ADMIN'
      }
    });
    console.log('Created admin user');
  }

  const staffExists = await prisma.user.findUnique({ where: { username: 'staff' }});
  if (!staffExists) {
    await prisma.user.create({
      data: {
        username: 'staff',
        password: 'password', // Hashed in real app
        role: 'STAFF'
      }
    });
    console.log('Created staff user');
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
