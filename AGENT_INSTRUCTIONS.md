# Инструкция для агента: Миграция сайта CDEK с Tilda на чистый браузерный код

## Общее описание проекта

Это статический сайт логистической компании CDEK (sdek.mi), изначально созданный на платформе Tilda Publishing и экспортированный в HTML. Сайт подготовлен для деплоя на GitHub Pages (есть `.nojekyll`). Задача — **переделать код под обычный браузерный HTML/CSS/JS** и **исправить нерабочую верстку**.

---

## Структура проекта

```
/
├── index.html          — Главная страница (461 строк, ~834KB из-за инлайн-стилей)
├── calculator.html     — Калькулятор стоимости доставки (1505 строк)
├── map.html            — Карта пунктов выдачи (637 строк)
├── tracking.html       — Отслеживание посылок (879 строк)
├── .nojekyll           — Маркер для GitHub Pages
└── assets/             — Все ресурсы (88 файлов)
    ├── CSS (9 файлов): css2.css, css2-1.css, 7 файлов tilda-*.min.css
    ├── JS (23 файла): jquery-1.10.2.min.js, 17 файлов tilda-*.min.js, и др.
    └── Изображения (55 файлов): PNG, JPG, SVG
```

## Навигация между страницами

Все 4 страницы ссылаются друг на друга:
- `index.html` — главная
- `calculator.html` — калькулятор
- `map.html` — карта
- `tracking.html` — отслеживание

Каждая страница содержит одинаковый **header** (блок `rec349251129` / `rec525870457`) и **footer** (блок `rec349265386`). Header и footer дублируются целиком в каждом файле.

---

## Что нужно сделать: Пошаговый план

### ЭТАП 1: Анализ и подготовка

1. **Открой каждую HTML-страницу в браузере** и зафиксируй, что именно не работает в верстке (скриншоты или описание). Типичные проблемы Tilda-экспорта:
   - Блоки могут наезжать друг на друга
   - Адаптивность может быть сломана (мобильная версия)
   - Анимации не запускаются без Tilda JS-рантайма
   - Формы не отправляются (endpoint `forms.tildacdn.com` недоступен)
   - Меню может не открываться/закрываться

### ЭТАП 2: Удаление Tilda-инфраструктуры

#### 2.1. Удалить Tilda JS-файлы (из assets/ и из HTML)

Эти файлы — рантайм Tilda, который **не работает** вне платформы. Удалить из `assets/` и убрать все `<script>` ссылки на них из каждого HTML:

```
tilda-polyfill-1.0.min.js      — полифиллы Tilda (заменить на современный полифилл если нужно)
tilda-fallback-1.0.min.js      — фоллбеки Tilda
tilda-zero-1.1.min.js          — ядро Tilda zero-блоков
tilda-scripts-3.0.min.js       — основной движок Tilda
tilda-menu-1.0.min.js          — меню Tilda (ЗАМЕНИТЬ своим JS для меню)
tilda-skiplink-1.0.min.js      — skip links (переписать 3 строки на vanilla JS)
tilda-events-1.0.min.js        — система событий Tilda
tilda-animation-2.0.min.js     — анимации (ЗАМЕНИТЬ на CSS-анимации или IntersectionObserver)
tilda-animation-sbs-1.0.min.js — анимации side-by-side (ЗАМЕНИТЬ)
tilda-forms-1.0.min.js         — формы Tilda (ЗАМЕНИТЬ своей обработкой форм)
tilda-zero-forms-1.0.min.js    — zero-формы Tilda (ЗАМЕНИТЬ)
tilda-phone-mask-1.1.min.js    — маска телефона (ЗАМЕНИТЬ на IMask или Cleave.js)
tilda-popup-1.0.min.js         — попапы (ЗАМЕНИТЬ на свой модальный JS)
tilda-stat-1.0.min.js          — статистика Tilda (УДАЛИТЬ, не нужна)
tilda-variant-select-1.0.min.js — вариантный селект (УДАЛИТЬ если не используется)
tilda-zero-scale-1.0.min.js    — масштабирование (УДАЛИТЬ)
tilda-blocks-page21614815.min.js — скомпилированный код страницы (ИЗУЧИТЬ что делает, переписать нужное)
uploadcare-3.x.min.js          — загрузка файлов (УДАЛИТЬ если формы не нужны)
tag_phono.js                   — кастомный скрипт ~40KB (ИЗУЧИТЬ — может быть нужен)
watch.js                       — Яндекс.Метрика (ОСТАВИТЬ если нужна аналитика)
```

