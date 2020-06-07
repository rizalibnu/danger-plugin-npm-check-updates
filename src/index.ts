import * as objectFilter from '@arnaudnyc/object-filter';
import {DangerDSLType} from 'danger/distribution/dsl/DangerDSL';
import * as fs from 'fs';
import * as ncu from 'npm-check-updates';
import * as path from 'path';
import {
  Options as NpmCheckUpdatesOptions,
  Packages,
  OutdatedDependencies,
  RunOptions,
  DependencyType,
} from './types';
import {readPackageJson, readPackageLock} from './utils';

declare const danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;
export type Options = NpmCheckUpdatesOptions;

const npmCheckUpdates = async (options: Options = {}) => {
  const {modified_files, created_files, deleted_files} = danger.git;
  const changedFiles = [...modified_files, ...created_files, ...deleted_files];
  const {
    monorepo = false,
    monorepoPrefix = 'packages',
    onlyChangedPackages = false,
    excludePackages,
    ignoreLockVersion = false,
    // tslint:disable-next-line: trailing-comma
    ...runOptions
  } = options;

  const defaultBasePath =
    runOptions.packageFile?.replace('package.json', '') || '.';
  const defaultPackageJson = readPackageJson(defaultBasePath);
  const defaultPackageLock = !ignoreLockVersion
    ? readPackageLock(defaultBasePath)
    : null;
  let packages: Packages[] =
    defaultPackageJson && defaultPackageLock
      ? [
          {
            packageJson: defaultPackageJson,
            packageLock: defaultPackageLock,
          },
        ]
      : [];

  if (monorepo) {
    const monorepoPackagesPattern = new RegExp(`${monorepoPrefix}\/(.+)\/`);
    const monorepoPackagesChangedDir = changedFiles
      .filter((file) => monorepoPackagesPattern.test(file))
      .map((file) => {
        const match = file.match(monorepoPackagesPattern);
        if (Array.isArray(match)) {
          return match[0].split('/')[1];
        }
        return [];
      })
      .filter(
        (file, i, arr) => arr.indexOf(file) === i && !Array.isArray(file)
      );

    try {
      const monorepoBasePath = path.join(defaultBasePath, monorepoPrefix);
      const monorepoPackagesDir = onlyChangedPackages
        ? monorepoPackagesChangedDir
        : fs.readdirSync(monorepoBasePath);
      const monorepoPackages: Packages[] = monorepoPackagesDir
        .filter((pkg) => {
          try {
            const basePath = path.join(monorepoBasePath, pkg.toString(), '/');
            const packageJson = readPackageJson(basePath);
            return Boolean(packageJson);
          } catch (e) {
            console.error(e.message);
            return false;
          }
        })
        .map((pkg) => {
          const basePath = path.join(monorepoBasePath, pkg.toString(), '/');
          return {
            packageJson: readPackageJson(basePath),
            packageLock: !ignoreLockVersion ? readPackageLock(basePath) : null,
          };
        });

      packages = packages.concat(monorepoPackages);
      // tslint:disable-next-line: no-empty
    } catch (e) {
      console.error(e.message);
    }
  }

  if (excludePackages) {
    if (typeof excludePackages === 'string') {
      packages = packages.filter(
        (pkg) => excludePackages !== pkg?.packageJson?.name
      );
    } else if (Array.isArray(excludePackages)) {
      packages = packages.filter(
        (pkg) => !excludePackages.includes(pkg?.packageJson?.name)
      );
    } else if (excludePackages instanceof RegExp) {
      packages = packages.filter(
        (pkg) => !excludePackages.test(pkg?.packageJson?.name)
      );
    }
  }

  for (const {packageJson, packageLock} of packages) {
    try {
      const _options: RunOptions & {
        packageData: string;
      } = {
        ...runOptions,
        packageData: JSON.stringify(packageJson),
      };

      const getPackageLockVersion = (dep: string): string => {
        let result = '-';
        if (packageLock) {
          switch (packageLock.type) {
            case 'npm':
              result = packageLock.dependencies[dep]?.version;
              break;
            case 'yarn':
              const depNames = Object.keys(packageLock.object);
              const depName = depNames.find((name) => name.includes(`${dep}@`));
              if (depName) {
                result = packageLock.object[depName]?.version;
              }
              break;
          }
        }
        return result;
      };

      const getPackageType = (dep: string): DependencyType | '-' => {
        let result: DependencyType | '-' = '-';
        if (packageJson) {
          const dependencyTypes: DependencyType[] = [
            'dependencies',
            'devDependencies',
            'peerDependencies',
            'optionalDependencies',
          ];
          for (const type of dependencyTypes) {
            const found =
              packageJson[type] &&
              packageJson[type].constructor.name === 'Object'
                ? Object.keys(packageJson[type]).find((key) => key === dep)
                : null;
            if (found) {
              result = type;
              return result;
            }
          }
        }
        return result;
      };

      let ncuResult: Record<string, string> = await ncu.run(_options);
      if (!ignoreLockVersion) {
        const filteredNcuResult = objectFilter(
          ncuResult,
          (key: string, value: string) => {
            return !value.includes(getPackageLockVersion(key));
          }
        );
        ncuResult = filteredNcuResult;
      }
      const outdatedDependenciesNames = Object.keys(ncuResult);
      const currentDependencies: Record<
        string,
        string
      > = ncu.getCurrentDependencies(packageJson);
      const outdatedDependencies: OutdatedDependencies = {};

      for (const dep of outdatedDependenciesNames) {
        outdatedDependencies[dep] = {
          from: currentDependencies[dep] || '-',
          to: ncuResult[dep] || '-',
          lock: !ignoreLockVersion ? getPackageLockVersion(dep) : null,
          packageType: getPackageType(dep),
          url: `https://www.npmjs.com/package/${dep}`,
        };
      }

      if (outdatedDependenciesNames.length) {
        const table = outdatedDependenciesNames
          .map((dependencyName) => {
            const {from, to, lock, packageType, url} = outdatedDependencies[
              dependencyName
            ];
            return `<tr><td><a href="${url}" target="_blank">${dependencyName}</a></td>${
              !ignoreLockVersion ? `<td>${lock}</td>` : ''
            }<td>${from}</td><td>${to}</td><td>${packageType}</td></tr>`;
          })
          .join(' ');

        warn(`You have ${
          outdatedDependenciesNames.length
        } outdated dependencies in ${packageJson?.name}.\n
<details><summary>Show Lists</summary><table><thead><tr><th width="100%">Package</th>${
          !ignoreLockVersion ? `<th>Package Lock</th>` : ''
        }<th>From</th><th>To</th><th>Package Type</th></tr></thead>${table}</table></details>`);
      }
    } catch (err) {
      fail(` npm check updates error in ${packageJson?.name}: ` + err.message);
    }
  }
};

export default npmCheckUpdates;
