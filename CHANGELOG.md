# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [1.3.1] - 2026-05-29

### Fixed

- TitleBar SyncBadge 旋转动画失效（Svelte 5 `@keyframes` 作用域与内联 style 冲突），改用 Tailwind `animate-spin`
- 同步中 Settings 内旋转边框同样问题一并修复
- 多余 `@keyframes spin` 定义清理

### Changed

- 默认同步模式从 `auto` 改为 `manual`，避免新用户首次加载时出现网络错误提示
- About 页面时间校准说明：统一列出三个供应商（新增 timeapi.io），分行重组，RTT 概念自然引出
- Clock 垂直偏移量 `-24px` → `-1.5rem`

### Added

- `sync-manager.svelte.ts` 单元测试（15 个用例，覆盖 setMode/sync/clearSync 全路径）

## [1.3.0] - 2026-05-29

### Added

- 并行多提供者时间同步（逆方差加权平均，1.5s 超时）
- 三模式同步选择器（自动/手动/关闭），持久化到 localStorage
- 标题栏同步状态图标（SyncBadge）：形状编码，无硬编码颜色
- 字体感知的时钟缩放（Canvas measureText），新增 Arial 字体选项
- E2E 测试：时钟数字在视口内适配
- i18n 消息：syncSyncing, syncNow, syncIdle, syncLatest, syncFailed, syncMode\_\*

### Changed

- 时间同步重构：从 `time.svelte.ts` 提取到 `sync-manager.svelte.ts`
- SyncSection 从属性驱动改为直接读取 sync-manager 状态
- 移除用户确认流程：同步结果始终自动应用
- 移除 NEGLIGIBLE_THRESHOLD 和 unreliable 概念
- TitleBar 布局从 `absolute` 改为 `flex`，移除 `pointer-events-none` 包装
- SyncBadge 使用 paraglide i18n 替代硬编码中文
- AGENTS.md 补充 E2E 测试命令

### Fixed

- 切换自动模式时不再重复触发 sync
- E2E 测试选择器限定到 `.flex-1` 容器，避免匹配标题栏
- SyncSection 合并重复 import

## [1.2.4] - 2026-05-26

### Fixed

- 修复设置持久化错误
- 关于页面链接使用主题色透明度

### Changed

- 升级至 1.2.4

## [1.2.3] - 2026-05-25

### Added

- locale 偏好持久化（localStorage），防抖保存
- Vitest 覆盖率配置
- 中文/英文双语 README，附带截图

### Changed

- 升级至 1.2.3

## [1.2.2] - 2026-05-22

### Changed

- 升级至 1.2.2
- 简化 TitleBar 标题渲染；移除已废弃的 `AGENTS-svelte5.md`

## [1.2.1] - 2026-05-17

### Changed

- 升级至 1.2.1

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
[1.3.1]: https://github.com/cup113/full-clock/compare/v1.3.0..v1.3.1
[1.3.0]: https://github.com/cup113/full-clock/compare/v1.2.4..v1.3.0
[1.2.4]: https://github.com/cup113/full-clock/compare/v1.2.3..v1.2.4
[1.2.3]: https://github.com/cup113/full-clock/compare/v1.2.2..v1.2.3
[1.2.2]: https://github.com/cup113/full-clock/compare/v1.2.1..v1.2.2
[1.2.1]: https://github.com/cup113/full-clock/compare/v1.2.0..v1.2.1
[1.0.2]: https://github.com/cup113/full-clock/compare/v1.0.0..v1.0.2
