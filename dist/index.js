/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_webpack_lib_dependencies_ConstDependency__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_webpack_lib_dependencies_ConstDependency___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_webpack_lib_dependencies_ConstDependency__);
/*
    MIT License http://www.opensource.org/licenses/mit-license.php
    Author Tobias Koppers @sokra
*/


/**
 *
 * @param {object|function} localization
 * @param {object|string} Options object or obselete functionName string
 * @constructor
 */
class MultiLangPlugin {
    constructor(localization, options, failOnMissing) {
        if (typeof failOnMissing !== 'undefined') {
            options.failOnMissing = failOnMissing;
        }

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

        const localization = this.localization,
            failOnMissing = this.failOnMissing,
            hideMessage = this.hideMessage;

        const name = this.functionName;

        compiler.plugin('make', (compilation, callback) => {
            // Swap out the language token for our global language variable in the script generator
            compilation.mainTemplate.plugin('jsonp-script', (_, chunk, hash) => _.replace('[language]', '" + MULTILANGPLUGINLANGUAGE + "'));

            // Run our language replacement after optimize (e.g. uglify) plugins run
            compilation.plugin('after-optimize-chunk-assets', (chunks) => {
                // Blank template for replacement operations
                const template = new __WEBPACK_IMPORTED_MODULE_0_webpack_lib_dependencies_ConstDependency___default.a.Template();

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
                                defaultValue = param = param.string;
                                break;
                            default:
                                return;
                            }

                            matches.push({
                                key: defaultValue,
                                expression: expr,
                            });
                            return true;
                        });

                        // Parse the original source and identify replacements
                        var source = compilation.assets[fileName].source();
                        parser.parse(source);

                        // Loop through each language in our dictionary and recompile the file
                        // with our chosen languages
                        Object.keys(localization).forEach((lang) => {
                            var replacement = new ReplaceSource(compilation.assets[fileName]);
                            matches.forEach((obj) => {
                                var dictValue = localization[lang][obj.key];

                                if (!dictValue) {
                                    var error = new Error(`Missing localization: ${obj.key}`);
                                    if (failOnMissing) {
                                        compilation.errors.push(error);
                                    } else if (!hideMessage) {
                                        compilation.warnings.push(error);
                                    }
                                    dictValue = obj.key;
                                }

                                var dep = new __WEBPACK_IMPORTED_MODULE_0_webpack_lib_dependencies_ConstDependency___default.a(JSON.stringify(dictValue), obj.expression.range);
                                dep.loc = obj.expression.loc;
                                template.apply(dep, replacement);
                            });
                            let translatedSource = replacement.source();

                            // Append our global language variable for mapped file lookups
                            if (chunk.chunks.length > 0) {
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

/* harmony default export */ __webpack_exports__["default"] = (MultiLangPlugin);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const NullDependency = __webpack_require__(2);

class ConstDependency extends NullDependency {
	constructor(expression, range) {
		super();
		this.expression = expression;
		this.range = range;
	}

	updateHash(hash) {
		hash.update(this.range + "");
		hash.update(this.expression + "");
	}
}

ConstDependency.Template = class ConstDependencyTemplate {
	apply(dep, source) {
		if(typeof dep.range === "number") {
			source.insert(dep.range, dep.expression);
			return;
		}

		source.replace(dep.range[0], dep.range[1] - 1, dep.expression);
	}
};

module.exports = ConstDependency;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const Dependency = __webpack_require__(3);

class NullDependency extends Dependency {
	get type() {
		return "null";
	}

	isEqualResource() {
		return false;
	}

	updateHash() {}
}

NullDependency.Template = class NullDependencyTemplate {
	apply() {}
};

module.exports = NullDependency;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

const compareLocations = __webpack_require__(4);

class Dependency {
	constructor() {
		this.module = null;
	}

	isEqualResource() {
		return false;
	}

	// Returns the referenced module and export
	getReference() {
		if(!this.module) return null;
		return {
			module: this.module,
			importedNames: true, // true: full object, false: only sideeffects/no export, array of strings: the exports with this names
		};
	}

	// Returns the exported names
	getExports() {
		return null;
	}

	getWarnings() {
		return null;
	}

	getErrors() {
		return null;
	}

	updateHash(hash) {
		hash.update((this.module && this.module.id) + "");
	}

	disconnect() {
		this.module = null;
	}

	// TODO: remove in webpack 3
	compare(a, b) {
		return compareLocations(a.loc, b.loc);
	}
}
Dependency.compare = (a, b) => compareLocations(a.loc, b.loc);

module.exports = Dependency;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

module.exports = function compareLocations(a, b) {
	if(typeof a === "string") {
		if(typeof b === "string") {
			if(a < b) return -1;
			if(a > b) return 1;
			return 0;
		} else if(typeof b === "object") {
			return 1;
		} else {
			return 0;
		}
	} else if(typeof a === "object") {
		if(typeof b === "string") {
			return -1;
		} else if(typeof b === "object") {
			if(a.start && b.start) {
				const ap = a.start;
				const bp = b.start;
				if(ap.line < bp.line) return -1;
				if(ap.line > bp.line) return 1;
				if(ap.column < bp.column) return -1;
				if(ap.column > bp.column) return 1;
			}
			if(a.index < b.index) return -1;
			if(a.index > b.index) return 1;
			return 0;
		} else {
			return 0;
		}
	}
};


/***/ })
/******/ ]);