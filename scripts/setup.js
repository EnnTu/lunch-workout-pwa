#!/usr/bin/env node
/**
 * 午间铁馆 - 项目初始化脚本
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      cwd: rootDir,
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
  }
}

async function main() {
  log('\n🏋️  午间铁馆 - 项目初始化\n', 'bright');

  // 检查 Node.js 版本
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  if (majorVersion < 18) {
    log('❌ 需要 Node.js 18 或更高版本', 'red');
    log(`当前版本: ${nodeVersion}`, 'yellow');
    process.exit(1);
  }

  log(`✓ Node.js 版本: ${nodeVersion}`, 'green');

  // 检查 package.json
  const packageJsonPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('❌ 找不到 package.json', 'red');
    process.exit(1);
  }

  // 安装依赖
  log('\n📦 安装依赖...', 'blue');
  try {
    exec('npm install', { silent: true });
    log('✓ 依赖安装完成', 'green');
  } catch (error) {
    log('❌ 依赖安装失败', 'red');
    console.error(error.message);
    process.exit(1);
  }

  // 检查并创建环境文件
  log('\n🔧 检查环境配置...', 'blue');
  const envExamplePath = path.join(rootDir, '.env.example');
  const envLocalPath = path.join(rootDir, '.env.local');

  if (fs.existsSync(envExamplePath) && !fs.existsSync(envLocalPath)) {
    fs.copyFileSync(envExamplePath, envLocalPath);
    log('✓ 已创建 .env.local 文件', 'green');
  }

  // 创建必要的目录
  log('\n📁 创建项目目录...', 'blue');
  const dirs = ['dist', '.cache'];
  dirs.forEach(dir => {
    const dirPath = path.join(rootDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
  log('✓ 目录结构检查完成', 'green');

  // 成功信息
  log('\n✨ 初始化完成！', 'bright');
  log('\n可用命令:', 'bright');
  log('  npm run dev      - 启动开发服务器');
  log('  npm run build    - 构建生产版本');
  log('  npm run preview  - 预览生产版本');
  log('\n部署命令:', 'bright');
  log('  vercel --prod    - 部署到 Vercel');
  log('  npm run deploy:gh - 部署到 GitHub Pages');
  log('\n📖 详细说明请查看 DEPLOY.md\n', 'yellow');
}

main().catch(error => {
  log(`\n❌ 错误: ${error.message}`, 'red');
  process.exit(1);
});
