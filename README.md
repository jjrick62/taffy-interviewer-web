# 塔菲 AI 模拟面试官

> 以虚拟主播「小塔菲」为形象的 AI 模拟面试系统

## 功能

- **多岗位面试** — 支持前端、后端、产品、数据分析等多种岗位的模拟面试
- **AI 实时对话** — 接入 AI API，塔菲以第一人称进行面试提问和追问
- **难度分级** — 初级/中级/高级，适配不同阶段的求职需求
- **面试反馈** — 面试结束后给出评分和改进建议
- **动态角色** — 塔菲图片随对话内容切换表情（正常/开心/坏笑）
- **多轮对话** — 支持上下文保持，模拟真实面试的追问逻辑

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 18 + Vite 5 |
| 语言 | JavaScript (JSX) |
| 样式 | CSS |
| HTTP | Axios |
| 动画 | Framer Motion |
| 图标 | React Icons |

## 快速开始

```bash
npm install
npm run dev
```

打开 `http://localhost:5173`

## 项目结构

```
taffy-interviewer-web/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx          # 主应用逻辑
    ├── index.jsx        # 入口
    ├── index.css        # 全局样式
    ├── taffy.png        # 塔菲默认形象
    ├── taffy_compressed.jpg
    └── 塔菲/            # 塔菲表情包
        ├── 塔菲1~4.jpg
        ├── 塔菲淫笑.jpg/png
        └── 塔菲狂笑动图.gif
```

## 构建

```bash
npm run build   # 输出到 dist/
npm run preview # 预览构建产物
```
