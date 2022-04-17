const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');

const directoryPath = path.resolve('public');
const getDirs = async () => {
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        reject('Unable to scan directory: ' + err);
      }
      resolve(files);
    });
  });
};

module.exports = async (env, agrv) => {
  const isDev = agrv.mode === 'development';

  const dirs = await getDirs();
  const copyPluginPatterns = dirs
    .filter((dir) => dir !== 'index.html')
    .map((dir) => {
      return {
        from: dir,
        to: '',
        context: path.resolve('public'),
      };
    });

  const basePlugins = [
    new Dotenv({
      safe: true,
      allowEmptyValues: true,
    }),
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: isDev ? '[name].css' : 'static/css/[name].[contenthash:6].css',
    }),
  ];
  if (copyPluginPatterns.length > 0) {
    basePlugins.push(
      new CopyPlugin({
        patterns: copyPluginPatterns,
      })
    );
  }
  const prodPlugins = [...basePlugins, new CleanWebpackPlugin()];

  return {
    entry: './src/index.tsx',
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: ['ts-loader'],
          exclude: /node_modules/,
        },
        {
          test: /\.(s[ac]ss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { sourceMap: isDev ? true : false },
            },
            {
              loader: 'sass-loader',
              options: { sourceMap: isDev ? true : false },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
      alias: {
        '@': path.resolve('src'),
        '@@': path.resolve(),
      },
    },
    output: {
      path: path.resolve('build'),
      publicPath: '/',
      filename: 'static/js/main.[contenthash:6].js',
      environment: {
        arrowFunction: false,
        bigIntLiteral: false,
        const: false,
        destructuring: false,
        dynamicImport: false,
        forOf: false,
        module: false,
      },
    },
    devtool: isDev ? 'source-map' : false,
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      port: 9000,
      hot: true,
      open: true,
      historyApiFallback: true,
    },
    plugins: isDev ? basePlugins : prodPlugins,
    performance: {
      maxEntrypointSize: 800000,
    },
  };
};
