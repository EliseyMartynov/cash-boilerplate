// FSD слои и их правила импортов
module.exports.FSD_LAYERS = {
  app: {
    allowed: ['app', 'processes', 'pages', 'widgets', 'features', 'entities', 'shared'],
    message:
      'App layer can only import from app, processes, pages, widgets, features, entities, shared',
  },
  processes: {
    allowed: ['pages', 'widgets', 'features', 'entities', 'shared'],
    message: 'Processes layer can import from pages, widgets, features, entities, shared',
  },
  pages: {
    allowed: ['widgets', 'features', 'entities', 'shared'],
    message: 'Pages layer can import from widgets, features, entities, shared',
  },
  widgets: {
    allowed: ['features', 'entities', 'shared'],
    message: 'Widgets layer can import from features, entities, shared',
  },
  features: {
    allowed: ['entities', 'shared'],
    message: 'Features layer can import from entities, shared',
  },
  entities: {
    allowed: ['shared'],
    message: 'Entities layer can import from shared',
  },
  shared: {
    allowed: ['shared'],
    message: 'Shared layer can only import from shared layer',
  },
};

// Сегменты FSD (ui, model, lib, api и т.д.)
module.exports.SEGMENTS = ['ui', 'model', 'lib', 'api', 'config', 'types'];

// НОВОЕ: Слои, которые не имеют слайсов
module.exports.NON_SLICEABLE_LAYERS = ['app', 'shared'];

// Алиасы для импортов
module.exports.ALIAS_MAP = {
  '@app': 'app',
  '@processes': 'processes',
  '@pages': 'pages',
  '@widgets': 'widgets',
  '@features': 'features',
  '@entities': 'entities',
  '@shared': 'shared',
};
