const path = require('path');

module.exports = {
  entry: {
    example: './src/example/example.ts',
    'server/editor': './src/server/editor.ts',
    'server/gh/callback': './src/server/gh/githubCallback.ts',
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
    path: path.resolve(__dirname, './dist/src/'),
    filename: '[name].min.js',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
};
