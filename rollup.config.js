import babel from 'rollup-plugin-babel';
export default {
  input: 'src/message.js',
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ],
  output: {
    file: 'dist/jmessage.js', // 输出文件
    format: 'umd',
    name: 'message'
  }
};