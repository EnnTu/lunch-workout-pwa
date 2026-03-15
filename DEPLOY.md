# 午间铁馆 - 部署指南

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 4. 预览生产版本

```bash
npm run preview
```

---

## 部署平台

### 方案一：Vercel（推荐）

**优点**：自动 HTTPS、全球 CDN、自动部署、支持 PWA

1. 安装 Vercel CLI
```bash
npm i -g vercel
```

2. 登录 Vercel
```bash
vercel login
```

3. 部署
```bash
# 开发环境
vercel

# 生产环境
vercel --prod
```

**自动部署**：连接 GitHub 仓库后，每次推送到 main 分支会自动部署。

---

### 方案二：GitHub Pages

**优点**：免费、与 GitHub 集成、适合开源项目

#### 方式 A：使用 GitHub Actions（推荐）

1. 推送代码到 GitHub 仓库

2. 进入仓库设置 → Pages → Source 选择 "GitHub Actions"

3. 每次推送到 main 分支会自动触发部署

#### 方式 B：手动部署

```bash
# 安装 gh-pages
npm install -g gh-pages

# 构建
npm run build

# 部署到 GitHub Pages
npm run deploy:gh
```

**注意**：GitHub Pages 需要修改 `vite.config.js` 中的 `base` 配置：
```js
base: '/你的仓库名/',
```

---

### 方案三：Netlify

**优点**：简单易用、自动部署、表单处理

#### 方式 A：通过 Git 集成

1. 登录 [Netlify](https://netlify.com)

2. 选择 "Add new site" → "Import an existing project"

3. 选择 GitHub 仓库

4. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `dist`

5. 点击 Deploy

#### 方式 B：使用 Netlify CLI

```bash
# 安装 CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化
netlify init

# 部署
netlify deploy --prod --dir=dist
```

---

## PWA 配置验证

部署后，请验证以下 PWA 功能：

### 1. Manifest 检测
打开 Chrome DevTools → Application → Manifest，确认：
- ✅ 应用名称显示正确
- ✅ 图标全部加载
- ✅ 主题颜色正确
- ✅ 启动画面配置正确

### 2. Service Worker
打开 Chrome DevTools → Application → Service Workers，确认：
- ✅ SW 已注册
- ✅ 离线状态下页面可访问
- ✅ 缓存策略正常工作

### 3. 添加到主屏幕
在手机上访问部署后的地址，确认：
- ✅ 出现 "添加到主屏幕" 提示
- ✅ 安装后图标正确
- ✅ 启动时显示全屏
- ✅ 状态栏样式正确

---

## 环境变量配置

### 开发环境
复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

### 生产环境
在部署平台上设置环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_APP_NAME` | 应用名称 | 午间铁馆 |
| `VITE_APP_VERSION` | 应用版本 | 1.0.0 |
| `VITE_ENABLE_VOICE` | 启用语音 | true |
| `VITE_ENABLE_OFFLINE` | 启用离线 | true |

---

## 性能优化建议

### 1. 图片优化
- 使用 WebP 格式
- 配置懒加载
- 使用响应式图片

### 2. 缓存策略
```nginx
# Nginx 配置示例
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /sw.js {
    expires -1;
    add_header Cache-Control "no-cache";
}
```

### 3. 压缩和优化
构建时自动启用：
- JavaScript 压缩 (Terser)
- CSS 压缩
- 资源文件哈希化

---

## 故障排除

### 问题：部署后页面空白

**解决方案**：
1. 检查 `vite.config.js` 中的 `base` 配置是否正确
2. 检查浏览器控制台是否有 404 错误
3. 确认构建输出目录正确

### 问题：PWA 无法安装

**解决方案**：
1. 检查 HTTPS 是否启用（PWA 需要 HTTPS）
2. 检查 manifest.json 是否可访问
3. 检查 Service Worker 是否注册成功

### 问题：离线无法访问

**解决方案**：
1. 检查 Workbox 配置
2. 确认缓存策略正确
3. 测试网络断开后的页面加载

---

## 域名配置（可选）

### 自定义域名

**Vercel**：
1. 进入项目 Dashboard
2. 点击 Settings → Domains
3. 添加自定义域名并配置 DNS

**Netlify**：
1. 进入 Site settings → Domain management
2. 点击 Add custom domain
3. 配置 DNS 记录

**GitHub Pages**：
1. 进入仓库设置 → Pages
2. 在 Custom domain 处输入域名
3. 配置 CNAME 记录

---

## 监控与分析（可选）

### 推荐工具

1. **Google Analytics** - 用户行为分析
2. **Sentry** - 错误监控
3. **Lighthouse CI** - 性能监控

### 启用 Google Analytics

在 `.env.production` 中添加：
```
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

在 `main.js` 中添加追踪代码。

---

## 联系与支持

如有部署问题，请：
1. 查看 [Issues](../../issues)
2. 提交新的 Issue
3. 查看 [Vite 部署文档](https://vitejs.dev/guide/static-deploy.html)
