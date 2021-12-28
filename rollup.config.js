const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'js/wastes.js',
	output: {
		name: 'wastes',
		file: 'bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: false,
		globals: { THREEX: 'THREEX' }
	}
};