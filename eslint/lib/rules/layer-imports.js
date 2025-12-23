const { FSD_LAYERS, DEFAULT_SRC_PATH } = require('../constants');
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
        properties: {
          srcPath: {
            type: 'string',
            description: 'src directory path from root',
            default: DEFAULT_SRC_PATH,
          },
        },
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
    const options = context.options[0] || {};
    const config = {
      srcPath: options.srcPath || DEFAULT_SRC_PATH,
    };

    const currentFilePath = normalizePath(context.getFilename());
    const currentLayer = detectLayerByPath(currentFilePath, config.srcPath);

    // Игнорируем файлы вне src или исключенные паттерны
    if (!currentFilePath.includes(config.srcPath)) {
      return {};
    }

    // Если не удалось определить слой, игнорируем
    if (!currentLayer) {
      return {};
    }

    const allowedLayers = FSD_LAYERS[currentLayer]?.allowed || [];

    const validateImport = (node) => {
      const importPath = node.source.value;

      // Проверяем относительные импорты
      if (importPath.startsWith('.')) {
        const relativeCheck = checkRelativeImport(importPath, currentFilePath, config.srcPath);

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

      const validLayers = Object.keys(FSD_LAYERS);
      if (!validLayers.includes(importedLayer)) {
        return;
      }

      const isSameSlice = isSameSliceFn(importPath, currentFilePath, config.srcPath);

      // автофикс если в одном слайсе импортируется абсолютный
      if (isSameSlice) {
        const relativePath = convertToRelativePath(importPath, currentFilePath, config.srcPath);

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
      if (
        !isPublicApiImport(importPath, currentFilePath, importedLayer, config.srcPath) &&
        !isSameSlice
      ) {
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
    };

    return {
      ImportDeclaration(node) {
        validateImport(node);
      },
      // Для динамических импортов
      ImportExpression(node) {
        if (node.source) {
          if (node.source.type === 'Literal' && typeof node.source.value === 'string') {
            validateImport(node);
          }
        }
      },
    };
  },
};
