module.exports = {
    "env": {
        "node": true,
        "mongo": true,
        "commonjs": true,
        "es6": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "semi": [
            "error",
            "always"
        ],
        "comma-dangle": "off",
        "no-console": "off",
    }
};
