import litCssPlugin from 'rollup-plugin-lit-css';
const litCss = litCssPlugin.default || litCssPlugin;
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import { terser } from '@el3um4s/rollup-plugin-terser';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';

const dev = process.env.ROLLUP_WATCH;

const serveOptions = {
  contentBase: ['./dist'],
  host: 'localhost',
  port: 5000,
  allowCrossOrigin: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
};

export default {
  input: 'src/datetime-picker-card.ts',
  output: {
    dir: './dist',
    format: 'es',
  },
  plugins: [
    litCss({ include: 'src/**/*.css' }),
    typescript({ exclude: ['test/**/*'] }),
    nodeResolve(),
    json(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    dev && serve(serveOptions),
    !dev && terser(),
  ],
};
