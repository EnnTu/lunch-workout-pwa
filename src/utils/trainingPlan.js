/**
 * 午间铁馆 - 训练计划生成器
 * 支持三分化(PPL)和五分化(Bro Split)
 */

import { SplitType, Level, IntensityParams, PPLDays, BroDays } from '../types/index.js';
import { ExerciseDB } from '../data/exercises.js';
import { calculateWorkingWeight } from './oneRM.js';

/**
 * 生成完整训练计划
 * @param {Object} userProfile - 用户档案
 * @param {string} userProfile.splitType - 训练分化类型
 * @param {string} userProfile.level - 训练水平
 * @param {Object} userProfile.estimatedRMs - 各动作估算1RM
 * @param {number} userProfile.bodyWeight - 体重(kg)
 * @returns {Object} 完整训练计划
 */
export function generateTrainingPlan(userProfile) {
  const { splitType, level } = userProfile;

  if (splitType === SplitType.PPL) {
    return generatePPLPlan(userProfile);
  } else if (splitType === SplitType.BRO) {
    return generateBroPlan(userProfile);
  }

  throw new Error('未知的训练分化类型');
}

/**
 * 生成三分化(PPL)训练计划
 */
function generatePPLPlan(userProfile) {
  const { level, estimatedRMs } = userProfile;
  const intensity = IntensityParams[level];

  const plan = {
    type: SplitType.PPL,
    level: level,
    schedule: ['push', 'pull', 'legs', 'rest', 'push', 'pull', 'rest'], // 周计划
    days: {
      push: {
        name: '推日',
        description: '胸部 + 肩部 + 三头',
        duration: 60,
        exercises: [
          // 胸部 - 复合动作
          createExerciseConfig(ExerciseDB.BARBELL_BENCH_PRESS, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.INCLINE_DUMBBELL_PRESS, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.CABLE_FLY, level, estimatedRMs, 'isolation'),

          // 肩部 - 推举
          createExerciseConfig(ExerciseDB.OVERHEAD_PRESS, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.LATERAL_RAISE, level, estimatedRMs, 'isolation'),

          // 三头
          createExerciseConfig(ExerciseDB.TRICEP_PUSHODOWN, level, estimatedRMs, 'isolation'),
          createExerciseConfig(ExerciseDB.OVERHEAD_TRICEP_EXTENSION, level, estimatedRMs, 'isolation')
        ]
      },
      pull: {
        name: '拉日',
        description: '背部 + 二头 + 后束',
        duration: 60,
        exercises: [
          // 背部 - 宽度
          createExerciseConfig(ExerciseDB.PULL_UP, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.LAT_PULLDOWN, level, estimatedRMs, 'primary'),

          // 背部 - 厚度
          createExerciseConfig(ExerciseDB.BARBELL_ROW, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.SEATED_CABLE_ROW, level, estimatedRMs, 'secondary'),

          // 后束
          createExerciseConfig(ExerciseDB.FACE_PULL, level, estimatedRMs, 'isolation'),

          // 二头
          createExerciseConfig(ExerciseDB.BARBELL_CURL, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.HAMMER_CURL, level, estimatedRMs, 'isolation')
        ]
      },
      legs: {
        name: '腿日',
        description: '股四头肌 + 腘绳肌 + 臀部',
        duration: 75,
        exercises: [
          // 股四头肌
          createExerciseConfig(ExerciseDB.SQUAT, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.LEG_PRESS, level, estimatedRMs, 'secondary'),
          createExerciseConfig(ExerciseDB.LEG_EXTENSION, level, estimatedRMs, 'isolation'),

          // 腘绳肌/臀部
          createExerciseConfig(ExerciseDB.ROMANIAN_DEADLIFT, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.LEG_CURL, level, estimatedRMs, 'isolation'),
          createExerciseConfig(ExerciseDB.HIP_THRUST, level, estimatedRMs, 'secondary'),

          // 小腿
          createExerciseConfig(ExerciseDB.STANDING_CALF_RAISE, level, estimatedRMs, 'isolation'),

          // 核心
          createExerciseConfig(ExerciseDB.PLANK, level, estimatedRMs, 'isolation', true) // isometric
        ]
      }
    }
  };

  return plan;
}

/**
 * 生成五分化(Bro Split)训练计划
 */
