# 雷龙 Thunder Dragon - AI 智能选购顾问

雷龙 AI 智能选购顾问前端网页，赛博朋克深色主题设计，为用户提供智能鼠标选购咨询服务。

## 项目简介

本项目是一个基于 React 的 AI 鼠标选购问答系统前端，采用赛博朋克风格的深色主题，以雷龙龙头为品牌形象，支持多场景选购咨询、商品推荐、参数对比、询价议价等 14 种用户意图的智能交互。

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 19.x | 前端框架 |
| Vite | 8.x | 构建工具 |
| TailwindCSS | 3.x | CSS 样式框架 |
| Lucide React | 1.x | 图标库 |
| PostCSS | 8.x | CSS 后处理 |
| OxLint | 1.x | 代码检查 |

## 项目结构

```
src/
├── components/              # 组件目录
│   ├── Header.jsx           # 顶部导航（品牌Logo、导航入口）
│   ├── ChatArea.jsx         # 聊天区域主组件（消息、输入、快捷入口）
│   ├── HistorySidebar.jsx   # 历史记录侧边栏
│   ├── StatusPanel.jsx      # 会话状态面板（选购条件、候选商品）
│   ├── ProductCard.jsx      # 商品推荐卡片
│   └── IntentComponents.jsx # 16种意图表现组件
├── services/                # 服务层
│   └── api.js               # API服务（含Mock数据）
├── data/                    # 数据层
│   └── mockData.js          # Mock数据（商品、快捷问题等）
├── assets/                  # 静态资源
│   ├── dragon-logo.jpg      # 雷龙龙头Logo
│   └── hero.png             # 品牌图片
├── App.jsx                  # 主应用组件
├── index.css                # 全局样式（赛博朋克主题）
└── main.jsx                 # 入口文件
```

## 功能模块

### 1. 用户端主页面
- **顶部导航**：雷龙品牌Logo、历史对话、联系客服、在线状态
- **欢迎区**：AI头像、欢迎语、场景快捷入口、预算快捷入口
- **对话区**：消息气泡（用户/AI/系统）、加载动画、意图组件展示
- **固定转化区**：获取购买链接、联系人工顾问
- **输入区**：常用问题快捷按钮、消息输入框（支持回车发送）

### 2. 14种意图识别
| 意图类型 | 说明 |
|---------|------|
| selection_consultation | 选购咨询（场景、预算选择） |
| product_recommendation | 商品推荐（三档方案） |
| product_comparison | 商品比较（参数对比表） |
| parameter_query | 参数咨询（知识库答案+相关商品） |
| compatibility_check | 兼容性确认 |
| price_inquiry | 询价（标价/区间/预估/正式报价） |
| bargain | 议价优惠 |
| stock_logistics | 库存物流查询 |
| enterprise_purchase | 企业采购 |
| purchase_push | 成交推进 |
| after_sales | 订单售后 |
| complaint | 投诉处理 |
| direct_human | 人工客服转接 |
| casual_chat | 闲聊对话 |

### 3. 商品推荐卡片
- 商品名称、档位标签（入门/进阶/旗舰）
- 核心参数：DPI、重量、连接方式
- 公开零售价、推荐理由、适用场景
- 购买链接、联系顾问按钮

### 4. 历史记录
- 左侧历史会话侧边栏
- 显示会话标题、最后访问时间、最近查询
- 支持新建、切换、删除会话
- 匿名用户仅显示最近7天记录

### 5. 会话状态面板
- 当前选购条件展示与移除
- 候选商品列表（含库存状态）
- 条件清空功能

## 视觉主题

### 配色方案
- **主色调**：紫罗兰紫 `#8B5CF6`、品红 `#C084FC`、青色 `#06B6D4`
- **背景色**：深色 `#08080F`、网格背景 `cyber-grid-bg`
- **强调色**：霓虹发光效果（`glow-pulse`、`neon-border`）

### 动画效果
- `glow-pulse`：Logo 脉冲发光
- `float`：背景光珠浮动
- `twinkle`：星点闪烁
- `fadeInUp`：消息入场动画
- `bounce-dot`：加载点跳动
- `cyber-btn`：按钮光泽扫过
- `card-hover`：卡片悬浮上浮

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:5173 查看效果

### 构建生产版本
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 接入真实 API

在 `src/services/api.js` 中预留了 API 调用接口，只需替换 `sendMessageToAI` 函数中的 Mock 实现即可：

```javascript
// src/services/api.js
export async function sendMessageToAI(message, context) {
  // 替换为真实 API 调用
  // const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message, context }) });
  // return response.json();
  
  // 当前 Mock 实现
  return mockResponse(message);
}
```

## 品牌信息

- **品牌名称**：雷龙 THUNDER DRAGON
- **品牌形象**：赛博朋克风格龙头 Logo
- **品牌定位**：AI 智能选购顾问，为用户提供专业的鼠标选购咨询服务

## 目录结构

```
6a71a00673f1eb0290ec9ad9/
├── public/
│   ├── favicon.svg          # 浏览器标签图标
│   └── icons.svg            # SVG 图标集合
├── src/
│   ├── components/          # React 组件
│   ├── services/            # API 服务层
│   ├── data/                # Mock 数据
│   ├── assets/              # 静态资源
│   ├── App.jsx              # 主应用
│   ├── main.jsx             # 入口文件
│   └── index.css            # 全局样式
├── index.html               # HTML 入口
├── package.json             # 项目配置
├── tailwind.config.js       # Tailwind 配置
├── postcss.config.js        # PostCSS 配置
└── vite.config.js           # Vite 配置
```
