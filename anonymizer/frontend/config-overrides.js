const {override, fixBabelImports, addLessLoader, overrideDevServer, addWebpackAlias} = require('customize-cra');

const path = require('path');
const lessVariables = require('./src/lessVariables');
const offProxyLog = 'silent';
const onProxyLog = 'debug';
const useProxyLog = true;
const proxyLog = useProxyLog ? onProxyLog : offProxyLog;
const aliases = {
    "@root": "./src",
    "@components": "./src/Components",
    "@routes": "./src/Routes/Routes.ts",
    "@layouts": "./src/Layouts/index.tsx",
    "@pages": "./src/Pages",
    "@assets": "./src/Assets",
    "@containers": "./src/Containers",
    "@utils": "./src/Utils",
    "@redux": "./src/Redux",
    "@store": "./src/Redux/store.ts",
    "@api": "./src/Api/index",
    "@sagas": "./src/Sagas/root.ts",
    "@actions": "./src/Redux/actions.ts",
    "@modules": "./src/Modules",
    "@types": "./src/Types",

};
const getAliasWebpack = () => {
    const result = {};
    Object
        .entries(aliases)
        .forEach(([key,pathName]) => {
            result[key] = path.resolve(__dirname, pathName);
        });
    return result;
};
const getAliasForJest = () => {
    const result = {};
    Object
        .entries(aliases)
        .forEach(([key, pathName]) => {
            const isFile = Boolean(pathName.split('.').length > 1);
            const resultPath = isFile
                ? `<rootDir>/${pathName}`
                : `<rootDir>/${pathName}$1`;
            const resultKey = isFile
                ? `^${key}$`
                : `^${key}(.*)$`;
            result[resultKey] = resultPath;
        });
    return result;
};


module.exports = {
    webpack: override(
        fixBabelImports('import', {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: true,
        }),
        addWebpackAlias(getAliasWebpack()),
        addLessLoader({
            lessOptions: {
                javascriptEnabled: true,
                modifyVars: lessVariables
            },
        },
        {
            localIdentName: process.env.NODE_ENV === 'production' 
                ? "[hash:base64:7]" 
                : "[name]__[local]--[hash:base64:5]",
        }),
    ),
    jest: (config) => {
        const alias = getAliasForJest();
        config.moduleNameMapper = {
            ...config.moduleNameMapper,
            ...alias
        };
        return config;
    },
    devServer: overrideDevServer( (config) => {
        return {
            ...config,
            proxy: [
                {
                    context: ['/api/'],
                    target: 'http://deepdocs.ru/',
                    changeOrigin: true,
                    logLevel: proxyLog
                },
            ]
        };
    })
};