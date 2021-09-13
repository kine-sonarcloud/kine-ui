const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.tsx',
  },
  devtool: false,
  devServer: {
    contentBase: path.join(__dirname, './'), // where dev server will look for static files, not compiled
    publicPath: '/', // relative path to output path where  devserver will look for compiled files
    historyApiFallback: true,
    hot: true,
    host: '0.0.0.0',
    port: 3333,
    https: false,
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'dist'), // base path where to send compiled assets
    publicPath: '/', // base path where referenced files will be look for
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'), // shortcut to reference src folder from anywhere
    },
  },
  module: {
    rules: [
      { // config for es6 jsx
        test: /\.(js|jsx|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      { // config for sass compilation
        test: /\.(css|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          'css-loader',
          {
            loader: 'sass-loader',
          },
        ],
      },
      { // config for images
        test: /\.(png|svg|jpg|jpeg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
            },
          },
        ],
      },
      { // config for fonts
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ // plugin for inserting scripts into html
      template: './public/index.html',
      filename: 'index.html',
      title: 'Learning Webpack',
      favicon: './public/favicon.ico',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename: 'css/[id].css',
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['css/*.*', 'js/*.*', 'fonts/*.*', 'images/*.*'],
    }),
  ],
};
