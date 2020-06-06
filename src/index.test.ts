import npmCheckUpdates from './index';

declare const global: any;

describe('npmCheckUpdates()', () => {
  beforeEach(() => {
    global.warn = jest.fn();
    global.message = jest.fn();
    global.fail = jest.fn();
    global.markdown = jest.fn();
  });

  afterEach(() => {
    global.warn = undefined;
    global.message = undefined;
    global.fail = undefined;
    global.markdown = undefined;
  });

  it('Checks for a that message has been called', async () => {
    global.danger = {
      git: {
        modified_files: [],
        created_files: [],
        deleted_files: [],
      },
    };

    await npmCheckUpdates();

    expect(global.warn).toHaveBeenCalledTimes(1);
  });
});
