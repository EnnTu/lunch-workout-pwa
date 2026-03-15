/**
 * 午间铁馆 - 1RM推算与重量计算
 * 基于体能测试推算1RM，并计算训练重量
 */

import { FitnessTests, IntensityParams } from '../types/index.js';

/**
 * 根据体能测试结果估算1RM
 * @param {Object} testResults - 体能测试结果
 * @param {number} bodyWeight - 体重(kg)
 * @returns {Object} 各动作的估算1RM
 */
export function estimateOneRMs(testResults, bodyWeight) {
  const estimates = {
    default: 40, // 默认起始重量
    bodyWeight: bodyWeight
  };

  // 俯卧撑 -> 卧推1RM估算（体重的百分比）
  if (testResults.pushups) {
    const ratio = FitnessTests.PUSHUPS.rmEstimate(testResults.pushups);
    estimates.barbell_bench_press = Math.round(bodyWeight * ratio);
    estimates.dumbbell_bench_press = Math.round(bodyWeight * ratio * 0.8);
    estimates.incline_barbell_press = Math.round(bodyWeight * ratio * 0.85);
    estimates.incline_dumbbell_press = Math.round(bodyWeight * ratio * 0.7);
    estimates.close_grip_bench = Math.round(bodyWeight * ratio * 0.75);
    estimates.dip = Math.round(bodyWeight * ratio * 0.9);
  }

  // 引体向上 -> 背部/下拉1RM估算
  if (testResults.pullups !== undefined) {
    const ratio = FitnessTests.PULLUPS.rmEstimate(testResults.pullups);
    estimates.pull_up = Math.round(bodyWeight * ratio);
    estimates.lat_pulldown = Math.round(bodyWeight * ratio);
    estimates.barbell_row = Math.round(bodyWeight * ratio * 0.85);
    estimates.dumbbell_row = Math.round(bodyWeight * ratio * 0.45); // 单手
    estimates.seated_cable_row = Math.round(bodyWeight * ratio * 0.9);
  } else {
    // 无法完成引体向上
    estimates.pull_up = 0;
    estimates.lat_pulldown = Math.round(bodyWeight * 0.5);
    estimates.barbell_row = Math.round(bodyWeight * 0.6);
    estimates.dumbbell_row = Math.round(bodyWeight * 0.3);
    estimates.seated_cable_row = Math.round(bodyWeight * 0.55);
  }

  // 深蹲跳 -> 深蹲1RM估算
  if (testResults.squatJump) {
    const ratio = FitnessTests.SQUAT_JUMP.rmEstimate(testResults.squatJump);
    estimates.squat = Math.round(bodyWeight * ratio);
    estimates.front_squat = Math.round(bodyWeight * ratio * 0.8);
    estimates.leg_press = Math.round(bodyWeight * ratio * 1.5);
    estimates.romanian_deadlift = Math.round(bodyWeight * ratio * 0.9);
    estimates.hip_thrust = Math.round(bodyWeight * ratio * 0.85);
  }

  // 平板支撑 -> 核心稳定性
  if (testResults.plank) {
    const ratio = FitnessTests.PLANK.rmEstimate(testResults.plank);
    // 核心力量影响所有复合动作的表现
    estimates.core_stability = ratio;
  }

  // 肩部相关（基于卧推和引体向上推算）
  const shoulderBase = estimates.barbell_bench_press || (bodyWeight * 0.7);
  estimates.overhead_press = Math.round(shoulderBase * 0.65);
  estimates.dumbbell_shoulder_press = Math.round(shoulderBase * 0.55);
  estimates.lateral_raise = Math.round(bodyWeight * 0.15); // 侧平举重量较小
  estimates.front_raise = Math.round(bodyWeight * 0.15);
  estimates.face_pull = Math.round(bodyWeight * 0.25);

  // 手臂相关
  const armBase = estimates.barbell_bench_press || (bodyWeight * 0.7);
  estimates.barbell_curl = Math.round(armBase * 0.45);
  estimates.dumbbell_curl = Math.round(armBase * 0.4);
  estimates.hammer_curl = Math.round(armBase * 0.42);
  estimates.preacher_curl = Math.round(armBase * 0.38);
  estimates.tricep_pushdown = Math.round(armBase * 0.5);
  estimates.overhead_tricep_extension = Math.round(armBase * 0.35);

  // 硬拉（综合深蹲和背部力量）
  const squatEst = estimates.squat || (bodyWeight * 1.2);
  const backEst = estimates.barbell_row || (bodyWeight * 0.6);
  estimates.deadlift = Math.round(Math.max(squatEst * 1.1, backEst * 1.5));

  // 腿部孤立动作
  estimates.leg_extension = Math.round((estimates.squat || bodyWeight) * 0.5);
  estimates.leg_curl = Math.round((estimates.squat || bodyWeight) * 0.4);
  estimates.walking_lunge = Math.round((estimates.squat || bodyWeight) * 0.5);
  estimates.standing_calf_raise = Math.round(bodyWeight * 1.2);

  // 核心动作
  estimates.plank = testResults.plank || 45;
  estimates.hanging_leg_raise = Math.round(bodyWeight * 0.1);
  estimates.cable_crunch = Math.round(bodyWeight * 0.3);
  estimates.russian_twist = Math.round(bodyWeight * 0.1);

  return estimates;
}

