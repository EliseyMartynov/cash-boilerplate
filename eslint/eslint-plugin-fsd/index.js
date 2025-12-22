const layerImports = require('./lib/rules/layer-imports');

module.exports = {
  rules: {
    'layer-imports': layerImports,
  },
  configs: {
    recommended: {
      rules: {
        'fsd/layer-imports': 'error',
      },
    },
  },
};
