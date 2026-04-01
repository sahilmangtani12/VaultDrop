import { getEnv } from '#lib/env';
import { Omit } from '@prisma/client/runtime/library';
import { readFile } from 'fs/promises';
import yaml from 'js-yaml';
import { AppInfo } from '../types/base';

type YamlInfo = Omit<AppInfo, 'version'>;

export default async function info() {
  const path = getEnv('INFO_PATH', `${process.cwd()}/info.yaml`)!;
  const content = await readFile(path, 'utf-8');
  const data = yaml.load(content) as YamlInfo;

  const packageJson = await readFile('package.json', 'utf-8');
  const p = JSON.parse(packageJson) as { version: string };
  return { ...data, version: p.version } as AppInfo;
}
