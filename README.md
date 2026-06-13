# Hotel Booking System API

Система управления бронированием отелей с рекомендательной системой

## Функциональность

### Основные возможности
-  **Аутентификация и авторизация** (JWT токены)
-  **Управление пользователями** (регистрация, профиль, смена пароля)
-  **Управление бронированиями** (CRUD операции)
-  **Поиск и фильтрация** (по дате, локации, цене, статусу)
-  **Пагинация** списка бронирований
-  **Подтверждение и отмена бронирований**

### ИИ-функции
-  **Рекомендательная система** на основе просмотров пользователей
-  **Похожие предложения** для каждого бронирования
-  **Персональные рекомендации** с объяснением причин

### Административные функции
-  **Личный кабинет управляющего** (менеджер/админ)
-  **Статистика** бронирований (финансы, топ локации, активность пользователей)
-  **Управление пользователями** (блокировка, изменение ролей)
-  **Управление всеми бронированиями**

## Технологии

- **FastAPI** - веб-фреймворк
- **PostgreSQL** - база данных
- **SQLAlchemy** - ORM
- **Alembic** - миграции
- **JWT** - аутентификация
- **scikit-learn** - машинное обучение для рекомендаций
- **Docker** - контейнеризация

## Установка и запуск

### Предварительные требования
- Docker
- Docker Compose

### Быстрый старт

```bash
# Клонировать репозиторий
git clone https://github.com/AlexandrKarpovich/HotelBooking.git
cd hotel-booking

# Скопировать файл с переменными окружения
cp .env.example .env

# Отредактировать .env (обязательно смените пароли!)
nano .env

# Запустить проект
docker compose up --build
```
После запуска API будет доступен по адресу: http://localhost:8000

## API Документация

После запуска доступны:

Swagger UI: http://localhost:8000/docs


## Основные эндпоинты

### Аутентификация (/auth)

| Метод | Эндпоинт | Описание |
|-------|----------|---------|
| POST | `/auth/register` | Регистрация пользователя |
| POST | `/auth/login` | Вход в систему (получение токенов) |
| POST | `/auth/refresh` | Обновление access токена |
| POST | `/auth/change-password` | Смена пароля |
| GET | `/auth/me` | Информация о текущем пользователе |

### Бронирования (/bookings)

| Метод | Эндпоинт | Описание |
|-------|----------|---------|
| POST | `/bookings/` | Создание бронирования |
| GET | `/bookings/` | Получение списка (пагинация, фильтры) |
| GET | `/bookings/{id}` | Детали бронирования |
| PUT | `/bookings/{id}` | Обновление бронирования |
| DELETE | `/bookings/{id}` | Удаление бронирования |
| POST | `/bookings/{id}/confirm` | Подтверждение |
| POST | `/bookings/{id}/cancel` | Отмена |
| POST | `/bookings/{id}/view` | Трекинг просмотра |
| GET | `/bookings/recommendations` | Персональные рекомендации |
| GET | `/bookings/{id}/similar` | Похожие предложения |

### Админ‑панель (/admin)

| Метод | Эндпоинт | Описание |
|-------|----------|---------|
| GET | `/admin/users` | Список всех пользователей |
| PUT | `/admin/users/{id}/role` | Изменение роли |
| PUT | `/admin/users/{id}/block` | Блокировка пользователя |
| PUT | `/admin/users/{id}/unblock` | Разблокировка |
| GET | `/admin/bookings` | Все бронирования |
| PUT | `/admin/bookings/{id}/status` | Изменение статуса |
| POST | `/admin/bookings/{id}/admin-confirm` | Подтверждение менеджером |
| GET | `/admin/statistics` | Статистика |


### 🧪 Примеры запросов
Регистрация пользователя
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepass123"
  }'
  ```
Вход в систему
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe", "password": "securepass123"}'
  ```
Создание бронирования
```bash
TOKEN="your_access_token"

curl -X POST http://localhost:8000/bookings/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Отличный отель в центре",
    "location": "Москва",
    "description": "Прекрасный отель с видом на город",
    "price_per_night": 5000,
    "check_in_date": "2025-06-01T14:00:00",
    "check_out_date": "2025-06-05T12:00:00",
    "guests_count": 2
  }'
```
Получение рекомендаций
```bash
curl -X GET "http://localhost:8000/bookings/recommendations?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```
Просмотр статистики (админ)
```bash
curl -X GET http://localhost:8000/admin/statistics \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## 👥 Роли пользователей
| Роль | Доступ |
|------|-------|
| user | Свои бронирования: просмотр, подтверждение, отмена |
| manager | Все бронирования, статистика, изменение статусов |
| admin | Все права менеджера + управление пользователями |


## 🔧 Управление проектом
Остановка
```bash
docker compose down
```
Просмотр логов
```bash
docker compose logs -f
```
Перезапуск
```bash
docker compose restart
```
Очистка (включая данные)
```bash
docker compose down -v
```
Пересобрать без использования кэша
```bash
docker compose build --no-cache
```
Запустить
```bash
docker compose up -d
```

📁 Структура проекта
```
hotel-booking/
├── backend/
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Layout/
    │   │   ├── Auth/
    │   │   ├── Bookings/
    │   │   ├── Admin/
    │   │   └── Common/
    │   ├── services/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── utils/
    │   └── App.js
    ├── package.json
    └── Dockerfile
```


фронт нужно отдельно запускать 
cd frontend
npm run dev