/**
 * 午间铁馆 - 类型定义
 */

// 训练分化类型
export const SplitType = {
  PPL: 'ppl',       // 三分化：推/拉/腿
  BRO: 'bro'        // 五分化：胸/背/肩/臂/腿
};

// 训练水平
export const Level = {
  BEGINNER: 'beginner',       // 初级 <1年
  INTERMEDIATE: 'intermediate', // 中级 1-3年
  ADVANCED: 'advanced'        // 高级 >3年
};

// 训练日定义（三分化）
export const PPLDays = {
  PUSH: {
    name: '推日',
    focus: ['胸部', '肩部前束', '肱三头肌'],
    color: '#e94560'
  },
  PULL: {
    name: '拉日',
    focus: ['背部', '肩部后束', '肱二头肌'],
    color: '#00d9ff'
  },
  LEGS: {
    name: '腿日',
    focus: ['股四头肌', '腘绳肌', '臀部', '小腿'],
    color: '#ffa502'
  },
  REST: {
    name: '休息日',
    focus: ['恢复'],
    color: '#a0a0a0'
  }
};

// 训练日定义（五分化）
export const BroDays = {
  CHEST: {
    name: '胸日',
    focus: ['胸大肌', '胸小肌'],
    color: '#e94560'
  },
  BACK: {
    name: '背日',
    focus: ['背阔肌', '斜方肌', '竖脊肌'],
    color: '#00d9ff'
  },
  SHOULDERS: {
    name: '肩日',
    focus: ['三角肌前束', '中束', '后束'],
    color: '#ffa502'
  },
  ARMS: {
    name: '臂日',
    focus: ['肱二头肌', '肱三头肌', '前臂'],
    color: '#2ed573'
  },
  LEGS: {
    name: '腿日',
    focus: ['股四头肌', '腘绳肌', '臀部', '小腿'],
    color: '#1e90ff'
  },
  REST: {
    name: '休息日',
    focus: ['恢复'],
    color: '#a0a0a0'
  }
};

// 动作类别
export const ExerciseCategory = {
  COMPOUND: 'compound',    // 复合动作
  ISOLATION: 'isolation'   // 孤立动作
};

// 肌肉群
export const MuscleGroup = {
  // 胸部
  CHEST_UPPER: 'chest_upper',
  CHEST_MIDDLE: 'chest_middle',
  CHEST_LOWER: 'chest_lower',

  // 背部
  BACK_LATS: 'back_lats',
  BACK_TRAPS: 'back_traps',
  BACK_RHOMBOIDS: 'back_rhomboids',
  BACK_LOWER: 'back_lower',

  // 肩部
  SHOULDERS_FRONT: 'shoulders_front',
  SHOULDERS_SIDE: 'shoulders_side',
  SHOULDERS_REAR: 'shoulders_rear',

  // 手臂
  BICEPS: 'biceps',
  TRICEPS: 'triceps',
  FOREARMS: 'forearms',

  // 腿部
  QUADS: 'quads',
  HAMSTRINGS: 'hamstrings',
  GLUTES: 'glutes',
  CALVES: 'calves',

  // 核心
  ABS: 'abs',
  CORE: 'core'
};

// 体能测试项目
export const FitnessTests = {
  PUSHUPS: {
    name: '标准俯卧撑',
    unit: '个',
    description: '连续完成标准俯卧撑的最大数量',
    rmEstimate: (reps) => {
      // 根据俯卧撑数量推算卧推1RM（体重比例）
      // 公式：俯卧撑数量与卧推1RM的体重百分比相关
      if (reps <= 5) return 0.6;
      if (reps <= 10) return 0.7;
      if (reps <= 20) return 0.8;
      if (reps <= 30) return 0.9;
      if (reps <= 40) return 1.0;
      return 1.1;
    }
  },
  PULLUPS: {
    name: '引体向上',
    unit: '个',
    description: '连续完成标准引体向上的最大数量',
    rmEstimate: (reps) => {
      // 推算高位下拉/划船1RM的体重比例
      if (reps <= 3) return 0.8;
      if (reps <= 5) return 0.9;
      if (reps <= 10) return 1.0;
      if (reps <= 15) return 1.1;
      return 1.2;
    }
  },
  SQUAT_JUMP: {
    name: '深蹲跳',
    unit: '个',
    description: '30秒内深蹲跳最大数量',
    rmEstimate: (reps) => {
      // 推算深蹲1RM的体重比例
      if (reps <= 15) return 1.0;
      if (reps <= 20) return 1.2;
      if (reps <= 25) return 1.4;
      return 1.5;
    }
  },
  PLANK: {
    name: '平板支撑',
    unit: '秒',
    description: '平板支撑最大持续时间',
    rmEstimate: (seconds) => {
      // 核心力量系数
      if (seconds <= 30) return 0.8;
      if (seconds <= 60) return 1.0;
      if (seconds <= 90) return 1.2;
      if (seconds <= 120) return 1.4;
      return 1.5;
    }
  }
};

// 训练强度参数
export const IntensityParams = {
  [Level.BEGINNER]: {
    setsPerExercise: 3,
    repsRange: { min: 10, max: 15 },
    intensityPercent: 0.65,  // 1RM的65%
    restSeconds: 90,
    volumeFactor: 0.8
  },
  [Level.INTERMEDIATE]: {
    setsPerExercise: 4,
    repsRange: { min: 8, max: 12 },
    intensityPercent: 0.75,
    restSeconds: 90,
    volumeFactor: 1.0
  },
  [Level.ADVANCED]: {
    setsPerExercise: 4,
    repsRange: { min: 6, max: 10 },
    intensityPercent: 0.80,
    restSeconds: 120,
    volumeFactor: 1.2
  }
};

// 渐进超负荷参数
export const ProgressiveOverload = {
  // 何时增加重量
  progressThreshold: {
    beginner: 2,      // 连续2次完成目标
    intermediate: 2,  // 连续2次完成目标
    advanced: 3       // 连续3次完成目标
  },
  // 增重幅度
  weightIncrement: {
    upperBody: 2.5,   // 上肢动作增加2.5kg
    lowerBody: 5.0    // 下肢动作增加5kg
  },
  // 最小可记录进步
  minProgressPercent: 2.5
};
