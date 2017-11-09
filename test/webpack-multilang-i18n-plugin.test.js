import { name as PROJECT_NAME } from '../package.json';
import MultiLangPlugin from '../src';

describe(PROJECT_NAME, () => {
  test('should export the loader', (done) => {
    expect(MultiLangPlugin).toBeInstanceOf(Function);
    done();
  });
});