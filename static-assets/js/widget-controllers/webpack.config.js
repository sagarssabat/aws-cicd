const path = require("path");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: "./src/main.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].[hash].chunk.js",
    publicPath: "/static-assets/scripts/stimulus/dist/"
  },
  resolve: {
    extensions: [".js", ".ts"],
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'public'),
  },
  plugins: [
    new CleanWebpackPlugin("dist"),
    new BundleAnalyzerPlugin()
  ]
};