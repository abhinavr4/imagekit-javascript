import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';
import { terser } from "rollup-plugin-terser";

export default [
	// browser-friendly UMD build
	{
		input: 'src/index.js',
		output: {
			name: 'ImageKit',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			commonjs(), // so Rollup can convert `ms` to an ES module
			json(),
			terser()
		]
	},
	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/index.js',
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		],
		plugins: [
			json()
		]
	}
];