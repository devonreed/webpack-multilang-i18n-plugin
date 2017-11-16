/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Devon Reed @devonreed
*/
import Parser from 'webpack/lib/Parser.js';
import ConstDependency from 'webpack/lib/dependencies/ConstDependency.js';
import ReplaceSource from 'webpack-sources/lib/ReplaceSource.js';

/**
 *
 * @param {object} localization object, keyed by language code
 * @param {object} options object
 * @constructor
 */
class MultiLangPlugin {
  constructor(localization, options) {
    this.options = options || {};

    this.localization = localization;
    this.functionName = this.options.functionName || '__';
    this.failOnMissing = !!this.options.failOnMissing;
    this.hideMessage = this.options.hideMessage || false;
  }

  apply(compiler) {
    // Parser does not work on code that is encapsulated in an eval statement. Bail
    // if trying to use with this setting.
    if (compiler.options.devtool && compiler.options.devtool.indexOf('eval') >= 0) {
      throw new Error('MultiLangPlugin does not support eval mode');
    }

    const localization = this.localization;
    const failOnMissing = this.failOnMissing;
    const hideMessage = this.hideMessage;

    const name = this.functionName;

    compiler.plugin('make', (compilation, callback) => {
      // Swap out the language token for our global language variable in the script generator
      compilation.mainTemplate.plugin('jsonp-script', _ => _.replace('[language]', '" + MULTILANGPLUGINLANGUAGE + "'));

      // Run our language replacement after optimize (e.g. uglify) plugins run
      compilation.plugin('after-optimize-chunk-assets', (chunks) => {
        // Blank template for replacement operations
        const template = new ConstDependency.Template();

        // Loop through all chunks in the compilation
        chunks.forEach((chunk) => {
          // Keep track of new translated files we have built
          const translatedFiles = [];

          // Loop through all files in the chunk
          chunk.files.forEach((fileName) => {
            // We only care about files that have the language token
            if (fileName.indexOf('[language]') === -1) {
              return;
            }

            // Keep track of all function invocations in the file
            const matches = [];

            // Create a new parser for this file
            const parser = new Parser();
            parser.plugin(`call ${name}`, function i18nPlugin(expr) {
              let param;
              let defaultValue;
              switch (expr.arguments.length) {
                case 2:
                  param = this.evaluateExpression(expr.arguments[1]);
                  if (!param.isString()) return;
                  param = param.string;
                  defaultValue = this.evaluateExpression(expr.arguments[0]);
                  if (!defaultValue.isString()) return;
                  defaultValue = defaultValue.string;
                  break;
                case 1:
                  param = this.evaluateExpression(expr.arguments[0]);
                  if (!param.isString()) return;
                  defaultValue = param.string;
                  break;
                default:
                  return;
              }

              matches.push({
                key: defaultValue,
                expression: expr,
              });
            });

            // Parse the original source and identify replacements
            const source = compilation.assets[fileName].source();
            parser.parse(source);

            // Loop through each language in our dictionary and recompile the file
            // with our chosen languages
            Object.keys(localization).forEach((lang) => {
              const replacement = new ReplaceSource(compilation.assets[fileName]);
              matches.forEach((obj) => {
                let dictValue = localization[lang][obj.key];

                if (!dictValue) {
                  const error = new Error(`Missing localization: ${obj.key}`);
                  if (failOnMissing) {
                    compilation.errors.push(error);
                  } else if (!hideMessage) {
                    compilation.warnings.push(error);
                  }
                  dictValue = obj.key;
                }

                const dep = new ConstDependency(JSON.stringify(dictValue), obj.expression.range);
                dep.loc = obj.expression.loc;
                template.apply(dep, replacement);
              });
              let translatedSource = replacement.source();

              // Append our global language variable for mapped file lookups
              if (chunk.entrypoints.length > 0) {
                translatedSource = `const MULTILANGPLUGINLANGUAGE = '${lang}';\n${translatedSource}`;
              }

              // Swap out the language token in the filename for the target language
              const translatedFileName = fileName.replace('[language]', lang);

              // Add the file name to the asset list
              compilation.assets[translatedFileName] = {
                source: () => translatedSource,
                size: () => translatedSource.length,
              };
              translatedFiles.push(translatedFileName);
            });

            // Delete the original untranslated file
            delete compilation.assets[fileName];
          });

          // Remove the untranslated file from the chunk's file list and add the translated files
          chunk.files.filter(fileName => fileName.indexOf('[language]') === -1);
          chunk.files = chunk.files.concat(translatedFiles);
        });
      });
      callback();
    });
  }
}

export default MultiLangPlugin;
