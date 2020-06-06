import { DangerDSLType } from "danger/distribution/dsl/DangerDSL"
import * as fs from "fs"
import * as path from "path"
import { yarnToNpm } from "synp"
import * as objectFilter from "@arnaudnyc/object-filter"
// tslint:disable-next-line: no-var-requires
const ncu = require("npm-check-updates")

declare const danger: DangerDSLType
export declare function message(message: string): void
export declare function warn(message: string): void
export declare function fail(message: string): void
export declare function markdown(message: string): void

interface RunOptions {
  /**
   * rc config file path (default: directory of `packageFile` or ./ otherwise)
   */
  configFilePath?: string

  /**
   * rc config file name (default: .ncurc.{json,yml,js})
   */
  configFileName?: string

  /**
   * Used as current working directory for `spawn` in npm listing
   */
  cwd?: string

  /**
   * check only a specific section(s) of dependencies:
   * prod|dev|peer|optional|bundle (comma-delimited)
   */
  dep?: string

  /**
   * upgrade to version which satisfies engines.node range
   */
  enginesNode?: boolean

  /**
   * set the error-level. 1: exits with error code 0 if no errors occur. 2:
   * exits with error code 0 if no packages need updating (useful for
   * continuous integration). Default is 1.
   */
  errorLevel?: number

  /**
   * include only package names matching the given string,
   * comma-or-space-delimited list, or /regex/
   */
  filter?: string | string[] | RegExp

  /**
   * find the highest versions available instead of the latest stable versions
   */
  greatest?: boolean

  /**
   * do not upgrade newer versions that are already satisfied by the version
   * range according to semver
   */
  minimal?: boolean

  /**
   * find the newest versions available instead of the latest stable versions
   */
  newest?: boolean

  /**
   * npm (default)
   */
  packageManager?: string

  /**
   * package file location (default: ./package.json)
   */
  packageFile?: string

  /**
   * Include -alpha, -beta, -rc. Default: 0. Default with --newest and
   * --greatest: 1
   */
  pre?: boolean

  /**
   * Used as current working directory in npm
   */
  prefix?: string

  /**
   * specify third-party npm registry
   */
  registry?: string

  /**
   * exclude dependency matching the given string, comma-or-space-delimited
   * list, or /regex/
   */
  reject?: string | string[] | RegExp

  /**
   * remove version ranges from the final package version
   */
  removeRange?: boolean

  /**
   * find the highest version within "major" or "minor"
   */
  semverLevel?: string

  /**
   * a global timeout in ms
   */
  timeout?: number
}

export declare interface Options extends RunOptions {
  /**
   * set repo is monorepo
   */
  monorepo?: boolean

  /**
   * monorepo prefix dir. (default: packages)
   */
  monorepoPrefix?: string

  /**
   * find and check changed monorepo package, instead of all packages. (default: false)
   */
  onlyChangedPackages?: boolean

  /**
   * exclude packages matching the given string, comma-or-space-delimited
   * list, or /regex/
   */
  excludePackages?: string | string[] | RegExp

  /**
   * ignore lock version. (default: false)
   */
  ignoreLockVersion?: boolean
}

type OutdatedDependencies = Record<
  string,
  {
    current: string
    latest: string
    lock: string
  }
>

type PackegeJson = Record<string, any>
interface PackageLock {
  dependencies: Record<string, { version: string }>
}

interface Packages {
  packageJson: PackegeJson | null
  packageLock: PackageLock | null
}

const readPackageJson = (basePath: string): PackegeJson | null => {
  try {
    const packageJsonPath = path.join(basePath, "package.json")
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = fs.readFileSync(packageJsonPath, "utf8")
      return JSON.parse(packageJson) as PackegeJson
    }
    return null
  } catch (e) {
    return null
  }
}

const readPackageLock = (basePath: string): PackageLock | null => {
  try {
    const packageLockPath = path.join(basePath, "package-lock.json")
    if (fs.existsSync(packageLockPath)) {
      const packageLock = fs.readFileSync(packageLockPath, "utf8")
      return JSON.parse(packageLock) as PackageLock
    }
    return JSON.parse(yarnToNpm(basePath)) as PackageLock
  } catch (e) {
    return null
  }
}