**ОСТАВИТЬ:**
- `jquery-1.10.2.min.js` — используется в калькуляторе и hover-эффектах (позже можно мигрировать на vanilla JS)
- `scrollbooster.min.js` — scroll enhancement
- `watch.js` — Яндекс.Метрика (если нужна)

#### 2.2. Удалить Tilda CSS-файлы

```
tilda-animation-2.0.min.css        — стили анимаций (перенести нужное в свой CSS)
tilda-forms-1.0.min.css            — стили форм (~44KB, перенести нужное)
tilda-grid-3.0.min.css             — грид-система (~4.5KB, ЗАМЕНИТЬ на CSS Grid/Flexbox)
tilda-popup-1.1.min.css            — стили попапов
tilda-zero-form-errorbox.min.css   — стили ошибок форм
tilda-zero-form-horizontal.min.css — горизонтальные формы
tilda-blocks-page21614815.min.css  — скомпилированные стили страницы (~42KB, КРИТИЧЕСКИЙ)
```

**ОСТАВИТЬ и адаптировать:**
- `css2.css` и `css2-1.css` — кастомные стили + Google Fonts (Roboto). Проверить что внутри, оставить нужное.

#### 2.3. Удалить Tilda data-атрибуты из HTML

Найти и удалить из всех 4 HTML-файлов:
```
data-tilda-project-id="4393332"
data-tilda-page-id="..."
data-tilda-page-alias="..."
data-tilda-formskey="..."
data-tilda-root-zone="com"
data-tilda-project-headcode="yes"
data-tilda-ts="y"
data-tilda-project-country="RU"
data-tilda-cookie-type="..."
data-tilda-req="..."
data-tilda-rule="..."
data-tilda-rule-minlength="..."
data-tilda-sign="..."
data-tilda-mode="..."
data-hook="blocks-collection-content-node"
data-record-type="..."
data-animationappear="..."
```

Также удалить Tilda-специфичные классы и заменить на семантические:
```
.t-body          → body (без класса или свой)
.t-records       → .sections / .content
.t-rec           → .section / .block  
.t-container     → .container
.t-container_100 → .container-full
.t-col           → использовать CSS Grid
.t-width         → убрать, использовать CSS
.t-prefix_*      → убрать (это Tilda грид отступы)
.t-screenmin-*   → использовать @media
.t-screenmax-*   → использовать @media
.t-text_md/sm    → свои классы типографики
.t-align_center  → text-align: center
.t-btnflex__text → .btn-text
```

### ЭТАП 3: Переписать HTML-структуру

#### 3.1. Создать общий layout

Каждый HTML файл сейчас — это монолитная каша из инлайн-стилей. Нужно:

1. **Вынести общие стили** в один файл `assets/styles.css`
2. **Вынести инлайн `<style>` блоки** из HTML в CSS-файл
3. **Очистить `<head>`** — убрать огромные инлайн стили (строки 1-170 в index.html — это всё инлайн CSS от Tilda)
4. **Сделать читаемую структуру** `<header>`, `<main>`, `<footer>` вместо вложенных `<div>` с ID типа `rec349251129`

#### 3.2. Структура каждой страницы (целевая)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CDEK — ...</title>
    <link rel="stylesheet" href="./assets/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
    <header><!-- навигация --></header>
    <main><!-- контент страницы --></main>
    <footer><!-- подвал --></footer>
    <script src="./assets/main.js"></script>
