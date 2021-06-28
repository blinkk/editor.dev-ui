const path = require('path');

module.exports = {
  entry: {
    example: './src/ts/example/example.ts',
    'server/server': './src/ts/server/server.ts',
    'server/gh.callback': './src/ts/server/gh/githubCallback.ts',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].min.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
};
