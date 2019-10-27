const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
	entry: { vendor: './src/vendor.ts', main: './src/index.ts' },
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: '[name].bundle.js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html'
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				use: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
				exclude: /\.module\.css$/
			},
			{
				test: /\.scss$/,
				use: ['style-loader', 'css-loader', 'sass-loader']
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: true
						}
					}
				],
				include: /\.module\.css$/
			},
			{
				test: /\.ts(x)?$/,
				use: ['awesome-typescript-loader'],
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	}
};

module.exports = config;