/**
 * 根据1RM计算训练重量
 * @param {number} oneRM - 1RM重量
 * @param {number} intensityPercent - 强度百分比(0-1)
 * @param {number} reps - 目标次数
 * @returns {number} 建议训练重量
 */
export function calculateWorkingWeight(oneRM, intensityPercent, reps = null) {
  if (!oneRM || oneRM <= 0) return 20; // 默认最小重量

  // 如果指定了次数，使用反向公式计算
  if (reps) {
    // Epley公式反推: 1RM = weight * (1 + reps/30)
    // 所以 weight = 1RM * intensity / (1 + reps/30)
    const estimatedRMWeight = oneRM * intensityPercent;
    return Math.max(estimatedRMWeight / (1 + reps / 30), 10);
  }

  // 直接使用强度百分比
  return oneRM * intensityPercent;
}

/**
 * 根据完成的重量和次数计算实际1RM
 * @param {number} weight - 完成重量
 * @param {number} reps - 完成次数
 * @returns {number} 估算1RM
 */
export function calculateActualOneRM(weight, reps) {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;

  // 使用Epley公式
  return weight * (1 + reps / 30);
}

/**
 * 多种1RM计算公式对比
 * @param {number} weight - 完成重量
 * @param {number} reps - 完成次数
 * @returns {Object} 不同公式的结果
 */
export function calculateOneRMAllFormulas(weight, reps) {
  if (reps <= 0 || weight <= 0) return null;
  if (reps === 1) {
    return {
      epley: weight,
      brzycki: weight,
      lombardi: weight,
      mayhew: weight,
      average: weight
    };
  }

  // Epley公式: 1RM = w * (1 + r/30)
  const epley = weight * (1 + reps / 30);

  // Brzycki公式: 1RM = w / (1.0278 - 0.0278 * r)
  const brzycki = weight / (1.0278 - 0.0278 * reps);

  // Lombardi公式: 1RM = w * r^0.10
  const lombardi = weight * Math.pow(reps, 0.10);

  // Mayhew公式: 1RM = w / (0.522 + 0.419 * e^(-0.055 * r))
  const mayhew = weight / (0.522 + 0.419 * Math.exp(-0.055 * reps));

  // 平均值
  const average = (epley + brzycki + lombardi + mayhew) / 4;

  return {
    epley: Math.round(epley),
    brzycki: Math.round(brzycki),
    lombardi: Math.round(lombardi),
    mayhew: Math.round(mayhew),
    average: Math.round(average)
  };
}

/**
 * 获取RM百分比参考表
 * @returns {Array} 各次数对应的1RM百分比
 */
export function getRMPercentageTable() {
  return [
    { reps: 1, percent: 100 },
    { reps: 2, percent: 95 },
    { reps: 3, percent: 93 },
    { reps: 4, percent: 90 },
    { reps: 5, percent: 87 },
    { reps: 6, percent: 85 },
    { reps: 7, percent: 83 },
    { reps: 8, percent: 80 },
    { reps: 9, percent: 77 },
    { reps: 10, percent: 75 },
    { reps: 11, percent: 73 },
    { reps: 12, percent: 70 },
    { reps: 15, percent: 65 },
    { reps: 20, percent: 60 }
  ];
}

/**
 * 根据1RM生成各次数的最大重量表
 * @param {number} oneRM - 1RM重量
 * @returns {Array} 各次数对应的最大重量
 */
export function generateRMTable(oneRM) {
  const percentages = getRMPercentageTable();
  return percentages.map(p => ({
    reps: p.reps,
    percent: p.percent,
    weight: Math.round(oneRM * p.percent / 100 / 2.5) * 2.5 // 四舍五入到2.5kg
  }));
}

/**
 * 分析力量进步
 * @param {Array} workoutHistory - 训练历史
 * @param {string} exerciseId - 动作ID
 * @returns {Object} 进步分析结果
 */
