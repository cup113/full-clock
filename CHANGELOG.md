# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [1.2.0] - 2026-05-12

### Changed

- 升级至 1.2.0

## [1.1.1] - 2026-05-12

### Changed

- 移除 `vite-plugin-pwa` 依赖，改用 SvelteKit 原生 `$service-worker` 模块
- 移除 `bundleStrategy: 'single'`，改为默认按路由拆包
- 静态 `manifest.webmanifest` 移至 `static/` 目录

### Added

- `src/service-worker.ts`：自定义 SW，利用 `$service-worker` 的 `prerendered` 数组缓存所有预渲染 HTML
- `app.html` 内联语言检测脚本（零闪烁，尊重 `PARAGLIDE_LOCALE` cookie）
- PWA 更新提示按钮（用户确认后才激活新 SW）

### Fixed

- 修复 `non-precached-url` 缓存报错
- 修复新构建后 PWA 首屏加载缓慢的问题
- 修复中文用户首次访问时先显示英文再切换的闪烁问题

## [1.1.0] - 2026-05-11

### Added

- 主时钟 AM/PM + 数字秒采用纵向右对齐布局，对齐视觉优化
- 网络时间同步误差 <500ms 自动应用，体验简化
- 字体切换自动重算大小，12h 模式缩放算法修正
- 设置界面增加版本号显示
- ResizeObserver 防抖 200ms + 字体过渡动画
- Settings Preview 固定时间 19:02:34，放大预览尺寸
- Settings Preview 进度条模拟三种真实定位
- README/AGENTS 文档更新

### Changed

- 移除 Second Font Size 配置（尚未发布，无需迁移）
- Bar 位置/透明度子配置改为始终纵向

### Fixed

- 取消 300ms 精度阈值，统一为 500ms

## [1.0.2] - 2026-05-07

### Changed

- 升级至 1.0.2

## [1.0.1] - 2026-05-07

### Changed

- 升级至 1.0.1

## [1.0.0] - 2026-05-07

### Added

- 增加 Vitest 单元测试，提取纯函数提高可测试性
- 增加 SEO meta 标签和站点描述（国际化）

### Changed

- 移至 1.0.0 正式版

## [0.2.1] - 2025-05-03

### Added

- 将屏幕常亮（Wake Lock）移至设置面板

### Changed

- 改进时间同步的用户体验

### Fixed

- 替换弃用的 Apple meta 标签
- 添加 locale 预渲染条目
- 单 bundle 输出、Workbox navigateFallback 配置

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
[0.2.1]: https://github.com/cup113/full-clock/compare/v0.2.0..v0.2.1
[1.0.0]: https://github.com/cup113/full-clock/compare/v0.2.1..v1.0.0
[1.0.1]: https://github.com/cup113/full-clock/compare/v1.0.0..v1.0.1
[1.1.1]: https://github.com/cup113/full-clock/compare/v1.1.0..v1.1.1
[1.2.0]: https://github.com/cup113/full-clock/compare/v1.1.1..v1.2.0

[1.0.2]: https://github.com/cup113/full-clock/compare/v1.0.0..v1.0.2
