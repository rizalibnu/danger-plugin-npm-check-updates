import * as fs from 'fs';
import * as path from 'path';
import * as lockfile from '@yarnpkg/lockfile';
import {PackegeJson, PackageLock, LockFile} from './types';

export const readPackageJson = (basePath: string): PackegeJson | null => {
  try {
    let result = null;
    const packageJsonPath = path.join(basePath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
      result = JSON.parse(packageJson);
    }
    return result;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};

export const readPackageLock = (basePath: string): LockFile | null => {
  try {
    let result: LockFile | null = null;
    const packageLockPath = path.join(basePath, 'package-lock.json');
    const yarnLockPath = path.join(basePath, 'yarn.lock');

    if (fs.existsSync(packageLockPath)) {
      const packageLock = fs.readFileSync(packageLockPath, 'utf8');
      const packageLockParse = JSON.parse(packageLock) as
        | PackageLock
        | undefined;
      if (packageLockParse) {
        result = {
          dependencies: packageLockParse.dependencies,
          type: 'npm',
        };
      }
    }

    if (fs.existsSync(yarnLockPath)) {
      const yarnLock = fs.readFileSync(yarnLockPath, 'utf8');
      const lockFileParse = lockfile.parse(yarnLock);
      if (lockFileParse) {
        result = {
          object: lockFileParse.object,
          type: 'yarn',
        };
      }
    }
    return result;
  } catch (e) {
    console.error(e.message);
    return null;
  }
};
