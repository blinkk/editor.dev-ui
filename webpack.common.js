const path = require('path');

module.exports = {
  entry: {
    example: './src/ts/example/example.ts',
    preview: './src/ts/example/preview.ts',
    'server/app': './src/ts/server/app.ts',
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
    fallback: {path: require.resolve('path-browserify')},
  },
};
