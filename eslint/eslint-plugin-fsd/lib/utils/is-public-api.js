const { isSameSlice } = require('./layer-detector');

/**
 * Проверяет, является ли импорт через Public API
 * Для импортов МЕЖДУ слайсами
 */
function isPublicApiImport(importPath, currentFilePath, importedLayer, srcPath) {
  // Проверяем, в одном ли слайсе текущий файл и импорт
  const isSameSliceImport = isSameSlice(importPath, currentFilePath, srcPath);
  if (isSameSliceImport) {
    return true; // Внутри слайса - не проверяем Public API
  }

  // Для импортов МЕЖДУ слайсами проверяем Public API
  if (importPath.startsWith('@')) {
    const match = importPath.match(/^@\w+\/(.+)$/);
    if (match) {
      const pathAfterAlias = match[1];

      // Public API паттерны:
      // - @entities/user ✅ (просто имя слайса - значит index.ts)
      // - @entities/user/index ✅ (явно index)
      // - @entities/user/model ❌ (сегмент)
      // - @entities/user/ui/Component ❌ (глубокий импорт)

      const pathParts = pathAfterAlias.split('/');

      // Если есть более 1 части И последняя часть не 'index' - нарушение
      if (pathParts.length > 1 && pathParts[pathParts.length - 1] !== 'index') {
        return false;
      }
    }
  }

  return true;
}

module.exports = {
  isPublicApiImport,
};