</body>
</html>
```

### ЭТАП 4: Переписать ключевые компоненты

#### 4.1. Header / Навигация

Сейчас header — это Tilda блок типа 396 (Zero Block) с абсолютным позиционированием элементов. Это нужно переверстать в нормальный `<nav>` с flexbox.

Элементы хедера:
- Логотип CDEK (изображение `cdek-logo.jpg` или `cdek-white-logo.png`)
- Навигационные ссылки: Главная, Калькулятор, Карта, Отслеживание
- Возможно мобильное меню (бургер)

CSS-классы хедера сейчас: `.uc-top-menu`, `.uc-left-menu`, `.uc-header`, `.uc-bg-menu`

#### 4.2. Footer

Footer — блок типа 898 (rec349265386) с контактной информацией и ссылками. CSS-класс: `.uc-footer-green`

#### 4.3. Формы (index.html)

В index.html есть форма обратной связи с Tilda form processing:
- Отправка шла на `https://forms.tildacdn.com/procces/` — **НЕ РАБОТАЕТ** вне Tilda
- Используются классы: `.js-form-proccess`, `.js-errorbox-all`, `.js-successbox`
- Маска телефона: `.js-phonemask-result-iso`
- **Нужно:** переписать на свой form handler (или использовать Formspree/EmailJS если нужна реальная отправка)

#### 4.4. Калькулятор (calculator.html)

Самая сложная страница. Содержит:
- jQuery UI (1.13.2) для автокомплита городов
- AJAX-запросы к CDEK API: `https://api.cdek.me/service.php`
- Альтернативный API: `https://sdekdogovor.ru/ajax/calc`
- Иконка статуса: `https://api.cdek.me/img/icon/check-mark.svg`
- Кастомная форма расчета стоимости

**ВАЖНО:** Кастомный JS калькулятора (инлайн в HTML, строки ~300-1470) — это рабочий код, который нужно СОХРАНИТЬ и вынести в отдельный файл `assets/calculator.js`. Этот код НЕ зависит от Tilda рантайма, только от jQuery.

#### 4.5. Карта (map.html)

Содержит:
- Yandex Maps API: `https://api-maps.yandex.ru/2.1/`
- CDEK API для пунктов выдачи: `https://api.cdek.ru/v2/deliverypoints`
- CDEK Widget: `https://widget.cdek.ru/widget/scripts/service.php` и `style.css`

**ВАЖНО:** Код карты (инлайн JS) нужно вынести в `assets/map.js`. Зависит от Yandex Maps API и CDEK API — эти внешние зависимости оставить.

#### 4.6. Отслеживание (tracking.html)

Содержит:
- CDEK Tracking API: `https://api.cdek.me/info/proxy.php`
- CDEK Tracking CSS: `https://api.cdek.me/info/style.css`

**ВАЖНО:** Код трекинга вынести в `assets/tracking.js`.

### ЭТАП 5: Написать новый CSS

#### 5.1. Система стилей

Создать `assets/styles.css` со следующей структурой:

```css
/* Reset / Normalize */
/* Переменные (цвета CDEK: зеленый #00b33c, белый, черный) */
/* Типографика (Roboto) */
/* Layout (контейнеры, грид) */
/* Header */
/* Footer */
/* Компоненты (кнопки, карточки, формы) */
/* Страница: Главная */
/* Страница: Калькулятор */
/* Страница: Карта */
/* Страница: Отслеживание */
/* Адаптивность (@media) */
```

#### 5.2. Breakpoints

Tilda использовала свои breakpoints. Заменить на стандартные:
```
Tilda: 1200px, 980px, 640px, 480px
Заменить: 1200px, 992px, 768px, 576px (или оставить оригинальные если верстка под них)
```

### ЭТАП 6: Написать новый JS

Создать `assets/main.js` с:
- Мобильное меню (бургер)
- Анимации при скролле (IntersectionObserver вместо Tilda animation engine)
- Обработка форм (если нужна)
- Маска телефона (если нужна)

### ЭТАП 7: Очистка

1. Удалить неиспользуемые файлы из `assets/`:
   - Все `tilda-*.min.js` файлы (17 штук)
   - Все `tilda-*.min.css` файлы (7 штук)
   - `uploadcare-3.x.min.js`
   - `tag_phono.js` (если после анализа не нужен)
