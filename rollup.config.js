import babel from 'rollup-plugin-babel';
import copy from 'rollup-plugin-copy';
import flow from 'rollup-plugin-flow';

export default [{
  input: 'src/index.js',
  output: {
    name: 'ES6 Module',
    file: 'lib/index.esm.js',
    format: 'esm',
    sourcemap: true,
  },
  external: ['axios', 'qs'],
  plugins: [
    flow(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [['env', { modules: false }]],
      plugins: [['transform-object-rest-spread', { useBuiltIns: true }]],
    }),
    copy({
      'src/index.js.flow': 'lib/index.js.flow',
    }),
  ],
}, {
  input: 'src/index.js',
  output: {
    name: 'CommonJS',
    file: 'lib/index.js',
    format: 'cjs',
    sourcemap: true,
  },
  external: ['axios', 'qs'],
  plugins: [
    flow(),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [['env', { modules: false }]],
      plugins: [['transform-object-rest-spread', { useBuiltIns: true }]],
    }),
    copy({
      'src/index.js.flow': 'lib/index.js.flow',
    }),
  ],
}];
