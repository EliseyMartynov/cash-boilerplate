const { FSD_LAYERS } = require('../constants');
const { normalizePath } = require('../utils/path-utils');
const {
  detectLayerByPath,
  detectLayerByImport,
  isSameSlice: isSameSliceFn,
} = require('../utils/layer-detector');
const { checkRelativeImport } = require('../utils/check-relative-import');
const { convertToRelativePath } = require('../utils/convert-to-relative-path');
const { isPublicApiImport } = require('../utils/is-public-api');

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce Feature-Sliced Design layer import rules',
      category: 'Architecture',
      recommended: true,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    ],
    messages: {
      invalidImport:
        'FSD violation: {{currentLayer}} cannot import from {{importedLayer}}. {{message}} ',
      unknownLayer: 'FSD: Cannot determine layer for import "{{importPath}}" ',
      relativeImportViolation:
        'FSD violation: Relative import "{{importPath}}" is only allowed within the same slice. ',
      publicApiViolation:
        'FSD Public API violation: Cross-slice import must be through index.ts file. ',
      absoluteWithinSlice: 'FSD Absolute import inside same slice. ',
    },
  },

  create(context) {
    const currentFilePath = normalizePath(context.getFilename());
    const currentLayer = detectLayerByPath(currentFilePath);

    // Игнорируем файлы вне src или исключенные паттерны
    if (!currentFilePath.includes('/src/')) {
      return {};
    }

    // Если не удалось определить слой, игнорируем
    if (!currentLayer) {
      return {};
    }

    const allowedLayers = FSD_LAYERS[currentLayer]?.allowed || [];

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Проверяем относительные импорты
        if (importPath.startsWith('.')) {
          const relativeCheck = checkRelativeImport(importPath, currentFilePath);

          if (!relativeCheck.isAllowed) {
            context.report({
              node,
              messageId: 'relativeImportViolation',
              data: {
                importPath,
              },
            });
          }
          return;
        }

        // Игнорируем внешние зависимости
        if (!importPath.startsWith('@') && !importPath.startsWith('.')) {
          return;
        }

        // Определяем слой импорта
        const importedLayer = detectLayerByImport(importPath);

        if (!importedLayer || importedLayer === 'external') {
          return;
        }

        const isSameSlice = isSameSliceFn(importPath, currentFilePath);

        // автофикс если в одном слайсе импортируется абсолютный
        if (isSameSlice) {
          const relativePath = convertToRelativePath(importPath, currentFilePath);

          context.report({
            node,
            messageId: 'absoluteWithinSlice',
            data: {
              absolutePath: importPath,
              relativePath: relativePath,
            },
            fix(fixer) {
              return fixer.replaceText(node.source, `'${relativePath}'`);
            },
          });
          return;
        }

        // Проверяем Public API ТОЛЬКО для импортов МЕЖДУ слайсами
        // Проверяем, не внутри ли одного слайса
        if (!isPublicApiImport(importPath, currentFilePath, importedLayer) && !isSameSlice) {
          context.report({
            node,
            messageId: 'publicApiViolation',
            data: {
              importPath,
            },
          });
        }

        // Проверяем правило слоев
        // Проверяем, не внутри ли одного слайса
        if (!allowedLayers.includes(importedLayer) && !isSameSlice) {
          const layerRule = FSD_LAYERS[currentLayer];

          context.report({
            node,
            messageId: 'invalidImport',
            data: {
              currentLayer,
              importedLayer,
              message: layerRule?.message || `Allowed layers: ${allowedLayers.join(', ')}`,
            },
          });
        }
      },
    };
  },
};