function generateBroPlan(userProfile) {
  const { level, estimatedRMs } = userProfile;
  const intensity = IntensityParams[level];

  const plan = {
    type: SplitType.BRO,
    level: level,
    schedule: ['chest', 'back', 'shoulders', 'arms', 'legs', 'rest', 'rest'],
    days: {
      chest: {
        name: '胸日',
        description: '胸大肌全方位轰炸',
        duration: 60,
        exercises: [
          // 上胸
          createExerciseConfig(ExerciseDB.INCLINE_BARBELL_PRESS, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.INCLINE_DUMBBELL_PRESS, level, estimatedRMs, 'primary'),

          // 中胸
          createExerciseConfig(ExerciseDB.BARBELL_BENCH_PRESS, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.DUMBBELL_BENCH_PRESS, level, estimatedRMs, 'secondary'),

          // 下胸/整体
          createExerciseConfig(ExerciseDB.DIP, level, estimatedRMs, 'secondary'),
          createExerciseConfig(ExerciseDB.CABLE_FLY, level, estimatedRMs, 'isolation'),

          // 收尾
          createExerciseConfig(ExerciseDB.PULLOVER, level, estimatedRMs, 'isolation')
        ]
      },
      back: {
        name: '背日',
        description: '背部宽度与厚度',
        duration: 60,
        exercises: [
          // 宽度
          createExerciseConfig(ExerciseDB.PULL_UP, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.LAT_PULLDOWN, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.PULLOVER, level, estimatedRMs, 'isolation'),

          // 厚度
          createExerciseConfig(ExerciseDB.BARBELL_ROW, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.SEATED_CABLE_ROW, level, estimatedRMs, 'secondary'),
          createExerciseConfig(ExerciseDB.DUMBBELL_ROW, level, estimatedRMs, 'secondary'),

          // 下背
          createExerciseConfig(ExerciseDB.DEADLIFT, level, estimatedRMs, 'primary')
        ]
      },
      shoulders: {
        name: '肩日',
        description: '三角肌三束全面发展',
        duration: 50,
        exercises: [
          // 前束
          createExerciseConfig(ExerciseDB.OVERHEAD_PRESS, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.FRONT_RAISE, level, estimatedRMs, 'isolation'),

          // 中束
          createExerciseConfig(ExerciseDB.DUMBBELL_SHOULDER_PRESS, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.LATERAL_RAISE, level, estimatedRMs, 'isolation'),

          // 后束
          createExerciseConfig(ExerciseDB.FACE_PULL, level, estimatedRMs, 'isolation')
        ]
      },
      arms: {
        name: '臂日',
        description: '肱二头肌 + 肱三头肌',
        duration: 50,
        exercises: [
          // 三头
          createExerciseConfig(ExerciseDB.CLOSE_GRIP_BENCH, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.TRICEP_PUSHODOWN, level, estimatedRMs, 'isolation'),
          createExerciseConfig(ExerciseDB.OVERHEAD_TRICEP_EXTENSION, level, estimatedRMs, 'isolation'),

          // 二头
          createExerciseConfig(ExerciseDB.BARBELL_CURL, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.DUMBBELL_CURL, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.HAMMER_CURL, level, estimatedRMs, 'isolation'),
          createExerciseConfig(ExerciseDB.PREACHER_CURL, level, estimatedRMs, 'isolation')
        ]
      },
      legs: {
        name: '腿日',
        description: '腿部完全训练',
        duration: 75,
        exercises: [
          // 股四头肌
          createExerciseConfig(ExerciseDB.SQUAT, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.FRONT_SQUAT, level, estimatedRMs, 'secondary'),
          createExerciseConfig(ExerciseDB.LEG_PRESS, level, estimatedRMs, 'secondary'),
          createExerciseConfig(ExerciseDB.LEG_EXTENSION, level, estimatedRMs, 'isolation'),
          createExerciseConfig(ExerciseDB.WALKING_LUNGE, level, estimatedRMs, 'accessory'),

          // 腘绳肌/臀部
          createExerciseConfig(ExerciseDB.ROMANIAN_DEADLIFT, level, estimatedRMs, 'primary'),
          createExerciseConfig(ExerciseDB.LEG_CURL, level, estimatedRMs, 'isolation'),
          createExerciseConfig(ExerciseDB.HIP_THRUST, level, estimatedRMs, 'secondary'),

          // 小腿
          createExerciseConfig(ExerciseDB.STANDING_CALF_RAISE, level, estimatedRMs, 'isolation')
        ]
      }
    }
  };

  return plan;
}

/**
 * 创建动作配置
 */
