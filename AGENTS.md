# Full Clock - 全屏时钟

版本：v1.2.1 · 使用 umami 追踪。

## 框架

- **SvelteKit 2** + **Svelte 5**（runes 模式） + **Tailwind CSS 4**
- 静态适配器（`@sveltejs/adapter-static`），全预渲染导出
- i18n：**inlang/Paraglide JS**（策略：`url/cookie/baseLocale`）
- PWA：自定义 Service Worker（缓存优先）

## 目录结构

```
src/
├── routes/          # +layout.svelte, +page.svelte, about/+page.svelte
├── lib/
│   ├── components/  # Clock, SecondBar, TitleBar, Settings, ColorConfig, SyncSection
│   ├── *.svelte.ts  # 响应式状态 (preferences, tick, time, wake-lock)
│   └── *.ts         # 纯函数 (clock, format-time, title-bar, color-utils, time)
├── hooks.ts         # 路由钩子 (locale stripping)
└── hooks.server.ts  # 服务端钩子 (Paraglide 中间件)
```

## 数据流

四个模块级 `$state` 响应式模块：

| 模块 | 作用 |
|---|---|
| `tick.svelte.ts` | 每 100ms 更新 `now`，应用同步偏移 |
| `time.svelte.ts` | 服务端-本地时间偏移量 `syncedOffset` |
| `preferences.svelte.ts` | 用户偏好（背景、字体、格式等），持久化到 localStorage |
| `wake-lock.svelte.ts` | Screen Wake Lock API 状态 |

**诊断检查：** `pnpm svelte-kit sync; pnpm svelte-check --tsconfig ./tsconfig.json`

**测试：** `pnpm vitest run`

**架构决策：** [docs/adr/](./docs/adr/)
**领域术语：** [CONTEXT.md](./CONTEXT.md)
