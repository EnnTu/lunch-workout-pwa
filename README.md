# 午间铁馆 - 智能周期化训练应用

专为上班族设计的午间健身训练应用，支持三分化(PPL)和五分化训练计划，具备渐进超负荷分析功能。

## 功能特性

### 训练体系
- **三分化训练**：推日(胸/肩/三头) + 拉日(背/二头) + 腿日
- **五分化训练**：胸日 + 背日 + 肩日 + 臂日 + 腿日
- **智能计划生成**：根据体能测试自动推算1RM，生成个性化重量/组数/次数

### 核心功能
- **体能测试**：俯卧撑/引体向上/深蹲跳/平板支撑 → 自动推算各动作1RM
- **个性化计划**：根据训练水平(初/中/高级)自动调整容量和强度
- **语音指导**：训练开始、组间休息、鼓励语等语音播报
- **训练计时器**：训练时长 + 组间休息倒计时
- **渐进超负荷分析**：追踪力量增长趋势，自动建议加重
- **数据可视化**：容量趋势图、动作进步排行、力量增长曲线

### 社交功能
- **团队组队**：与同事组队互相监督
- **打卡榜单**：周训练次数排行榜
- **团队挑战**：团队总容量目标

### PWA特性
- **离线可用**：Service Worker缓存，无网络也能使用
- **可安装**：支持添加到手机主屏幕
- **后台同步**：训练数据离线存储，联网后自动同步

## 技术栈

- **前端**：原生 JavaScript (ES6+)，无需框架
- **构建工具**：Vite (支持热更新、代码压缩、代码分割)
- **数据存储**：IndexedDB (本地存储)
- **PWA**：Service Worker + Manifest + Workbox
- **语音**：Web Speech API
- **图表**：Canvas 自绘

## 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## 部署方式

支持多种平台一键部署：

| 平台 | 命令 | 特点 |
|------|------|------|
| **Vercel** | `vercel --prod` | 自动 HTTPS、全球 CDN、推荐 |
| **GitHub Pages** | 自动部署 | 免费、适合开源项目 |
| **Netlify** | `netlify deploy --prod` | 简单易用、表单处理 |

### 详细部署指南

查看 [DEPLOY.md](./DEPLOY.md) 获取完整的部署配置说明。

### 方式一：Vercel（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录并部署
vercel login
vercel --prod
```

### 方式二：GitHub Pages

```bash
# 推送到 GitHub 后自动部署
# 或手动部署
npm run deploy:gh
```

### 方式三：Netlify

```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署
netlify deploy --prod --dir=dist
```

---

## 传统部署方式

### 方式一：静态文件服务器

```bash
# 进入项目目录
cd lunch-workout-pwa

# 使用 Python 启动简单服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .

# 或使用 VS Code Live Server 插件
```

访问 http://localhost:8080

### 方式二：部署到钉钉/飞书

#### 钉钉微应用

1. 登录 [钉钉开放平台](https://open.dingtalk.com/)
2. 创建企业内部微应用
3. 在"开发管理"中配置应用首页地址：
   - 开发环境：`http://你的服务器地址/index.html`
4. 在"权限管理"中申请所需权限
5. 发布应用到企业内部

#### 飞书小程序

1. 登录 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 配置网页应用：
   - 移动端首页：`http://你的服务器地址/index.html`
   - 桌面端首页：`http://你的服务器地址/index.html`
4. 发布版本并申请上线

### 方式三：部署到云服务器

```bash
# 构建生产版本（可选：压缩JS/CSS）
# 将 lunch-workout-pwa 目录上传到服务器

# Nginx 配置示例
server {
    listen 80;
    server_name workout.yourcompany.com;
    root /var/www/lunch-workout-pwa;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存静态资源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker 不缓存
    location /sw.js {
        add_header Cache-Control "no-cache";
    }
}
```

## 使用指南

### 首次使用

1. 打开应用后，进入"设置"页面
2. 完成体能测试（俯卧撑/引体向上/深蹲跳/平板支撑）
3. 选择训练分化（三分化/五分化）和训练水平
4. 系统会根据测试结果生成个性化训练计划

### 开始训练

1. 首页查看今日训练内容
2. 点击"开始训练"进入训练页面
3. 按照计划完成每组动作
4. 点击完成按钮标记该组完成
5. 自动开始组间休息倒计时
6. 完成所有动作后点击"完成训练"

### 查看进度

1. "数据"页面查看：
   - 渐进超负荷分析（力量增长趋势）
   - 周训练容量变化
   - 各动作进步排行
2. 首页查看本周完成进度

### 团队功能

1. "组队"页面查看团队成员训练情况
2. 邀请同事加入（需要钉钉/飞书组织权限）
3. 参与团队挑战，达成周容量目标

## 项目结构

```
lunch-workout-pwa/
├── index.html              # 主页面
├── package.json            # 项目依赖和脚本
├── vite.config.js          # Vite 构建配置
├── vercel.json             # Vercel 部署配置
├── netlify.toml            # Netlify 部署配置
├── .github/workflows/      # GitHub Actions 配置
│   └── deploy.yml          # 自动部署工作流
├── public/
│   ├── manifest.json       # PWA 配置
│   ├── sw.js               # Service Worker
│   └── icons/              # 应用图标
├── src/
│   ├── main.js             # 应用入口
│   ├── types/
│   │   └── index.js        # 类型定义
│   ├── data/
│   │   └── exercises.js    # 动作库数据
│   └── utils/
│       ├── constants.js    # 全局常量
│       ├── trainingPlan.js # 训练计划生成器
│       ├── oneRM.js        # 1RM推算和渐进超负荷
│       ├── storage.js      # IndexedDB存储
│       ├── voice.js        # 语音指导
│       └── charts.js       # 图表绘制
├── DEPLOY.md               # 详细部署指南
└── README.md               # 项目说明
```

## 后续优化方向

1. **云端同步**：接入后端API，实现多设备数据同步
2. **视频演示**：接入短视频CDN，提供动作教学视频
3. **AI教练**：接入Claude API，提供个性化训练建议
4. **饮食追踪**：增加蛋白质摄入记录功能
5. **体测追踪**：记录体脂率/围度等身体数据
6. **训练照片**：支持训练打卡拍照上传

## 浏览器兼容性

- Chrome/Edge 80+
- Safari 14+
- Firefox 75+
- iOS Safari 14+
- Android Chrome 80+

需要支持：
- ES6 Modules
- IndexedDB
- Service Worker
- Web Speech API

## License

MIT
