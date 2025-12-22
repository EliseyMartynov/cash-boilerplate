const { ALIAS_MAP } = require('../constants');
const { extractLayerAndSliceFromImport, extractLayerAndSliceFromPath } = require('./path-utils');

/**
 * Определяет слой FSD по пути к файлу (работает на Windows и Unix)
 */
function detectLayerByPath(filePath) {
  if (filePath.includes('/src/app/')) {
    return 'app';
  }
  if (filePath.includes('/src/processes/')) {
    return 'processes';
  }
  if (filePath.includes('/src/pages/')) {
    return 'pages';
  }
  if (filePath.includes('/src/widgets/')) {
    return 'widgets';
  }
  if (filePath.includes('/src/features/')) {
    return 'features';
  }
  if (filePath.includes('/src/entities/')) {
    return 'entities';
  }
  if (filePath.includes('/src/shared/')) {
    return 'shared';
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
function isSameSlice(path1, path2) {
  // Извлекаем информацию о первом пути
  const info1 = path1.startsWith('@')
    ? extractLayerAndSliceFromImport(path1)
    : extractLayerAndSliceFromPath(path1);

  // Извлекаем информацию о втором пути
  const info2 = path2.startsWith('@')
    ? extractLayerAndSliceFromImport(path2)
    : extractLayerAndSliceFromPath(path2);

  if (!info1 || !info2) return false;

  // Сравниваем слой и слайс
  return info1.layer === info2.layer && info1.slice === info2.slice;
}

module.exports = {
  detectLayerByPath,
  detectLayerByImport,
  isSameSlice,
};
