const normalizePath = (path) => path.replace(/\\/g, '/');

/**
 * Извлекает слой и слайс из физического пути
 * C:/project/src/entities/user/ui/Component.tsx → { layer: 'entities', slice: 'user' }
 */
function extractLayerAndSliceFromPath(filePath, srcPath) {
  const normalized = filePath.replace(/\\/g, '/');
  const normalizedSrcPath = srcPath.replace(/\\/g, '/');
  const srcIndex = normalized.indexOf(normalizedSrcPath);

  if (srcIndex === -1) return null;

  const afterSrc = normalized.substring(srcIndex + normalizedSrcPath.length);
  const parts = afterSrc.split('/');

  if (parts.length < 2) return null;

  return {
    layer: parts[0],
    slice: parts[1],
    fullPath: parts[0] + '/' + parts[1],
  };
}

/**
 * Извлекает слой и слайс из импортного пути
 * @entities/user/ui/Component → { layer: 'entities', slice: 'user' }
 * @entities/user → { layer: 'entities', slice: 'user' }
 */
function extractLayerAndSliceFromImport(importPath) {
  if (!importPath.startsWith('@')) return null;

  // Убираем @ и разбиваем на части
  const withoutAt = importPath.substring(1);
  const parts = withoutAt.split('/');

  if (parts.length < 2) return null;

  return {
    layer: parts[0], // 'entities'
    slice: parts[1], // 'user'
    fullPath: parts[0] + '/' + parts[1],
  };
}

module.exports = {
  normalizePath,
  extractLayerAndSliceFromPath,
  extractLayerAndSliceFromImport,
};
