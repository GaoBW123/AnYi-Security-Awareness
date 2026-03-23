const path = require('path');
const yaml = require('yamljs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

let index = "app";

module.exports = {
    entry: {
        index: `./src/${index}.tsx`
    },
    devtool: "source-map",
    mode: "development",
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.[t|j]sx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, 
            {
                test: /\.s?[ac]ss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
                // exclude: /node_modules/
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                type: "asset/resource",
                exclude:[/node_modules/],
                generator: {
                    outputPath: "assets/image",
                    publicPath: "/assets/image/",
                    filename: "[hash][ext]"
                }
            },
            {
                test: /assets\\images\\emojis\\.*\.png$/,
                type: "asset/resource",
                exclude: /node_modules/,
                generator: {
                    outputPath: "assets/emojis",
                    publicPath: "/assets/emojis",
                    filename: "[name][ext]"
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: "asset/resource",
                exclude: /node_modules/,
                generator: {
                    outputPath: "assets/font",
                    publicPath: "/assets/font/",
                    filename: "[hash][ext]"
                }
            },
            {
                test: /\.(c|t)sv$/,
                use: ["csv-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.xml$/,
                use: ["xml-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.ya?ml$/,
                type: "json",
                parser: {
                    parse: yaml.parse
                },
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                type: "json",
                parser: {
                    parse: JSON.parse
                },
                exclude: /node_modules/
            },
            {
                test: /html?$/,
                use: ["html-loader"],
                exclude: /node_modules/
            }
        ]
    },

    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx"]
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: `./src/html/${index}.html`,
            filename: `${index}.html`,
        })
    ],

    output: {
        filename: `${index}.bundle.js`,
        path: path.resolve(__dirname, `server/public`),
        clean: false
    },

    devServer: {
        static: [
            {
               directory: path.resolve(__dirname, "dist", index)
            }
        ],
        hot: true
    }
};