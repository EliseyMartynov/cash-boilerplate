# DI для React + MobX

Минималистичная библиотека Dependency Injection для React с MobX.

## Установка

```bash
# Убедитесь что установлены peer зависимости
npm install mobx mobx-react-lite
```

## Основные концепции

### 1. Сервисы vs Модели

**Сервисы** - обычные классы без состояния:
```typescript
class ApiService {
  constructor(private baseUrl: string) {}
  
  async getUsers() {
    const response = await fetch(`${this.baseUrl}/users`);
    return response.json();
  }
}
```

**Модели** - классы с состоянием (помечаются `@model`):
```typescript
import { model } from 'shared/di';

@model
class UserModel {
  // Автоматически инжектируется
  api: ApiService;
  
  // Автоматически становится observable
  users = [];
  
  // Методы автоматически становятся actions
  async loadUsers() {
    this.users = await this.api.getUsers();
  }
  
  // Автоматическая очистка подписок
  dispose() {
    // Будет вызван автоматически при уничтожении DiScope
  }
}
```

### 2. DiScope

Создаёт контекст с зависимостями:

```tsx
import { DiScope } from 'shared/di';

const App = () => (
  <DiScope providers={[
    new ApiService('https://api.example.com'),
  ]}>
    <Pages />
  </DiScope>
);

const UserPage = () => (
  <DiScope providers={[
    // Создаём модель с аргументами
    [UserModel, 'initial-value'],
    
    // Или готовый инстанс
    // new UserModel(),
    
    // Или фабрика
    // () => new UserModel(),
  ]}>
    <UserList />
  </DiScope>
);
```

### 3. useModel

Получает модель из DI контейнера:

```tsx
import { useModel } from 'shared/di';

const UserList = () => {
  const userModel = useModel(UserModel);
  
  useEffect(() => {
    userModel.loadUsers();
  }, []);
  
  return (
    <div>
      {userModel.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

## Особенности

### Автоматическая очистка
При размонтировании `DiScope` автоматически очищаются:
1. Все MobX реакции (autorun, reaction)
2. Вызывается метод `dispose()` если он есть
3. Удаляются все ссылки на инстансы

```typescript
@model
class MyModel {
  users = [];
  
  constructor() {
    // Автоматически очистится
    this.autorun(() => {
      console.log('Users changed:', this.users);
    });
    
    // Или с autoDispose
    const disposer = reaction(
      () => this.users.length,
      (count) => console.log('Count:', count)
    );
    this.autoDispose(disposer);
  }
  
  // Явная очистка (опционально)
  dispose() {
    console.log('Model disposed');
  }
}
```

### Dev режим
В development режиме:
- `useModel()` бросает ошибку если модель не найдена
- Доступны dev инструменты:

```tsx
import { DiDebug } from 'shared/di';

const App = () => (
  <DiScope>
    <YourApp />
    <DiDebug /> {/* Показывает иерархию DI в углу экрана */}
  </DiScope>
);
```

## Полный пример

```tsx
// 1. Определяем сервисы и модели
class ApiService {
  constructor(baseUrl: string) {}
  async getData() { /* ... */ }
}

@model
class DataModel {
  api: ApiService;
  data = [];
  
  constructor(public category: string) {}
  
  async load() {
    this.data = await this.api.getData(this.category);
  }
}

// 2. Настраиваем DI в приложении
const App = () => (
  <DiScope providers={[new ApiService('/api')]}>
    <DataPage />
  </DiScope>
);

// 3. Создаём модель на странице с аргументами
const DataPage = ({ category }: { category: string }) => (
  <DiScope providers={[
    [DataModel, category] // Передаём аргумент в конструктор
  ]}>
    <DataView />
  </DiScope>
);

// 4. Используем модель в компоненте
const DataView = () => {
  const model = useModel(DataModel);
  
  useEffect(() => {
    model.load();
  }, []);
  
  return (
    <div>
      <h2>Category: {model.category}</h2>
      {model.data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

## Правила

1. **Сервисы** создаются в корневом `DiScope`
2. **Модели** создаются там где нужны (обычно на уровне страницы)
3. **`useModel()`** только ищет модель, не создаёт её
4. Все зависимости очищаются автоматически
5. Можно передавать аргументы в конструктор через массив: `[Class, arg1, arg2]`
