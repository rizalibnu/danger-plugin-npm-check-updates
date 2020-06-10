# danger-plugin-npm-check-updates

[![Build Status](https://travis-ci.org/rizalibnu/danger-plugin-npm-check-updates.svg?branch=master)](https://travis-ci.org/rizalibnu/danger-plugin-npm-check-updates)
[![npm version](https://badge.fury.io/js/danger-plugin-npm-check-updates.svg)](https://badge.fury.io/js/danger-plugin-npm-check-updates)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Danger plugin for npm-check-updates.

## Features

- [x] Support Private Package
- [x] Support monorepo. e.g lerna
- [x] Support Package Lock (package-lock.json or yarn.lock) version

## Usage

Install:

```sh
yarn add danger-plugin-npm-check-updates --dev
```

At a glance:

```js
// dangerfile.js
import { schedule } from 'danger'
import path from 'path'
import npmCheckUpdates from 'danger-plugin-npm-check-updates'

// Note: You need to use schedule()
schedule(npmCheckUpdates({
  monorepo: true, // optional
  timeout: 5000, // optional
  packageFile: path.join(__dirname, './package.json'), // optional
}))
```

Options:

```js
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
```

## Sample message

![sample message](https://raw.githubusercontent.com/rizalibnu/danger-plugin-npm-check-updates/master/message.png)

## Changelog

See the GitHub [release history](https://github.com/rizalibnu/danger-plugin-npm-check-updates/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
