import { basename, dirname, join } from 'path';
import webpack from 'webpack';
import MultiLangPlugin from '../src';

export default function processFile(entry, ...pluginOpts) {
  const resolvedEntry = join(__dirname, 'cases', entry);
  const resolvedOutput = join(dirname(resolvedEntry), `${basename(resolvedEntry, '.code.js')}.[language].tmp.js`);

  const compiler = webpack({
    entry: resolvedEntry,
    output: {
      filename: basename(resolvedOutput),
      path: dirname(resolvedOutput),

      libraryTarget: 'commonjs2',
    },
    plugins: [
      new MultiLangPlugin(...pluginOpts),
    ],
  });

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }
      // stats.compilation.errors contains errors and warnings produced by plugin itself
      if (stats.compilation.errors.length) {
        reject(stats.compilation.errors[0]);
        return;
      }

      resolve({
        file: resolvedOutput,
        stats,
      });
    });
  });
}
