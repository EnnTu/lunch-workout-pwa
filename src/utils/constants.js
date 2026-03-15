/**
 * 午间铁馆 - 全局常量
 */

// 数据库配置
export const DB_CONFIG = {
  NAME: 'lunch-workout-db',
  VERSION: 1
};

// 存储对象名称
export const STORE_NAMES = {
  USER_PROFILE: 'user-profile',
  WORKOUTS: 'workouts',
  TRAINING_PLAN: 'training-plan',
  PERSONAL_RECORDS: 'personal-records',
  PENDING_SYNC: 'pending-sync'
};

// 默认用户设置
export const DEFAULT_USER = {
  splitType: 'ppl',
  level: 'intermediate',
  bodyWeight: 70,
  fitnessTests: {
    pushups: 20,
    pullups: 5,
    squatJump: 20,
    plank: 60
  }
};

// 训练相关常量
export const WORKOUT_CONSTANTS = {
  MIN_WEIGHT: 10,
  WEIGHT_INCREMENT_UPPER: 2.5,
  WEIGHT_INCREMENT_LOWER: 5.0,
  DEFAULT_REST_SECONDS: 90,
  WARMUP_MINUTES: 10,
  COOLDOWN_MINUTES: 5
};

// 星期映射
export const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];

// 颜色配置
export const COLORS = {
  primary: '#e94560',
  secondary: '#0f3460',
  dark: '#1a1a2e',
  light: '#16213e',
  text: '#eaeaea',
  textMuted: '#a0a0a0',
  success: '#00d9ff',
  warning: '#ffa502'
};

// 语音配置
export const VOICE_CONFIG = {
  LANGUAGE: 'zh-CN',
  DEFAULT_RATE: 1.0,
  DEFAULT_PITCH: 1.0,
  DEFAULT_VOLUME: 1.0
};