function createExerciseConfig(exerciseDef, level, estimatedRMs, priority, isIsometric = false) {
  const intensity = IntensityParams[level];
  const rmKey = exerciseDef.id.toLowerCase();
  const estimatedRM = estimatedRMs[rmKey] || estimatedRMs['default'] || 40;

  // 根据优先级调整组数和强度
  let sets = intensity.setsPerExercise;
  let intensityPercent = intensity.intensityPercent;
  let reps = intensity.repsRange;

  switch (priority) {
    case 'primary':
      sets = Math.min(sets + 1, 5);
      intensityPercent += 0.05;
      break;
    case 'secondary':
      // 保持默认
      break;
    case 'isolation':
      sets = Math.max(sets - 1, 2);
      intensityPercent -= 0.05;
      reps = { min: reps.min + 2, max: reps.max + 3 };
      break;
    case 'accessory':
      sets = 2;
      reps = { min: 12, max: 15 };
      break;
  }

  // 计算工作重量
  const workingWeight = calculateWorkingWeight(estimatedRM, intensityPercent);

  // 调整到实际可用的重量（假设健身房有2.5kg的配重片）
  const adjustedWeight = Math.round(workingWeight / 2.5) * 2.5;

  return {
    exerciseId: exerciseDef.id,
    name: exerciseDef.name,
    equipment: exerciseDef.equipment,
    priority: priority,
    sets: sets,
    reps: isIsometric ? null : reps.max,
    time: isIsometric ? 45 : null, // 等长收缩时间（秒）
    weight: adjustedWeight,
    targetRM: estimatedRM,
    intensityPercent: Math.round(intensityPercent * 100),
    restSeconds: priority === 'primary' ? intensity.restSeconds + 30 : intensity.restSeconds,
    tips: exerciseDef.tips,
    gifUrl: exerciseDef.gifUrl,
    targetMuscles: exerciseDef.targetMuscles
  };
}

/**
 * 获取今日训练
 */
export function getTodayWorkout(plan, workoutHistory = []) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=周日, 1=周一...

  // 将周日视为第7天
  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=周一, 6=周日

  const todayKey = plan.schedule[adjustedDay];

  if (todayKey === 'rest') {
    return {
      type: 'rest',
      name: '休息日',
      description: '恢复是训练的一部分，保证充足睡眠和营养'
    };
  }

  const workout = plan.days[todayKey];

  // 检查是否已经完成今日训练
  const todayStr = today.toISOString().split('T')[0];
  const completedToday = workoutHistory.some(h =>
    h.date === todayStr && h.workoutType === todayKey
  );

  return {
    type: todayKey,
    ...workout,
    completed: completedToday,
    date: todayStr
  };
}

/**
 * 获取本周训练进度
 */
export function getWeekProgress(plan, workoutHistory) {
  const today = new Date();
  const currentDay = today.getDay();
  const adjustedDay = currentDay === 0 ? 6 : currentDay - 1;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - adjustedDay);

  const progress = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayKey = plan.schedule[i];

    const isCompleted = workoutHistory.some(h => h.date === dateStr);
    const isToday = i === adjustedDay;

    progress.push({
      day: ['一', '二', '三', '四', '五', '六', '日'][i],
      type: dayKey,
      completed: isCompleted,
      isToday: isToday,
      name: dayKey === 'rest' ? '休' : plan.days[dayKey]?.name?.charAt(0) || '?'
    });
  }

  return progress;
}

/**
 * 根据历史记录自动调整计划（渐进超负荷）
 */
export function autoAdjustPlan(plan, workoutHistory, userProfile) {
  const adjustedPlan = JSON.parse(JSON.stringify(plan)); // 深拷贝

  // 获取最近4周的训练记录
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentHistory = workoutHistory.filter(h =>
    new Date(h.date) >= fourWeeksAgo
  );

  // 遍历每个训练日
  Object.keys(adjustedPlan.days).forEach(dayKey => {
    const day = adjustedPlan.days[dayKey];

    day.exercises.forEach(exercise => {
      // 获取该动作的历史记录
      const exerciseHistory = recentHistory
        .flatMap(h => h.exercises || [])
        .filter(e => e.exerciseId === exercise.exerciseId);

      if (exerciseHistory.length >= 2) {
        // 检查连续完成次数
        const completedCount = exerciseHistory.filter(e =>
          e.setsCompleted >= e.setsTarget
        ).length;

        // 如果连续完成目标，建议增加重量
        const threshold = userProfile.level === Level.ADVANCED ? 3 : 2;

        if (completedCount >= threshold) {
          const increment = exercise.equipment === '杠铃' &&
            (exercise.exerciseId.includes('squat') ||
             exercise.exerciseId.includes('deadlift') ||
             exercise.exerciseId.includes('press'))
            ? 5.0  // 下肢动作增加5kg
            : 2.5; // 上肢动作增加2.5kg

          exercise.weight += increment;
          exercise.recommendation = `建议增重至 ${exercise.weight}kg`;
        }
      }
    });
  });

  return adjustedPlan;
}

/**
 * 计算预计训练时长
 */
export function estimateWorkoutDuration(workout) {
  if (!workout.exercises) return 0;

  let totalMinutes = 10; // 热身

  workout.exercises.forEach(ex => {
    // 每组时间估算
    const timePerSet = ex.time
      ? ex.time + 30 // 等长动作
      : 30 + (ex.reps || 10) * 3; // 普通动作

    // 休息时间
    const restTime = ex.restSeconds || 90;

    // 该动作总时间
    const exerciseTime = ex.sets * (timePerSet + restTime) / 60;
    totalMinutes += exerciseTime;
  });

  totalMinutes += 5; // 拉伸

  return Math.round(totalMinutes);
}
