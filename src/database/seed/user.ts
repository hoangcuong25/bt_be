import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
    },
  });
  console.log(
    'Tài khoản admin đã được tạo với username: admin và mật khẩu: 123456'
  );
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
