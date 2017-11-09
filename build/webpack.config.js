const path = require('path');
const webpack = require('webpack');

const srcDir = path.resolve('src');
const WebpackConfig = {
	context: srcDir,

	entry: './index.js',

	output: {
		path: path.resolve('dist'),
		filename: `index.js`
	},
};

module.exports = WebpackConfig;
