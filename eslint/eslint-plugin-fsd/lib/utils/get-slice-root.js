const { normalizePath } = require('./path-utils');

/**
 * Получает корневую директорию слайса
 * C:/project/src/entities/user/ui/Component.tsx → C:/project/src/entities/user
 */
function getSliceRoot(filePath) {
  const normalized = normalizePath(filePath);
  const srcIndex = normalized.indexOf('/src/');
  if (srcIndex === -1) return null;

  const afterSrc = normalized.substring(srcIndex + 5); // +5 для '/src/'
  const parts = afterSrc.split('/');

  // Нужно как минимум слой/слайс
  if (parts.length < 2) return null;

  // Возвращаем путь до слайса
  const sliceDepth = srcIndex + 5 + parts[0].length + 1 + parts[1].length;
  return normalized.substring(0, sliceDepth);
}

module.exports = {
  getSliceRoot,
};
