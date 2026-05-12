# Full Clock - 全屏时钟

本项目使用 umami 追踪。

若任务涉及 Svelte 5 代码，请参阅：[AGENTS-svelte5.md](./AGENTS-svelte5.md)

由于 Svelte 工具有命令行难以中止的问题，检查诊断时请用：`pnpm svelte-kit sync; pnpm svelte-check --tsconfig ./tsconfig.json`

当前版本：v1.2.0

## 架构决策

### PWA / Service Worker

使用 SvelteKit 原生 `$service-worker` 模块，而非 `vite-plugin-pwa`。原因：

1. `vite-plugin-pwa` 在 Vite build 阶段运行 Workbox，此时 SvelteKit 适配器尚未生成预渲染 HTML 文件 → `index.html` 等无法被 precache → `non-precached-url` 报错
2. `$service-worker` 模块的 `prerendered` 数组包含所有预渲染 HTML 路径，在构建完成后才填充 → 所有页面可被缓存
3. 自定义 SW 约 1.3KB，无 Workbox 运行时（原 ~5KB + workbox-*.js）

更新策略：SW 安装后进入等待状态，`+page.svelte` 检测 `reg.waiting` 显示更新提示，用户确认后发送 `SKIP_WAITING` 消息。

详见：`src/service-worker.ts`、`src/routes/+page.svelte` 的 `applySWUpdate`。

### 代码拆包

不使用 `bundleStrategy: 'single'`。SvelteKit 默认按路由拆包，首屏只需加载 layout + page 所需 chunk，Settings/About 按需加载。
