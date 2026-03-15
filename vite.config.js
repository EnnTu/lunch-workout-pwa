import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  // 基础路径，GitHub Pages 需要设置为仓库名
  base: './',

  // 入口配置
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 代码分割策略
        manualChunks: {
          // 将业务逻辑代码分离
          'app-core': ['./src/main.js'],
          'app-utils': [
            './src/utils/storage.js',
            './src/utils/trainingPlan.js',
            './src/utils/oneRM.js',
            './src/utils/voice.js',
            './src/utils/charts.js'
          ],
          'app-data': [
            './src/data/exercises.js',
            './src/types/index.js'
          ]
        },
        // 资源文件命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (ext === 'css') {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    // 压缩报告，分析包大小
    reportCompressedSize: true,
    //  chunk 大小警告阈值
    chunkSizeWarningLimit: 500
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 支持 HTTPS（PWA 需要）
    https: false
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    open: true
  },

  // 插件配置
  plugins: [
    // PWA 插件配置
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // 工作箱配置
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        // 运行时缓存策略
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          }
        ],
        // 跳过等待，立即激活
        skipWaiting: true,
        clientsClaim: true,
        // 清理过期缓存
        cleanupOutdatedCaches: true
      },
      // Manifest 配置
      manifest: {
        name: '午间铁馆 - 智能周期化训练',
        short_name: '午间铁馆',
        description: '专为上班族设计的智能健身训练应用',
        theme_color: '#1a1a2e',
        background_color: '#1a1a2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'zh-CN',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        categories: ['health', 'fitness', 'lifestyle'],
        screenshots: [
          {
            src: '/screenshots/home.png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: '首页 - 今日训练'
          },
          {
            src: '/screenshots/workout.png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: '训练页面'
          }
        ],
        shortcuts: [
          {
            name: '开始训练',
            short_name: '训练',
            description: '快速开始今日训练',
            url: '/?action=start-workout',
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: '查看数据',
            short_name: '数据',
            description: '查看训练统计数据',
            url: '/?page=stats',
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
          }
        ],
        related_applications: [],
        prefer_related_applications: false
      },
      // 开发选项
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),

    // 旧版浏览器支持
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true
    })
  ],

  // 解析配置
  resolve: {
    alias: {
      '@': '/src',
      '@utils': '/src/utils',
      '@data': '/src/data',
      '@types': '/src/types'
    }
  },

  // CSS 配置
  css: {
    devSourcemap: true,
    postcss: {
      plugins: []
    }
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: [],
    exclude: []
  }
});
