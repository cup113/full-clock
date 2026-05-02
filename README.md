# Full Clock - 全屏时钟

![Version](https://img.shields.io/github/package-json/v/cup113/full-clock/main)
![Repo size](https://img.shields.io/github/repo-size/cup113/full-clock)
![License](https://img.shields.io/github/license/cup113/full-clock)

> 全屏时钟是一个纯净无广告的电子时钟，支持全屏显示，可配置性强。支持切换显示秒、背景进度条、标题、日期等，支持修改颜色与字体，适合用于考试电脑显示。
>
> 该项目使用 [Svelte 5](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/) 构建，UI 基于 [Tailwind CSS](https://tailwindcss.com/)，国际化使用 [inlang](https://inlang.com/) + [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)，PWA 使用 [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)。
>
> 本项目是[时钟](https://github.com/cup113/clock)的重构升级版。

## 界面介绍

### 主界面

- 中央：显示时间
- 左上角：设置、屏幕常亮、关于按钮
- 右上角：语言切换、全屏按钮
- 正上方：标题（日期/自定义内容/关闭）

### 设置界面

模态弹窗，包含以下设置分类：

1. **秒钟样式** — 全屏长条、顶部长条、数字显示、关闭
2. **标题样式** — 日期、自定义、关闭
3. **颜色** — 背景色、字体色、进度条色
4. **字体** — font-family 设置
5. **时间同步** — 自动校准系统时钟偏差
6. **语言** — 中文 / English

## 使用方法

1. 首次使用，点击左上角"设置"按钮，进行个性化设置。
2. 设置完成后，点击"关闭"按钮或点击弹窗外侧返回主界面。
3. 点击右上角"全屏"按钮，可以切换全屏显示。
4. 支持切换中/英文界面。

## 特性

- 大屏显示时间（自动适配窗口尺寸）
- 多种秒钟显示样式（进度条、数字、关闭）
- 标题栏支持日期/自定义文字/关闭
- 支持自定义颜色（背景、字体、进度条）
- 支持自定义字体
- 全屏/退出全屏
- 屏幕常亮（Wake Lock）
- 时间同步（自动校准系统时钟偏差）
- 国际化（中文/English）
- PWA 支持（离线访问、可安装）
- 跨平台
