module.exports = {
    "env": {
        "browser": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "@typescript-eslint/naming-convention": [
          "error",
          {
            "selector": "variable",
            "modifiers": ["const"],
            "format": ["camelCase", "UPPER_CASE"]
          },
          {
            "selector": "variableLike",
            "format": ["camelCase"]
          }
        ],
        "@typescript-eslint/ban-ts-comment": "off"
    }
}