const npmCheckUpdates = async (options: Options = {}) => {
  const { modified_files, created_files, deleted_files } = danger.git
  const changedFiles = [...modified_files, ...created_files, ...deleted_files]
  const {
    monorepo = false,
    monorepoPrefix = "packages",
    onlyChangedPackages = false,
    excludePackages,
    ignoreLockVersion = false,
    // tslint:disable-next-line: trailing-comma
    ...runOptions
  } = options

  const defaultBasePath = runOptions.packageFile?.replace("package.json", "") || "."
  const defaultPackageJson = readPackageJson(defaultBasePath)
  const defaultPackageLock = readPackageLock(defaultBasePath)
  let packages: Packages[] =
    defaultPackageJson && defaultPackageLock
      ? [
          {
            packageJson: defaultPackageJson,
            packageLock: defaultPackageLock,
          },
        ]
      : []

  if (monorepo) {
    const monorepoPackagesPattern = new RegExp(`${monorepoPrefix}\/(.+)\/`)
    const monorepoPackagesChangedDir = changedFiles
      .filter((file) => monorepoPackagesPattern.test(file))
      .map((file) => {
        const match = file.match(monorepoPackagesPattern)
        if (Array.isArray(match)) {
          return match[0].split("/")[1]
        }
        return []
      })
      .filter((file, i, arr) => arr.indexOf(file) === i && !Array.isArray(file))

    try {
      const monorepoPackagesDir = onlyChangedPackages
        ? monorepoPackagesChangedDir
        : fs.readdirSync(`./${monorepoPrefix}`)
      const monorepoPackages: Packages[] = monorepoPackagesDir
        .filter((pkg) => {
          try {
            const basePath = `./${monorepoPrefix}/${pkg}`
            const packageJson = readPackageJson(basePath)
            return Boolean(packageJson)
          } catch (e) {
            return false
          }
        })
        .map((pkg) => {
          const basePath = `./${monorepoPrefix}/${pkg}`
          return { packageJson: readPackageJson(basePath), packageLock: readPackageLock(basePath) }
        })

      packages = packages.concat(monorepoPackages)
      // tslint:disable-next-line: no-empty
    } catch (e) {}
  }

  if (excludePackages) {
    if (typeof excludePackages === "string") {
      packages = packages.filter((pkg) => excludePackages !== pkg?.packageJson?.name)
    } else if (Array.isArray(excludePackages)) {
      packages = packages.filter((pkg) => !excludePackages.includes(pkg?.packageJson?.name))
    } else if (excludePackages instanceof RegExp) {
      packages = packages.filter((pkg) => !excludePackages.test(pkg?.packageJson?.name))
    }
  }

  for (const { packageJson, packageLock } of packages) {
    try {
      const _options: RunOptions & {
        packageData: string
      } = {
        ...runOptions,
        packageData: JSON.stringify(packageJson),
      }

      const dependencyLockVersion = (dep: string) => packageLock?.dependencies[dep]?.version || "-"
      let ncuResult: Record<string, string> = await ncu.run(_options)
      if (!ignoreLockVersion) {
        ncuResult = objectFilter(ncuResult, (key: string, value: { version: string }) =>
          value.version.includes(dependencyLockVersion(key))
        )
      }
      const outdatedDependenciesNames = Object.keys(ncuResult)
      const currentDependencies: Record<string, string> = ncu.getCurrentDependencies(packageJson)
      const outdatedDependencies: OutdatedDependencies = {}

      for (const dep of outdatedDependenciesNames) {
        outdatedDependencies[dep] = {
          current: currentDependencies[dep] || "-",
          latest: ncuResult[dep] || "-",
          lock: dependencyLockVersion(dep),
        }
      }

      if (outdatedDependenciesNames.length) {
        const table = outdatedDependenciesNames
          .map((dependencyName) => {
            const { current, latest, lock } = outdatedDependencies[dependencyName]
            return `<tr><td>${dependencyName}</td><td>${current}</td><td>${lock}</td><td>${latest}</td></tr>`
          })
          .join(" ")

        warn(`
You have ${outdatedDependenciesNames.length} outdated dependencies in ${packageJson?.name}.\n
<details><summary>Show Lists</summary><table><thead><tr><th width="100%">Dependency</th><th>Current</th><th>Lock</th><th>Latest</th></tr></thead>${table}</table></details>`)
      }
    } catch (err) {
      fail(` npm check updates error in ${packageJson?.name}: ` + err.message)
    }
  }
}

export default npmCheckUpdates
