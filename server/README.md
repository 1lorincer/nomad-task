# Установка зависимостей
```bash
npm install
```
# Запуск
```bash
npm run dev
```

# Запуск миграций
```bash
npm run migrate
```

# Откатить последнюю миграцию
```bash
npm run migrate:undo
```

### пример env
```dotenv
PORT=7070
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=nomad_task
DB_USER=postgres
DB_PASS=password

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```