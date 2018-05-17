import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';
import typescript from 'rollup-plugin-typescript2';

const banner = `/**
 * Exmg React Form v${pkg.version}
 * (C) 2017-${new Date().getFullYear()} Niek Saarberg
 * Released under the MIT License.
 */`;

const external = [
	...Object.keys(pkg.dependencies || {}),
	...Object.keys(pkg.devDependencies || {}),
	...Object.keys(pkg.peerDependencies || {}),
];

const plugins = [
	typescript({
		jsx: 'react',
	}),
	resolve({
		extensions: ['.ts', '.tsx'],
	}),
];

export default [
	{
		input: 'src/index.ts',
		output: {
			file: pkg.module,
			format: 'es',
			banner,
			sourcemap: true,
			exports: 'named',
		},
		external,
		plugins,
	},
	{
		input: 'src/index.ts',
		output: {
			file: pkg.main,
			format: 'cjs',
			banner,
			sourcemap: true,
			exports: 'named',
		},
		external,
		plugins,
	},
];
