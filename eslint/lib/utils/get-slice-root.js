const { normalizePath } = require('./path-utils');

/**
 * Получает корневую директорию слайса
 * C:/project/src/entities/user/ui/Component.tsx → C:/project/src/entities/user
 */
function getSliceRoot(filePath, srcPath) {
  const normalized = normalizePath(filePath);
  const normalizedSrcPath = normalizePath(srcPath);
  const srcIndex = normalized.indexOf(normalizedSrcPath);

  if (srcIndex === -1) return null;

  const afterSrc = normalized.substring(srcIndex + normalizedSrcPath.length);
  const parts = afterSrc.split('/');

  if (parts.length < 2) return null;

  const sliceDepth = srcIndex + normalizedSrcPath.length + parts[0].length + 1 + parts[1].length;
  return normalized.substring(0, sliceDepth);
}

module.exports = {
  getSliceRoot,
};