2. Удалить дублирующиеся изображения: `cdek-logo.jpg`, `cdek-logo(1).jpg`, `cdek-logo(2).jpg` — оставить одно
3. Проверить что все пути к ресурсам работают после переименований

---

## Критические замечания

### Инлайн-стили
Каждый HTML файл содержит ОГРОМНОЕ количество инлайн CSS (в `<style>` тегах и в `style=""` атрибутах). Например, в index.html строки 1-170 — это почти целиком инлайн CSS. Не пытайся "очистить" каждый стиль по отдельности — лучше:
1. Визуально определи что должно остаться (как выглядит в браузере)
2. Перепиши верстку с нуля используя флексбокс/грид
3. Сохрани конкретные значения (цвета, размеры, отступы) из оригинала

### Zero Blocks (T396)
Tilda Zero Blocks используют абсолютное позиционирование (`top`, `left`, `width`, `height` в пикселях) для каждого элемента. Это основная причина сломанной верстки. Классы:
- `.t396__artboard` — канвас блока с фиксированной высотой
- `.t396__filter` — фильтр/оверлей
- `.t396__carrier` — фоновое изображение
- `.tn-elem` — абсолютно позиционированный элемент
- `data-elem-id` — ID элемента внутри Zero Block

**Эти блоки нужно полностью переверстать** с flexbox/grid, убрав абсолютное позиционирование.

### Анимации
Инлайн `@keyframes` определения (строки 32-155 в index.html) — это SBS (side-by-side) анимации Tilda. Каждая привязана к конкретному `data-elem-id`. Варианты:
- Убрать анимации совсем (самый быстрый путь)
- Переписать на CSS transitions + IntersectionObserver (среднее)
- Использовать библиотеку типа AOS (самое простое для "появления" элементов)

### jQuery
jQuery 1.10.2 (2013 год) — устаревший. Но калькулятор (calculator.html) сильно от него зависит. Варианты:
- Оставить jQuery пока, мигрировать калькулятор позже
- Обновить до jQuery 3.x (минимальные изменения)
- Переписать на vanilla JS (больше работы, но чище)

### Внешние API (НЕ ТРОГАТЬ)
Эти внешние зависимости работают и должны остаться:
- `https://api.cdek.me/service.php` — API калькулятора
- `https://api.cdek.ru/v2/deliverypoints` — API пунктов выдачи
- `https://api-maps.yandex.ru/2.1/` — Yandex Maps
- `https://api.cdek.me/info/proxy.php` — API трекинга
- `https://widget.cdek.ru/widget/scripts/` — CDEK виджет
- `https://sdekdogovor.ru/ajax/calc` — альтернативный калькулятор

### Шрифты
Используются:
- **Roboto** (Google Fonts) — основной шрифт, подключается через CSS файлы `css2.css` и `css2-1.css`
- **FuturaPT** (Book, Bold, ExtraBold) — загружается с `static.tildacdn.com` (WOFF файлы). После миграции этот шрифт станет недоступен! Нужно либо найти альтернативу, либо скачать и положить локально в `assets/fonts/`

---

## Порядок работы (рекомендация)

1. Начни с **index.html** — это главная страница, на ней видны основные проблемы
2. Сначала сделай header + footer, так как они общие для всех страниц
3. Затем переделай контентную часть index.html
4. Далее по очереди: tracking.html (проще), map.html (средне), calculator.html (сложнее всего)
5. В конце — удаление неиспользуемых файлов из assets/

---

## Файлы для анализа в первую очередь

| Файл | Зачем смотреть |
|------|----------------|
| `index.html` строки 174-460 | Основная структура body, header, контент, footer |
| `calculator.html` строки 300-1470 | Кастомный JS калькулятора (вынести в отдельный файл) |
| `map.html` строки 300-600 | Кастомный JS карты |
| `tracking.html` строки 300-850 | Кастомный JS трекинга |
| `assets/tilda-blocks-page21614815.min.css` | Скомпилированные стили — нужно извлечь актуальные |
| `assets/css2.css` и `css2-1.css` | Кастомные стили + шрифты |
