const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = async (env, agrv) => {
  const isDev = agrv.mode === 'development';
  const PORT = 9000;

  const basePlugins = [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
  ];
  const prodPlugins = [...basePlugins];

  return {
    entry: './src/index.tsx',
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: ['ts-loader'],
          exclude: /node_modules/,
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
      filename: 'static/js/main.js',
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
      port: PORT,
      hot: true,
      open: true,
    },
    plugins: isDev ? basePlugins : prodPlugins,
    performance: {
      maxEntrypointSize: 800000,
    },
  };
};
