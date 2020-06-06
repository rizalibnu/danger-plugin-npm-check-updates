# danger-plugin-npm-check-updates

[![Build Status](https://travis-ci.org/rizalibnu/danger-plugin-npm-check-updates.svg?branch=master)](https://travis-ci.org/rizalibnu/danger-plugin-npm-check-updates)
[![npm version](https://badge.fury.io/js/danger-plugin-npm-check-updates.svg)](https://badge.fury.io/js/danger-plugin-npm-check-updates)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Danger plugin for npm-check-updates

## Usage

Install:

```sh
yarn add danger-plugin-npm-check-updates --dev
```

At a glance:

```js
// dangerfile.js
import { schedule } from "danger"
import npmCheckUpdates from "danger-plugin-npm-check-updates"

// Note: You need to use schedule()
schedule(npmCheckUpdates())
```

## Changelog

See the GitHub [release history](https://github.com/rizalibnu/danger-plugin-npm-check-updates/releases).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
