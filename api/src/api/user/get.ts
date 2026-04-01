import db from '#lib/db';

export default async function get(sub: string) {
  const result = await db.user.findUnique({
    where: { sub },
    include: { keys: true },
  });

  if (!result) return result;

  const storageAgg = await db.fileData.aggregate({
    _sum: { size: true },
    where: { createdBy: sub },
  });

  // Prisma bigint mapping trick: convert large bigints to numbers 
  // since the TS interface expects number up to Number.MAX_SAFE_INTEGER
  const storageUsed = Number(storageAgg._sum.size || 0n);

  return { ...result, storageUsed };
}
