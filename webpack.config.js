module.exports = {
  entry: './handler.js',
  target: 'node',
  stats: {
    warnings: false,
    chunks: false,
  },
  module: {
    loaders: [{
      test: [/\.js$/],
      loaders: ['babel-loader'],
      include: __dirname,
      exclude: [/node_modules/],
    }, {
      test: /\.json$/,
      loaders: ['json-loader'],
    }, {
      test: /\.txt$/,
      loaders: ['raw-loader'],
    }],
  },
};
