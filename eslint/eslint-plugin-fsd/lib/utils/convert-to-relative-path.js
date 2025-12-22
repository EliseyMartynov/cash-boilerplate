const path = require('path');
const { extractLayerAndSliceFromImport, extractLayerAndSliceFromPath } = require('./path-utils');
const { getSliceRoot } = require('./get-slice-root');

/**
 * Преобразует абсолютный импорт внутри слайса в относительный путь
 * @entities/user/ui/Component → ../ui/Component
 * @entities/user/model/types → ../model/types
 * @entities/test2/asd → ./asd (если в той же директории)
 */
function convertToRelativePath(absoluteImport, currentFilePath) {
  if (!absoluteImport.startsWith('@')) return absoluteImport;

  // Извлекаем layer и slice из импорта
  const importInfo = extractLayerAndSliceFromImport(absoluteImport);
  if (!importInfo) return absoluteImport;

  // Извлекаем layer и slice из текущего файла
  const currentInfo = extractLayerAndSliceFromPath(currentFilePath);
  if (!currentInfo) return absoluteImport;

  // Проверяем, что это действительно внутри одного слайса
  if (importInfo.layer !== currentInfo.layer || importInfo.slice !== currentInfo.slice) {
    return absoluteImport;
  }

  // Разбираем импортный путь на части
  // @entities/test2/asd → ['entities', 'test2', 'asd']
  // @entities/user/ui/Component → ['entities', 'user', 'ui', 'Component']
  const withoutAt = absoluteImport.substring(1);
  const parts = withoutAt.split('/');

  // Если только layer/slice (@entities/test2) → импортируем index
  if (parts.length === 2) {
    return '../index';
  }

  // Отбрасываем первые две части (layer и slice)
  // ['entities', 'test2', 'asd'] → ['asd']
  // ['entities', 'user', 'ui', 'Component'] → ['ui', 'Component']
  const pathInsideSlice = parts.slice(2).join('/');

  // Получаем директорию текущего файла
  const currentDir = path.dirname(currentFilePath);

  // Получаем корень слайса
  const sliceRoot = getSliceRoot(currentFilePath);
  if (!sliceRoot) return absoluteImport;

  // Строим путь к импортируемому файлу ВНУТРИ слайса
  const importedFullPath = path.join(sliceRoot, pathInsideSlice);

  // Вычисляем относительный путь
  let relativePath = path.relative(currentDir, importedFullPath);

  // Убеждаемся, что путь начинается с ./
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }

  // Убираем расширение .ts/.tsx если есть
  relativePath = relativePath.replace(/\.(ts|tsx)$/, '');

  // Заменяем обратные слеши на прямые
  return relativePath.replace(/\\/g, '/');
}

module.exports = {
  convertToRelativePath,
};
