import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const SALT_ROUNDS = 10

  // Seed admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin', SALT_ROUNDS)
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    console.log('Created default admin user:', admin.username)
  } else {
    // Update existing plaintext password to hashed version
    const isAlreadyHashed = existingAdmin.password.startsWith('$2')
    if (!isAlreadyHashed) {
      const hashedPassword = await bcrypt.hash(existingAdmin.password, SALT_ROUNDS)
      await prisma.user.update({
        where: { username: 'admin' },
        data: { password: hashedPassword }
      })
      console.log('Migrated admin password to bcrypt hash')
    } else {
      console.log('Admin user already exists with hashed password')
    }
  }

  // Seed staff user
  const existingStaff = await prisma.user.findUnique({
    where: { username: 'staff' }
  })

  if (!existingStaff) {
    const hashedPassword = await bcrypt.hash('staff', SALT_ROUNDS)
    const staff = await prisma.user.create({
      data: {
        username: 'staff',
        password: hashedPassword,
        role: 'STAFF',
      },
    })
    console.log('Created default staff user:', staff.username)
  } else {
    const isAlreadyHashed = existingStaff.password.startsWith('$2')
    if (!isAlreadyHashed) {
      const hashedPassword = await bcrypt.hash(existingStaff.password, SALT_ROUNDS)
      await prisma.user.update({
        where: { username: 'staff' },
        data: { password: hashedPassword }
      })
      console.log('Migrated staff password to bcrypt hash')
    } else {
      console.log('Staff user already exists with hashed password')
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