export function analyzeStrengthProgress(workoutHistory, exerciseId) {
  const exerciseHistory = workoutHistory
    .flatMap(h => h.exercises || [])
    .filter(e => e.exerciseId === exerciseId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (exerciseHistory.length < 2) {
    return {
      hasProgress: false,
      message: '数据不足，需要至少2次训练记录'
    };
  }

  const first = exerciseHistory[0];
  const last = exerciseHistory[exerciseHistory.length - 1];

  // 计算最高1RM
  const first1RM = Math.max(...first.sets.map(s =>
    calculateActualOneRM(s.weight, s.reps)
  ));
  const last1RM = Math.max(...last.sets.map(s =>
    calculateActualOneRM(s.weight, s.reps)
  ));

  const progressPercent = ((last1RM - first1RM) / first1RM * 100).toFixed(1);
  const absoluteProgress = (last1RM - first1RM).toFixed(1);

  // 计算容量进步
  const firstVolume = first.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const lastVolume = last.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  const volumeProgress = ((lastVolume - firstVolume) / firstVolume * 100).toFixed(1);

  return {
    hasProgress: true,
    first1RM: first1RM.toFixed(1),
    last1RM: last1RM.toFixed(1),
    progressPercent: parseFloat(progressPercent),
    absoluteProgress: parseFloat(absoluteProgress),
    firstVolume,
    lastVolume,
    volumeProgress: parseFloat(volumeProgress),
    sessionsCount: exerciseHistory.length,
    timeSpan: Math.ceil((new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24)),
    trend: exerciseHistory.map(h => ({
      date: h.date,
      estimated1RM: Math.max(...h.sets.map(s =>
        calculateActualOneRM(s.weight, s.reps)
      )),
      volume: h.sets.reduce((sum, s) => sum + s.weight * s.reps, 0)
    }))
  };
}

/**
 * 提供渐进超负荷建议
 * @param {Array} recentWorkouts - 最近训练记录
 * @param {string} exerciseId - 动作ID
 * @returns {Object} 建议
 */
export function getProgressiveOverloadAdvice(recentWorkouts, exerciseId) {
  const exerciseData = recentWorkouts
    .flatMap(w => w.exercises || [])
    .filter(e => e.exerciseId === exerciseId)
    .slice(-3); // 最近3次

  if (exerciseData.length < 2) {
    return { canProgress: false, message: '需要更多训练数据' };
  }

  // 检查是否连续完成目标
  const allCompleted = exerciseData.every(e =>
    e.sets.every(s => s.completed && s.reps >= e.targetReps)
  );

  if (!allCompleted) {
    return {
      canProgress: false,
      message: '先专注于完成当前目标次数',
      suggestion: '确保每组都能完成目标次数，动作质量优先'
    };
  }

  // 计算建议增量
  const isLowerBody = ['squat', 'deadlift', 'leg_press', 'romanian_deadlift'].some(id =>
    exerciseId.includes(id)
  );

  const increment = isLowerBody ? 5 : 2.5;
  const currentWeight = exerciseData[exerciseData.length - 1].sets[0].weight;

  return {
    canProgress: true,
    currentWeight,
    suggestedWeight: currentWeight + increment,
    increment,
    message: `建议下次训练增加 ${increment}kg`,
    suggestion: isLowerBody
      ? '下肢动作可以承受更大的重量增幅'
      : '上肢动作建议小幅度递增，保证动作质量'
  };
}

/**
 * 计算训练容量(Tonnage)
 * @param {Array} exercises - 训练中的动作
 * @returns {number} 总容量(kg)
 */
export function calculateVolume(exercises) {
  return exercises.reduce((total, ex) => {
    const exerciseVolume = ex.sets.reduce((sum, set) => {
      return sum + (set.weight || 0) * (set.reps || 0);
    }, 0);
    return total + exerciseVolume;
  }, 0);
}

/**
 * 比较不同周期的容量变化
 * @param {Array} workoutHistory - 训练历史
 * @param {number} weeks - 比较几周
 * @returns {Object} 容量变化分析
 */
export function analyzeVolumeTrend(workoutHistory, weeks = 4) {
  const now = new Date();
  const weekData = [];

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i + 1) * 7);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);

    const weekWorkouts = workoutHistory.filter(h => {
      const date = new Date(h.date);
      return date >= weekStart && date < weekEnd;
    });

    const volume = weekWorkouts.reduce((sum, w) =>
      sum + (w.totalVolume || 0), 0
    );

    weekData.push({
      week: weeks - i,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      workouts: weekWorkouts.length,
      volume
    });
  }

  weekData.reverse();

  // 计算趋势
  const firstWeek = weekData[0]?.volume || 0;
  const lastWeek = weekData[weekData.length - 1]?.volume || 0;
  const trend = firstWeek > 0
    ? ((lastWeek - firstWeek) / firstWeek * 100).toFixed(1)
    : 0;

  return {
    weeklyData: weekData,
    totalVolume: weekData.reduce((sum, w) => sum + w.volume, 0),
    averageWeekly: Math.round(weekData.reduce((sum, w) => sum + w.volume, 0) / weeks),
    trend: parseFloat(trend),
    isIncreasing: parseFloat(trend) > 0
  };
}
