import processFile from '../cases.setup';

describe('apply-translations', () => {
  let assets;

  beforeAll(() => {
    const translations = {
      en: {
        'static-key': 'translated static key',
      },
    };

    return processFile('apply-translations.code.js', translations)
      .then(({ stats }) => {
        assets = stats.compilation.assets;
      });
  });

  it('should convert the file name', () => {
    // console.log(assets['apply-translations.en.tmp.js'].source());
    expect(assets['apply-translations.en.tmp.js']).toBeDefined();
  });

  it('should apply the translation', () => {
    const source = assets['apply-translations.en.tmp.js'].source();
    expect(source).toMatch(/translated static key/);
    expect(source).not.toMatch(/static-key/);
  });

  it('should use defaults', () => {
    const source = assets['apply-translations.en.tmp.js'].source();
    expect(source).toMatch(/default value/);
    expect(source).not.toMatch(/missing-key1/);
  });


  it('should not process invalid calls', () => {
    const source = assets['apply-translations.en.tmp.js'].source();
    expect(source).toMatch(/__\('some string', 'missing-key3', 'extra param'\)/);
  });
});
