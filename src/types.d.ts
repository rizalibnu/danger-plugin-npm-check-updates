export interface RunOptions {
  /**
   * rc config file path (default: directory of `packageFile` or ./ otherwise)
   */
  configFilePath?: string;

  /**
   * rc config file name (default: .ncurc.{json,yml,js})
   */
  configFileName?: string;

  /**
   * Used as current working directory for `spawn` in npm listing
   */
  cwd?: string;

  /**
   * check only a specific section(s) of dependencies:
   * prod|dev|peer|optional|bundle (comma-delimited)
   */
  dep?: string;

  /**
   * upgrade to version which satisfies engines.node range
   */
  enginesNode?: boolean;

  /**
   * set the error-level. 1: exits with error code 0 if no errors occur. 2:
   * exits with error code 0 if no packages need updating (useful for
   * continuous integration). Default is 1.
   */
  errorLevel?: number;

  /**
   * include only package names matching the given string,
   * comma-or-space-delimited list, or /regex/
   */
  filter?: string | string[] | RegExp;

  /**
   * find the highest versions available instead of the latest stable versions
   */
  greatest?: boolean;

  /**
   * do not upgrade newer versions that are already satisfied by the version
   * range according to semver
   */
  minimal?: boolean;

  /**
   * find the newest versions available instead of the latest stable versions
   */
  newest?: boolean;

  /**
   * npm (default)
   */
  packageManager?: string;

  /**
   * package file location (default: ./package.json)
   */
  packageFile?: string;

  /**
   * Include -alpha, -beta, -rc. Default: 0. Default with --newest and
   * --greatest: 1
   */
  pre?: boolean;

  /**
   * Used as current working directory in npm
   */
  prefix?: string;

  /**
   * specify third-party npm registry
   */
  registry?: string;

  /**
   * exclude dependency matching the given string, comma-or-space-delimited
   * list, or /regex/
   */
  reject?: string | string[] | RegExp;

  /**
   * remove version ranges from the final package version
   */
  removeRange?: boolean;

  /**
   * find the highest version within "major" or "minor"
   */
  semverLevel?: string;

  /**
   * a global timeout in ms
   */
  timeout?: number;
}

export interface Options extends RunOptions {
  /**
   * set repo is monorepo
   */
  monorepo?: boolean;

  /**
   * monorepo prefix dir. (default: packages)
   */
  monorepoPrefix?: string;

  /**
   * find and check changed monorepo package, instead of all packages. (default: false)
   */
  onlyChangedPackages?: boolean;

  /**
   * exclude packages matching the given string, comma-or-space-delimited
   * list, or /regex/
   */
  excludePackages?: string | string[] | RegExp;

  /**
   * ignore lock version. (default: true)
   */
  ignoreLockVersion?: boolean;
}

export type DependencyType =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';

export type OutdatedDependencies = Record<
  string,
  {
    from: string;
    to: string;
    lock: string | null;
    packageType: DependencyType | '-';
    url: string;
  }
>;

export type PackegeJson = Record<string, any>;

export interface PackageLock {
  type: 'npm';
  dependencies: Record<string, {version: string}>;
}

export interface YarnLock {
  type: 'yarn';
  object: Record<string, {version: string}>;
}

type LockFile = PackageLock | YarnLock;

export interface Packages {
  packageJson: PackegeJson | null;
  packageLock: LockFile | null;
}
