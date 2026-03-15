#!/usr/bin/env node
/**
 * 午间铁馆 - 部署前检查脚本
 */

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
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(rootDir, filePath);
  if (fs.existsSync(fullPath)) {
    log(`  ✓ ${description}`, 'green');
    return true;
  } else {
    log(`  ✗ ${description} (${filePath})`, 'red');
    return false;
  }
}

function checkPWAIcons() {
  const iconsDir = path.join(rootDir, 'public', 'icons');
  const requiredSizes = [72, 96, 128, 144, 152, 192, 384, 512];

  log('\n📱 PWA 图标检查:', 'bright');

  let allExist = true;
  for (const size of requiredSizes) {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    if (!fs.existsSync(iconPath)) {
      log(`  ✗ 缺少图标: icon-${size}x${size}.png`, 'red');
      allExist = false;
    }
  }

  if (allExist) {
    log('  ✓ 所有 PWA 图标齐全', 'green');
  }

  return allExist;
}

function main() {
  log('\n🔍 部署前检查\n', 'bright');

  let allPassed = true;

  // 检查必要文件
  log('📄 必要文件检查:', 'bright');
  allPassed &= checkFile('package.json', 'package.json');
  allPassed &= checkFile('vite.config.js', 'Vite 配置');
  allPassed &= checkFile('index.html', '入口 HTML');
  allPassed &= checkFile('public/manifest.json', 'PWA Manifest');

  // 检查源代码
  log('\n💻 源代码检查:', 'bright');
  allPassed &= checkFile('src/main.js', '主入口文件');
  allPassed &= checkFile('src/utils/storage.js', '存储模块');
  allPassed &= checkFile('src/utils/trainingPlan.js', '训练计划模块');

  // 检查 PWA 图标
  allPassed &= checkPWAIcons();

  // 检查部署配置
  log('\n🚀 部署配置检查:', 'bright');
  checkFile('vercel.json', 'Vercel 配置');
  checkFile('netlify.toml', 'Netlify 配置');
  checkFile('.github/workflows/deploy.yml', 'GitHub Actions 配置');

  // 检查结果
  log('\n' + '='.repeat(40), 'bright');
  if (allPassed) {
    log('✅ 所有检查通过！可以部署。', 'green');
    log('\n部署命令:', 'bright');
    log('  npm run build    - 构建生产版本');
    log('  vercel --prod    - 部署到 Vercel');
    process.exit(0);
  } else {
    log('❌ 检查未通过，请修复上述问题后再部署。', 'red');
    process.exit(1);
  }
}

main();
