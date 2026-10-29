# Full Clock - 全屏时钟

版本：v1.3.1 · 使用 umami 追踪。

## 框架

- **SvelteKit 2** + **Svelte 5**（runes 模式） + **Tailwind CSS 4**
- 静态适配器（`@sveltejs/adapter-static`），全预渲染导出
- i18n：**inlang/Paraglide JS**（策略：`url/cookie/baseLocale`）
- PWA：自定义 Service Worker（缓存优先）
- 桌面端：**Tauri v2**（`src-tauri/`），复用同一份 `build/`；桌面构建关闭 Service Worker 注册

## 目录结构

```
src/
├── routes/          # +layout.svelte, +layout.ts, +page.svelte, about/+page.svelte
│   └── layout.css   # Tailwind CSS 入口
├── lib/
│   ├── components/  # Clock, SecondBar, TitleBar, Settings, ColorConfig, SyncSection, SyncBadge, SecondsModeDemo
│   ├── *.svelte.ts  # 响应式状态 (preferences, tick, sync-manager, wake-lock)
│   └── *.ts         # 纯函数及配置 (clock, format-time, title-bar, color-utils, time, platform, preferences, version)
├── hooks.ts         # 路由钩子 (locale stripping)
├── hooks.server.ts  # 服务端钩子 (Paraglide 中间件)
├── service-worker.ts # 自定义 Service Worker (缓存优先)
└── app.html         # 应用 HTML 模板（含 i18n 语言检测 IIFE）
src-tauri/           # Tauri v2 桌面壳（Rust + tauri.conf.json + main.rs 的 ntp_query）
```

## 数据流

五个模块级 `$state` 响应式模块：

| 模块                      | 作用                                                  |
| ------------------------- | ----------------------------------------------------- |
| `tick.svelte.ts`          | 每 100ms 更新 `now`，应用同步偏移                     |
| `sync-manager.svelte.ts`  | 同步状态机：syncMode/syncStatus/syncedOffset          |
| `preferences.svelte.ts`   | 用户偏好（背景、字体、格式等），持久化到 localStorage |
| `wake-lock.svelte.ts`     | Screen Wake Lock API 状态                             |

**诊断检查：** `pnpm svelte-kit sync; pnpm svelte-check --tsconfig ./tsconfig.json`

**测试：** `pnpm vitest run`（单元测试），`pnpm test:e2e`（E2E Playwright 测试，需先构建）

**桌面端：** `pnpm tauri dev`（开发窗），`pnpm tauri build`（出 NSIS 安装包 + 便携 exe）；桌面构建由 Tauri CLI 注入 `TAURI_ENV_PLATFORM` 自动关闭 SW 注册，web 构建不受影响。

**版本：** `package.json`、`src/lib/version.ts`、`src-tauri/Cargo.toml` 三处一致（`version-sync.test.ts` 守卫）；`tauri.conf.json` 不写 `version`，由 Tauri 读 Cargo.toml。

**架构决策：** [docs/adr/](./docs/adr/)（桌面端见 [0004](docs/adr/0004-tauri-desktop-distribution.md)）
**领域术语：** [CONTEXT.md](./CONTEXT.md)
