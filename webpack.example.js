const common = require('./webpack.common.js');

module.exports = Object.assign({}, common, {
  entry: {
    example: './src/ts/example/example.ts',
  },
  mode: 'production',
});
