import { User } from '../types';
import db from '#lib/db';
import { getParents } from '#lib/database/inode';
import { getTrash } from '#lib/database/inodes';

export default async function listTrash(user: User) {
  const { sub } = user;
  const trash = await getTrash(sub);
  const parents = await getParents(trash.mnemonic);

  const children = await db.inode.findMany({
    where: {
      parentId: trash.id,
    },
    include: {
      members: true,
      data: true,
    },
  });

  return {
    parents,
    children,
  };
}
