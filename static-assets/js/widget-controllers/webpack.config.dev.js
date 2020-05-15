const path = require("path");

module.exports = {
  mode: 'development',
  entry: "./src/main.ts",
  devtool: "sourcemap",
  output: {
    path: path.join(__dirname, "build"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
    publicPath: 'http://localhost:9020/'
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
    port: 9020
  }
};