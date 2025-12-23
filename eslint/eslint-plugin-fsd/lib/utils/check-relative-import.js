const path = require('path');
const { isSameSlice, detectLayerByPath } = require('./layer-detector');
const { NON_SLICEABLE_LAYERS } = require('../constants');
const { normalizePath } = require('./path-utils');

/**
 * Проверяет относительные импорты
 */
function checkRelativeImport(importPath, currentFilePath, srcPath) {
  if (!importPath.startsWith('.')) {
    return { isRelative: false };
  }

  // Вычисляем полный путь импортируемого файла
  const currentDir = path.dirname(currentFilePath);
  const importedFullPath = path.resolve(currentDir, importPath);

  // Определяем слои
  const currentLayer = detectLayerByPath(currentFilePath, srcPath);
  const importedLayer = detectLayerByPath(normalizePath(importedFullPath), srcPath);

  const sameSlice = isSameSlice(currentFilePath, importedFullPath, srcPath);
  const nonSliceableAndSameLayer =
    NON_SLICEABLE_LAYERS.includes(currentLayer) && currentLayer === importedLayer;

  const isAllowed = sameSlice || nonSliceableAndSameLayer;

  return {
    isRelative: true,
    isAllowed, // Разрешено только внутри одного слайса
    sameSlice,
  };
}

module.exports = {
  checkRelativeImport,
};
