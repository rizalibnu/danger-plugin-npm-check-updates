import * as ncu from 'npm-check-updates';

declare module 'npm-check-updates' {
  function run(options?: RunOptions): Promise<RunResults>;
  function getCurrentDependencies(
    packageJson: Record<string, any> | null
  ): Record<string, string>;
}
