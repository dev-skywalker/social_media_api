// prisma/seed.ts
import { PrismaClient } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('demo123', salt);

  const user1 = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      password: hashedPassword,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      password: hashedPassword,
    },
  });

  await prisma.post.create({
    data: {
      title: 'First Post by Alice',
      content: 'This is the content of the first post.',
      author: {
        connect: { id: user1.id },
      },
    },
  });

  await prisma.post.create({
    data: {
      title: 'A Post from Bob',
      content: 'Hello world! This is Bob writing.',
      author: {
        connect: { id: user2.id },
      },
    },
  });

  console.log('Database has been seeded 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });