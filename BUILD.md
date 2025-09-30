# Build Instructions

Руководство по сборке OpenNoution для разных платформ.

## Предварительные требования

- Node.js 18+
- npm или yarn

## Установка зависимостей

```bash
npm install
```

## Сборка для разработки

```bash
npm run dev
```

## Сборка для производства

### Сборка веб-версии

```bash
npm run build
```

Результат будет в папке `dist/`

### Windows

Собирает .exe установщик и portable версию:

```bash
npm run build:win
```

**Форматы:**
- NSIS Installer (x64, x86) - полноценный установщик
- Portable (x64) - портативная версия без установки

**Результат:** `dist-electron/`
- `OpenNoution Setup 0.0.1.exe` - установщик
- `OpenNoution 0.0.1.exe` - portable версия

### macOS

Собирает .dmg образ и .zip архив (Intel + Apple Silicon):

```bash
npm run build:mac
```

**Форматы:**
- DMG (x64, arm64) - образ диска для установки
- ZIP (x64, arm64) - архив приложения

**Результат:** `dist-electron/`
- `OpenNoution-0.0.1.dmg` - образ диска
- `OpenNoution-0.0.1-mac.zip` - архив

**Примечание:** Для сборки macOS приложения нужен macOS

### Linux

Собирает AppImage, deb и rpm пакеты:

```bash
npm run build:linux
```

**Форматы:**
- AppImage (x64) - универсальный формат
- DEB (x64) - для Debian/Ubuntu
- RPM (x64) - для Fedora/RHEL

**Результат:** `dist-electron/`
- `OpenNoution-0.0.1.AppImage` - AppImage
- `opennoution_0.0.1_amd64.deb` - DEB пакет
- `opennoution-0.0.1.x86_64.rpm` - RPM пакет

### Все платформы сразу

```bash
npm run build:all
```

**Внимание:** 
- Для сборки macOS нужен Mac
- Для сборки Windows лучше использовать Windows (или Wine на Linux)
- Linux можно собрать на любой платформе

## Структура релиза

После сборки в папке `dist-electron/` будут файлы:

```
dist-electron/
├── win-unpacked/              # Распакованная Windows версия
├── mac/                       # macOS приложение
├── linux-unpacked/            # Распакованная Linux версия
├── OpenNoution Setup 0.0.1.exe
├── OpenNoution 0.0.1.exe
├── OpenNoution-0.0.1.dmg
├── OpenNoution-0.0.1-mac.zip
├── OpenNoution-0.0.1.AppImage
├── opennoution_0.0.1_amd64.deb
├── opennoution-0.0.1.x86_64.rpm
└── latest.yml / latest-mac.yml / latest-linux.yml
```

## Загрузка на GitHub Releases

1. Соберите все версии:
```bash
npm run build:all
```

2. Перейдите в GitHub Releases
3. Создайте новый релиз с тегом `v0.0.1`
4. Загрузите файлы из `dist-electron/`:
   - Все .exe, .dmg, .AppImage, .deb, .rpm файлы
   - НЕ загружайте папки `-unpacked` и `mac/`

## Иконки приложения

Для правильной сборки нужны иконки:

- **Windows:** `public/icon.ico` (256x256)
- **macOS:** `public/icon.icns` (512x512)
- **Linux:** `public/icon.png` (512x512)

## Troubleshooting

### Ошибка "icon.ico not found"
Создайте иконку или удалите строку `"icon"` из `package.json`

### Ошибка при сборке для Mac на Windows
Это нормально. Для Mac нужен macOS. Используйте CI/CD (GitHub Actions)

### Долгая сборка
Первая сборка может занять 10-15 минут. Последующие будут быстрее.

## CI/CD с GitHub Actions

Можно автоматизировать сборку через GitHub Actions. Создайте `.github/workflows/build.yml`

## Размер приложения

Примерные размеры:
- Windows: ~150-200 MB
- macOS: ~170-220 MB  
- Linux: ~150-200 MB

Electron приложения большие из-за встроенного Chromium и Node.js.

## Оптимизация

Для уменьшения размера:
1. Включите asar архивацию (уже включено)
2. Используйте production build (уже используется)
3. Удалите неиспользуемые зависимости

---

**Готово!** Теперь можно собирать приложение для любой платформы! 🚀
