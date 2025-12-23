const { ALIAS_MAP, FSD_LAYERS } = require('../constants');
const { extractLayerAndSliceFromImport, extractLayerAndSliceFromPath } = require('./path-utils');

/**
 * Определяет слой FSD по пути к файлу
 */
function detectLayerByPath(filePath, srcPath) {
  const normalizedSrcPath = srcPath.replace(/\\/g, '/');
  const normalizedFilePath = filePath.replace(/\\/g, '/');

  // Проверяем наличие srcPath в пути
  if (!normalizedFilePath.includes(normalizedSrcPath)) {
    return null;
  }

  const srcIndex = normalizedFilePath.indexOf(normalizedSrcPath);
  const afterSrc = normalizedFilePath.substring(srcIndex + normalizedSrcPath.length);
  const parts = afterSrc.split('/');

  if (parts.length === 0) return null;

  const layer = parts[0];

  // Используем ключи из FSD_LAYERS вместо жесткого списка
  const possibleLayers = Object.keys(FSD_LAYERS);
  if (possibleLayers.includes(layer)) {
    return layer;
  }

  return null;
}

/**
 * Определяет слой FSD по импорту (алиасу)
 */
function detectLayerByImport(importPath) {
  // Проверяем алиасы @app, @entities и т.д.
  for (const [alias, layer] of Object.entries(ALIAS_MAP)) {
    if (importPath.startsWith(alias + '/')) {
      return layer;
    }
  }

  // Проверяем относительные импорты
  if (importPath.startsWith('.')) {
    return null;
  }

  // Внешние зависимости (react, mobx и т.д.)
  return 'external';
}

/**
 * Проверяет, находятся ли два пути В ОДНОМ СЛАЙСЕ
 * Работает с любыми комбинациями: физический+физический, физический+импортный
 */
function isSameSlice(path1, path2, srcPath) {
  // Извлекаем информацию о первом пути
  const info1 = path1.startsWith('@')
    ? extractLayerAndSliceFromImport(path1)
    : extractLayerAndSliceFromPath(path1, srcPath);

  // Извлекаем информацию о втором пути
  const info2 = path2.startsWith('@')
    ? extractLayerAndSliceFromImport(path2)
    : extractLayerAndSliceFromPath(path2, srcPath);

  if (!info1 || !info2) return false;

  return info1.layer === info2.layer && info1.slice === info2.slice;
}

module.exports = {
  detectLayerByPath,
  detectLayerByImport,
  isSameSlice,
};
