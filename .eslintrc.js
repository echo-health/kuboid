module.exports = {
    extends: 'airbnb-base',
    env: {
        jest: true,
        jasmine: true,
    },
    rules: {
        'no-console': 0,
        'arrow-parens': ['error', 'as-needed'],
        'comma-dangle': ['error', 'always-multiline'],
        'import/no-dynamic-require': 'off',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
            },
        ],
        indent: 'off',
        'no-mixed-operators': 'off',
        'wrap-iife': 'off',
        'no-confusing-arrow': 'off',
        'space-before-function-paren': 'off',
        'generator-star-spacing': 'off',
        'max-len': ['error', 240],
        'no-param-reassign': [
            'error',
            {
                props: false,
            },
        ],
        'no-multi-assign': 'off',
    },
};
