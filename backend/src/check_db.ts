import { prisma } from './config/database.js';

async function main() {
  const masters = await prisma.laporan_utilisasi_server_master.findMany({
    where: {
      tipe_utilisasi: 'SERVER_STORAGE'
    },
    include: {
      detail_utilisasi_storage: true
    }
  });
  console.log(JSON.stringify(masters, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
