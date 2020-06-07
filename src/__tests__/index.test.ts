import * as path from 'path';
import npmCheckUpdates from '../index';

declare const global: any;

beforeEach(() => {
  global.warn = jest.fn();
  global.message = jest.fn();
  global.fail = jest.fn();
  global.markdown = jest.fn();
  global.danger = {
    git: {
      modified_files: [],
      created_files: [],
      deleted_files: [],
    },
  };
});

afterEach(() => {
  global.warn = undefined;
  global.message = undefined;
  global.fail = undefined;
  global.markdown = undefined;
});

describe('npmCheckUpdates()', () => {
  it('when there is an outdated dependency, it should call warn', async () => {
    await npmCheckUpdates({
      packageFile: path.join(__dirname, './__mocks__/package.json'),
      timeout: 5000,
    });

    expect(global.warn).toHaveBeenCalled();
  });

  it('Check monorepo packages, when there is an outdated dependency, it should call warn', async () => {
    await npmCheckUpdates({
      monorepo: true,
      excludePackages: 'mock-root-package',
      timeout: 5000,
      packageFile: path.join(__dirname, './__mocks__/package.json'),
    });

    expect(global.warn).toHaveBeenCalled();
  });
});
