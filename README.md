[![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![test][test]][test-url]
[![coverage][cover]][cover-url]

<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" vspace="" hspace="25"
      src="https://cdn.worldvectorlogo.com/logos/webpack-icon.svg">
  </a>
  <h1>Multi-Language i18n Plugin</h1>
  <p>Multi-language i18n (localization) plugin for Webpack.<p>
</div>

<h2 align="center">Install</h2>

```bash
npm i -D webpack-multilang-i18n-plugin
```

<h2 align="center">Usage</h2>

This plugin is an adaptation of the original [i18n Webpack plugin](https://github.com/webpack-contrib/i18n-webpack-plugin) for creating bundles with translations baked in. This plugin solves the problem of slow compilation times for multiple languages by moving the translation process later in the Webpack compilation.

In order to leverage the functionality of this plugin, at least one of your output filenames will need to use the substitution token `[language]` (in a manner similar to other tokens explained [here](https://webpack.js.org/configuration/output/)). For example, you might have an output definition that looks like the following:

```
output: {
  path: utils.resolvePath('public/js/dist'),
  filename: `[name].[language].js`
}
```

In this particular case, if you run the plugin with languages `en` and `fr`, you will end up with files `[name].en.js` and `[name].fr.js` for each of the generated assets.

<h2 align="center">Options</h2>

```
plugins: [
  ...
  new I18nPlugin(localizationObj, optionsObj)
],
```
 - `localizationObj`: a multi-language dictionary, keyed by language code, each containing it's own key/value dictionary, ex. `{"en": {"string1": "Welcome", "string2": "Goodbye"}, "fr": {"string1": "Bienvenue", "string2": "Au revior"}}`
 - `optionsObj.functionName`: the default value is `__`, you can change it to other function name.
 - `optionsObj.failOnMissing`: the default value is `false`, which will show a warning message, if the mapping text cannot be found. If set to `true`, the message will be an error message.
 - `optionsObj.hideMessage`: the default value is `false`, which will show the warning/error message. If set to `true`, the message will be hidden.

<h2 align="center">Manifests</h2>

The plugin operates by appending multiple files to each chunk, which can cause some conflicts with the [Webpack manifest plugin](https://github.com/danethurber/webpack-manifest-plugin). The solution is to use the filter option to manually generate multiple manifests:

```
config.plugins = { new MultiLangPlugin(localizationObj) };
Object.keys(localizationObj).forEach((lang) => {
    config.plugins.push(new ManifestPlugin({
        fileName: `manifest.${lang}.json`,
        filter: file => file.path.indexOf(`.${lang}.`) >= 0,
    }));
});
```


[npm]: https://img.shields.io/npm/v/webpack-multilang-i18n-plugin.svg
[npm-url]: https://npmjs.com/package/webpack-multilang-i18n-plugin

[deps]: https://david-dm.org/devonreed/webpack-multilang-i18n-plugin.svg
[deps-url]: https://david-dm.org/devonreed/webpack-multilang-i18n-plugin

[test]:https://img.shields.io/travis/devonreed/webpack-multilang-i18n-plugin.svg
[test-url]:https://travis-ci.org/devonreed/webpack-multilang-i18n-plugin

[cover]: https://codecov.io/gh/devonreed/webpack-multilang-i18n-plugin/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/devonreed/webpack-multilang-i18n-plugin
