# Проект на AdonisJS

Этот проект использует фреймворк [AdonisJS](https://adonisjs.com/) — современный MVC-фреймворк для Node.js, который обеспечивает удобную структуру кода, встроенный IoC-контейнер, ORM и многие другие полезные инструменты для быстрой разработки.

## Требования

- Node.js (рекомендуется версия LTS)
- MySQL-сервер (если планируется работа с базой данных)

## Установка и настройка

1. **Клонирование репозитория:**  
   Склонируйте проект из Git:
   ```bash
   git clone git@github.com:ShepelevIA/lerningPlatform.git
   ```
   или
   ```bash
   git clone https://github.com/ShepelevIA/lerningPlatform.git
   ```

   После клонирования перейдите на ветку с проектом backend:
   ```bash
   git checkout backend/develop
   ```

2. **Установка зависимостей:**  
   Установите необходимые зависимости:
   ```bash
   npm install
   ```
   или
   ```bash
   yarn install
   ```

3. **Конфигурация окружения:**  
   Создайте файл `.env` в корневой директории проекта (на одном уровне с `package.json`) и укажите в нем следующие переменные окружения:
   ```env
   NODE_ENV=development
   PORT=3333
   APP_KEY=your_app_key_here
   HOST=127.0.0.1
   LOG_LEVEL=info

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_DATABASE=your_database_name
   ```

   **Примечания:**
   - `APP_KEY` — это ключ приложения, используемый для шифрования. Его можно сгенерировать командой:  
     ```bash
     node ace generate:key
     ```
     Скопируйте сгенерированный ключ в `.env`.
   - `DB_USER`, `DB_PASSWORD` и `DB_DATABASE` должны соответствовать вашим реальным настройкам MySQL.

4. **Запуск приложения:**
   Вы можете запустить сервер следующими способами:
   ```bash
   node ace serve --watch
   ```
   или  
   ```bash
   npm run serve
   ```
   
   По умолчанию приложение будет доступно по адресу [http://127.0.0.1:3333](http://127.0.0.1:3333).

## Дополнительная информация

- Официальная документация AdonisJS: [https://docs.adonisjs.com/](https://docs.adonisjs.com/)  
- Если в процессе запуска вы видите ошибки валидации переменных окружения (`EnvValidationException`), убедитесь, что все переменные, указанные в `.env`, соответствуют тем, что необходимы в `config/database.ts` и `start/env.ts`.