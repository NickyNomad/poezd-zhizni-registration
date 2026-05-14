# Поезд жизни · локальная сборка сайта регистрации

Одностраничный сайт на React + Vite для локального тестирования. Логотипы и изображения взяты из архива «Москва — город мастеров.zip» без перерисовки и без изменения исходных файлов.

## Что внутри

```txt
public/brand/mm-logo-full.jpg
public/brand/mm-logo-outline.jpg
public/brand/mm-logo-white.png
public/brand/mm-pattern-logo.png
public/brand/mm-main.jpg
public/brand/mm-main-2.jpg
public/fonts/README.txt
scripts/copy-fonts-from-archive.mjs
src/App.jsx
src/styles.css
src/validation.js
src/validation.test.mjs
```

## Шрифты

CSS уже настроен на фирменные шрифты:

```txt
Oldtimer.ttf
GolosText-Regular.ttf
GolosText-Medium.ttf
GolosText-SemiBold.ttf
GolosText-Bold.ttf
GolosText-Black.ttf
```

Поместите их из исходного архива в:

```txt
public/fonts/
```

Или скопируйте автоматически из локального архива:

```bash
npm run copy-fonts -- "../Москва — город мастеров.zip"
```

После этого сайт будет использовать:

```txt
Oldtimer — для крупных фирменных заголовков
Golos Text — для основного текста, формы и интерфейса
```

## Как запустить

1. Установить Node.js 20 LTS или новее.
2. Открыть папку проекта в терминале.
3. Выполнить:

```bash
npm install
npm run dev
```

4. Открыть адрес из терминала, обычно:

```txt
http://127.0.0.1:5173/
```

## Проверка валидации формы

```bash
npm test
```

## Продакшен-сборка

```bash
npm run build
npm run preview
```

## Что уже работает

- адаптивная верстка под телефон и desktop;
- оригинальный логотип из архива;
- оригинальный паттерн из архива;
- подключение фирменных шрифтов через `@font-face`;
- форма регистрации: ФИО, должность, организация, email, телефон;
- чекбокс согласия на обработку персональных данных;
- фронтовая валидация;
- вывод payload в консоль после успешной отправки.

## Что подключается следующим этапом

Сейчас форма работает только на фронте и выводит данные в `console.log`. Следующий шаг:

```txt
форма → API → Google Таблица → письмо подтверждения пользователю
```


## Важно про Node.js 20.11.0

В этой версии проекта зависимости зафиксированы на Vite 5.4.14, чтобы проект запускался на Node.js 20.11.0.
Не меняйте версии в package.json на `latest`, иначе может установиться Vite 8/Rolldown и появится ошибка `Cannot find native binding` или требование Node.js 20.19+.

Если ранее уже запускали `npm install` и появилась ошибка Rolldown, очистите старые зависимости:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm.cmd install
npm.cmd run dev
```

Если работаете в CMD:

```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
npm run dev
```
