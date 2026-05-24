# Full Clock - 全屏时钟

![Version](https://img.shields.io/github/package-json/v/cup113/full-clock/main)
![Repo size](https://img.shields.io/github/repo-size/cup113/full-clock)
![License](https://img.shields.io/github/license/cup113/full-clock)

![Screenshot](./docs/home-page.png)

> Full Clock is a clean, ad-free digital clock designed for full-screen use. It supports toggling seconds display, background progress bars, titles, dates, custom colors and fonts — ideal for exam hall countdowns or information displays.
>
> 全屏时钟是一个纯净无广告的电子时钟，支持全屏显示，可配置性强。支持切换显示秒、背景进度条、标题、日期等，支持修改颜色与字体，适合用于考试电脑显示。
>
> Built with [Svelte 5](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/), styled with [Tailwind CSS](https://tailwindcss.com/), internationalized via [inlang](https://inlang.com/) + [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs), PWA powered by [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa).
>
> 该项目使用 [Svelte 5](https://svelte.dev/) + [SvelteKit](https://kit.svelte.dev/) 构建，UI 基于 [Tailwind CSS](https://tailwindcss.com/)，国际化使用 [inlang](https://inlang.com/) + [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)，PWA 使用 [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)。
>
> This project is a complete rewrite of the previous [clock](https://github.com/cup113/clock).
>
> 本项目是[时钟](https://github.com/cup113/clock)的重构升级版。

## Interface / 界面介绍

### Main Screen / 主界面

- **Center / 中央**: Time display / 显示时间
- **Top-left / 左上角**: Settings, Wake Lock, About buttons / 设置、屏幕常亮、关于按钮
- **Top-right / 右上角**: Language switch, Fullscreen button / 语言切换、全屏按钮
- **Top bar / 正上方**: Title (date / custom text / off) / 标题（日期/自定义内容/关闭）

### Settings Panel / 设置界面

Modal dialog with the following categories / 模态弹窗，包含以下设置分类：

1. **Second Style / 秒钟样式** — full-screen bar, top bar, bottom bar, digital, off / 全屏长条、顶部长条、底部条、数字显示、关闭
2. **Progress Bar Opacity / 进度条透明度** — adjust opacity of the progress bar / 调整进度条不透明度
3. **Title Style / 标题样式** — date, custom, off / 日期、自定义、关闭
4. **Colors / 颜色** — background, text, progress bar / 背景色、字体色、进度条色
5. **Font / 字体** — font-family selector / font-family 选择器
6. **Time Sync / 时间同步** — auto-calibrate system clock offset (auto-sync when error <500ms) / 自动校准系统时钟偏差（误差 <500ms 自动同步）
7. **Language / 语言** — 中文 / English

## Usage / 使用方法

1. On first use, click the **Settings** button at the top-left to customize. / 首次使用，点击左上角"设置"按钮，进行个性化设置。
2. After configuration, click **Close** or tap outside the modal to return to the main screen. / 设置完成后，点击"关闭"按钮或点击弹窗外侧返回主界面。
3. Click the **Fullscreen** button at the top-right to toggle full-screen mode. / 点击右上角"全屏"按钮，可以切换全屏显示。
4. Switch between Chinese and English interfaces. / 支持切换中/英文界面。

## Features / 特性

- **Auto-size clock** / **大屏显示时间** — automatically adapts to window size / 自动适配窗口尺寸
- **Multiple second styles** / **多种秒钟显示样式** — full-screen bar, top bar, bottom bar, digital, off / 全屏长条、顶部长条、底部条、数字、关闭
- **Adjustable progress bar opacity** / **进度条透明度可调**
- **Title bar options** / **标题栏** — date, custom text, off / 支持日期/自定义文字/关闭
- **Custom colors** / **自定义颜色** — background, text, progress bar / 背景、字体、进度条
- **Custom fonts** / **自定义字体** — including CJK fonts / 含中文字体
- **12h/24h format** / **12h/24h 时间格式切换**
- **Fullscreen toggle** / **全屏/退出全屏**
- **Wake Lock support** / **屏幕常亮** — with status indicator / 含状态指示
- **Time sync** / **时间同步** — auto-calibrates system clock offset (auto-applied when error <500ms) / 自动校准系统时钟偏差，误差 <500ms 自动应用
- **Internationalization** / **国际化** — 中文 / English
- **PWA support** / **PWA 支持** — offline access, installable / 离线访问、可安装
- **Cross-platform** / **跨平台**
