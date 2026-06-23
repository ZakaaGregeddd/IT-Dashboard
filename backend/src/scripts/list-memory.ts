import { prisma } from '../config/database.js';

async function main() {
  const records = await prisma.laporan_utilisasi_server_master.findMany({
    where: {
      tipe_utilisasi: 'SERVER_MEMORY',
    },
    include: {
      detail_utilisasi_memory: true,
    },
  });
  console.log(JSON.stringify(records, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
