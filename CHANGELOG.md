# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [0.2.0] - 2025-05-02

### Added

- 增加 PWA 支持（离线缓存、可安装）
- 增加时间同步功能（通过网络 API 自动校准系统时钟偏差）
- 增加国际化支持（中/英文，基于 Paraglide + inlang）
- 增加屏幕常亮（Wake Lock）功能
- 增加进度条透明度设置

### Changed

- 从 Vue 3 重构为 Svelte 5 + SvelteKit
- 从 CSS/SCSS 样式迁移至 Tailwind CSS
- UI 样式整体优化
- favicon 从 .ico 换为 .png

### Fixed

- 修复关于页面国际化缺失
- 修复 Range track 可见性问题
- 修复 Radio 按钮样式
- 修复时间同步阈值判断

## [0.1.2] - 2024-01-13

### Changed

- 美化关于界面

### Fixed

- 修理了调色盘界面打开时内存泄漏卡死的问题，暂时改用文本输入

## [0.1.1] - 2024-01-13

### Added

- 增加调色板预设颜色
- 增加 README 文档

### Changed

- 更改设置界面样式
- 更改了默认进度条颜色配置

### Fixed

- 修复了调色板无法访问的问题

## [0.1.0] - 2024-01-13

### Added

- 增加设置功能

### Changed

- 增加上方标题功能栏

<!-- Links -->

[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->

[0.1.0]: https://github.com/cup113/full-clock/releases/v0.1.0
[0.1.1]: https://github.com/cup113/full-clock/compare/v0.1.0..v0.1.1
[0.2.0]: https://github.com/cup113/full-clock/compare/v0.1.2..v0.2.0
[0.1.2]: https://github.com/cup113/full-clock/compare/v0.1.1..v0.1.2
