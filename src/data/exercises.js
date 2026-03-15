/**
 * 午间铁馆 - 动作库
 * 包含所有训练动作的详细信息
 */

import { ExerciseCategory, MuscleGroup } from '../types/index.js';

export const ExerciseDB = {
  // ========== 推日动作 ==========
  // 胸部
  BARBELL_BENCH_PRESS: {
    id: 'barbell_bench_press',
    name: '杠铃卧推',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.CHEST_MIDDLE, MuscleGroup.SHOULDERS_FRONT, MuscleGroup.TRICEPS],
    equipment: '杠铃',
    difficulty: 3,
    gifUrl: '/exercises/bench_press.gif',
    tips: ['肩胛骨下沉后缩', '手腕保持中立', '下放至胸口位置', '推起时呼气'],
    alternativeIds: ['dumbbell_bench_press', 'machine_chest_press']
  },
  INCLINE_BARBELL_PRESS: {
    id: 'incline_barbell_press',
    name: '上斜杠铃卧推',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.CHEST_UPPER, MuscleGroup.SHOULDERS_FRONT, MuscleGroup.TRICEPS],
    equipment: '杠铃',
    difficulty: 3,
    gifUrl: '/exercises/incline_press.gif',
    tips: ['斜板角度30-45度', '杠铃下放至锁骨下方', '控制离心阶段'],
    alternativeIds: ['incline_dumbbell_press', 'incline_machine_press']
  },
  DUMBBELL_BENCH_PRESS: {
    id: 'dumbbell_bench_press',
    name: '哑铃卧推',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.CHEST_MIDDLE, MuscleGroup.SHOULDERS_FRONT, MuscleGroup.TRICEPS],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/dumbbell_press.gif',
    tips: ['哑铃轨迹呈弧形', '底部充分拉伸', '顶端轻微内收'],
    alternativeIds: ['barbell_bench_press', 'machine_chest_press']
  },
  INCLINE_DUMBBELL_PRESS: {
    id: 'incline_dumbbell_press',
    name: '上斜哑铃卧推',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.CHEST_UPPER, MuscleGroup.SHOULDERS_FRONT, MuscleGroup.TRICEPS],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/incline_dumbbell.gif',
    tips: ['更大活动范围', '感受上胸拉伸'],
    alternativeIds: ['incline_barbell_press', 'cable_fly']
  },
  CABLE_FLY: {
    id: 'cable_fly',
    name: '绳索夹胸',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.CHEST_MIDDLE],
    equipment: '绳索',
    difficulty: 2,
    gifUrl: '/exercises/cable_fly.gif',
    tips: ['肘部微屈固定', '感受胸部收缩', '控制回放'],
    alternativeIds: ['dumbbell_fly', 'pec_deck']
  },
  DIP: {
    id: 'dip',
    name: '双杠臂屈伸',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.CHEST_LOWER, MuscleGroup.TRICEPS],
    equipment: '双杠',
    difficulty: 3,
    gifUrl: '/exercises/dip.gif',
    tips: ['身体前倾侧重胸部', '下放至大臂平行', '窄握侧重三头'],
    alternativeIds: ['assisted_dip', 'machine_dip']
  },

  // 肩部
  OVERHEAD_PRESS: {
    id: 'overhead_press',
    name: '杠铃推举',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.SHOULDERS_FRONT, MuscleGroup.SHOULDERS_SIDE, MuscleGroup.TRICEPS],
    equipment: '杠铃',
    difficulty: 3,
    gifUrl: '/exercises/overhead_press.gif',
    tips: ['核心收紧', '杠铃沿面部上下', '不要过度后仰'],
    alternativeIds: ['dumbbell_overhead_press', 'machine_shoulder_press']
  },
  DUMBBELL_SHOULDER_PRESS: {
    id: 'dumbbell_shoulder_press',
    name: '哑铃推举',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.SHOULDERS_FRONT, MuscleGroup.SHOULDERS_SIDE, MuscleGroup.TRICEPS],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/dumbbell_press_shoulder.gif',
    tips: ['掌心相对或朝前', '哑铃在头顶汇合', '控制离心'],
    alternativeIds: ['overhead_press', 'arnold_press']
  },
  LATERAL_RAISE: {
    id: 'lateral_raise',
    name: '哑铃侧平举',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.SHOULDERS_SIDE],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/lateral_raise.gif',
    tips: ['肘部微屈', '大臂带动小臂', '避免耸肩'],
    alternativeIds: ['cable_lateral_raise', 'machine_lateral_raise']
  },
  FRONT_RAISE: {
    id: 'front_raise',
    name: '哑铃前平举',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.SHOULDERS_FRONT],
    equipment: '哑铃',
    difficulty: 1,
    gifUrl: '/exercises/front_raise.gif',
    tips: ['交替或同时', '控制摆动'],
    alternativeIds: ['plate_front_raise', 'cable_front_raise']
  },
  FACE_PULL: {
    id: 'face_pull',
    name: '绳索面拉',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.SHOULDERS_REAR, MuscleGroup.BACK_RHOMBOIDS],
    equipment: '绳索',
    difficulty: 2,
    gifUrl: '/exercises/face_pull.gif',
    tips: ['拉向面部两侧', '外旋手臂', '挤压肩胛'],
    alternativeIds: ['reverse_pec_deck', 'bent_over_fly']
  },

  // 三头
  TRICEP_PUSHODOWN: {
    id: 'tricep_pushdown',
    name: '绳索下压',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.TRICEPS],
    equipment: '绳索',
    difficulty: 1,
    gifUrl: '/exercises/pushdown.gif',
    tips: ['上臂固定', '手腕保持中立', '底部充分收缩'],
    alternativeIds: ['straight_bar_pushdown', 'v_bar_pushdown']
  },
  OVERHEAD_TRICEP_EXTENSION: {
    id: 'overhead_tricep_extension',
    name: '哑铃颈后臂屈伸',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.TRICEPS],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/overhead_extension.gif',
    tips: ['控制下放深度', '感受长头拉伸'],
    alternativeIds: ['rope_overhead_extension', 'cable_overhead_extension']
  },
  CLOSE_GRIP_BENCH: {
    id: 'close_grip_bench',
    name: '窄距卧推',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.TRICEPS, MuscleGroup.CHEST_MIDDLE],
    equipment: '杠铃',
    difficulty: 3,
    gifUrl: '/exercises/close_grip.gif',
    tips: ['握距与肩同宽', '保持手肘内收', '触胸位置稍低'],
    alternativeIds: ['close_grip_dumbbell', 'floor_press']
  },

  // ========== 拉日动作 ==========
  // 背部
  PULL_UP: {
    id: 'pull_up',
    name: '引体向上',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BACK_LATS, MuscleGroup.BICEPS],
    equipment: '单杠',
    difficulty: 4,
    gifUrl: '/exercises/pull_up.gif',
    tips: ['握距略宽于肩', '启动时沉肩', '拉至下巴过杠'],
    alternativeIds: ['lat_pulldown', 'assisted_pull_up']
  },
  LAT_PULLDOWN: {
    id: 'lat_pulldown',
    name: '高位下拉',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BACK_LATS, MuscleGroup.BICEPS],
    equipment: '器械',
    difficulty: 2,
    gifUrl: '/exercises/lat_pulldown.gif',
    tips: ['挺胸抬头', '拉至锁骨位置', '控制回放'],
    alternativeIds: ['pull_up', 'single_arm_pulldown']
  },
  BARBELL_ROW: {
    id: 'barbell_row',
    name: '杠铃划船',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BACK_LATS, MuscleGroup.BACK_TRAPS, MuscleGroup.BICEPS],
    equipment: '杠铃',
    difficulty: 3,
    gifUrl: '/exercises/barbell_row.gif',
    tips: ['背部平直', '拉向腹部', '挤压肩胛骨'],
    alternativeIds: ['dumbbell_row', 't_bar_row']
  },
  DUMBBELL_ROW: {
    id: 'dumbbell_row',
    name: '单臂哑铃划船',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BACK_LATS, MuscleGroup.BICEPS],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/dumbbell_row.gif',
    tips: ['稳定躯干', '充分拉伸和收缩', '避免旋转'],
    alternativeIds: ['cable_row', 'machine_row']
  },
  SEATED_CABLE_ROW: {
    id: 'seated_cable_row',
    name: '坐姿绳索划船',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BACK_LATS, MuscleGroup.BACK_RHOMBOIDS],
    equipment: '绳索',
    difficulty: 2,
    gifUrl: '/exercises/cable_row.gif',
    tips: ['膝盖微屈', '拉向腹部', '控制离心'],
    alternativeIds: ['machine_row', 'chest_supported_row']
  },
  DEADLIFT: {
    id: 'deadlift',
    name: '硬拉',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BACK_LOWER, MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.BACK_TRAPS],
    equipment: '杠铃',
    difficulty: 4,
    gifUrl: '/exercises/deadlift.gif',
    tips: ['背部挺直', '启动时臀部下沉', '杠铃贴近身体'],
    alternativeIds: ['romanian_deadlift', 'sumo_deadlift']
  },
  PULLOVER: {
    id: 'pullover',
    name: '哑铃直臂上拉',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.BACK_LATS, MuscleGroup.CHEST_UPPER],
    equipment: '哑铃',
    difficulty: 3,
    gifUrl: '/exercises/pullover.gif',
    tips: ['肘部微屈', '感受背阔肌拉伸', '控制动作'],
    alternativeIds: ['cable_pullover', 'machine_pullover']
  },

  // 二头
  BARBELL_CURL: {
    id: 'barbell_curl',
    name: '杠铃弯举',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
    equipment: '杠铃',
    difficulty: 2,
    gifUrl: '/exercises/barbell_curl.gif',
    tips: ['上臂固定', '顶峰收缩', '控制下放'],
    alternativeIds: ['ez_bar_curl', 'dumbbell_curl']
  },
  DUMBBELL_CURL: {
    id: 'dumbbell_curl',
    name: '哑铃弯举',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
    equipment: '哑铃',
    difficulty: 1,
    gifUrl: '/exercises/dumbbell_curl.gif',
    tips: ['掌心向上', '交替或同时', '控制摆动'],
    alternativeIds: ['hammer_curl', 'incline_curl']
  },
  HAMMER_CURL: {
    id: 'hammer_curl',
    name: '锤式弯举',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/hammer_curl.gif',
    tips: ['掌心相对', '侧重肱肌和肱桡肌'],
    alternativeIds: ['rope_curl', 'cross_body_curl']
  },
  PREACHER_CURL: {
    id: 'preacher_curl',
    name: '牧师凳弯举',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.BICEPS],
    equipment: '器械',
    difficulty: 2,
    gifUrl: '/exercises/preacher_curl.gif',
    tips: ['固定大臂', '全程控制', '避免借力'],
    alternativeIds: ['spider_curl', 'concentration_curl']
  },

  // ========== 腿日动作 ==========
  SQUAT: {
    id: 'squat',
    name: '杠铃深蹲',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.QUADS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: '杠铃',
    difficulty: 4,
    gifUrl: '/exercises/squat.gif',
    tips: ['脚距略宽于肩', '脚尖外展', '蹲至大腿平行', '膝盖对准脚尖'],
    alternativeIds: ['front_squat', 'hack_squat']
  },
  FRONT_SQUAT: {
    id: 'front_squat',
    name: '颈前深蹲',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.QUADS, MuscleGroup.CORE],
    equipment: '杠铃',
    difficulty: 4,
    gifUrl: '/exercises/front_squat.gif',
    tips: ['杠铃架在三角肌前束', '肘部抬高', '躯干更直立'],
    alternativeIds: ['goblet_squat', 'zercher_squat']
  },
  LEG_PRESS: {
    id: 'leg_press',
    name: '腿举',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.QUADS, MuscleGroup.GLUTES],
    equipment: '器械',
    difficulty: 2,
    gifUrl: '/exercises/leg_press.gif',
    tips: ['调整座椅位置', '下放时控制', '不要锁死膝盖'],
    alternativeIds: ['hack_squat', 'v_squat']
  },
  LEG_EXTENSION: {
    id: 'leg_extension',
    name: '腿屈伸',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.QUADS],
    equipment: '器械',
    difficulty: 1,
    gifUrl: '/exercises/leg_extension.gif',
    tips: ['调节靠垫', '顶峰收缩', '控制回放'],
    alternativeIds: ['sissy_squat', 'spanish_squat']
  },
  ROMANIAN_DEADLIFT: {
    id: 'romanian_deadlift',
    name: '罗马尼亚硬拉',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.BACK_LOWER],
    equipment: '杠铃',
    difficulty: 3,
    gifUrl: '/exercises/romanian_deadlift.gif',
    tips: ['膝盖微屈', '臀部后推', '感受腘绳肌拉伸'],
    alternativeIds: ['stiff_leg_deadlift', 'good_morning']
  },
  LEG_CURL: {
    id: 'leg_curl',
    name: '腿弯举',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.HAMSTRINGS],
    equipment: '器械',
    difficulty: 1,
    gifUrl: '/exercises/leg_curl.gif',
    tips: ['调整靠垫', '充分收缩', '控制回放'],
    alternativeIds: ['seated_leg_curl', 'nordic_curl']
  },
  WALKING_LUNGE: {
    id: 'walking_lunge',
    name: '箭步蹲',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.QUADS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: '哑铃',
    difficulty: 2,
    gifUrl: '/exercises/lunge.gif',
    tips: ['步幅适中', '后膝接近地面', '躯干直立'],
    alternativeIds: ['reverse_lunge', 'bulgarian_split_squat']
  },
  HIP_THRUST: {
    id: 'hip_thrust',
    name: '臀推',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: '杠铃',
    difficulty: 3,
    gifUrl: '/exercises/hip_thrust.gif',
    tips: ['肩胛骨靠在凳边', '顶峰收缩2秒', '避免腰椎超伸'],
    alternativeIds: ['glute_bridge', 'cable_pull_through']
  },
  STANDING_CALF_RAISE: {
    id: 'standing_calf_raise',
    name: '站姿提踵',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.CALVES],
    equipment: '器械',
    difficulty: 1,
    gifUrl: '/exercises/calf_raise.gif',
    tips: ['全程控制', '底部充分拉伸', '顶峰收缩'],
    alternativeIds: ['seated_calf_raise', 'donkey_calf_raise']
  },

  // ========== 核心动作 ==========
  PLANK: {
    id: 'plank',
    name: '平板支撑',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.CORE, MuscleGroup.ABS],
    equipment: '自重',
    difficulty: 1,
    gifUrl: '/exercises/plank.gif',
    tips: ['身体成直线', '核心收紧', '正常呼吸'],
    alternativeIds: ['side_plank', 'plank_variation']
  },
  HANGING_LEG_RAISE: {
    id: 'hanging_leg_raise',
    name: '悬垂举腿',
    category: ExerciseCategory.COMPOUND,
    targetMuscles: [MuscleGroup.ABS, MuscleGroup.CORE],
    equipment: '单杠',
    difficulty: 3,
    gifUrl: '/exercises/leg_raise.gif',
    tips: ['避免摆动', '骨盆后倾', '控制动作'],
    alternativeIds: ['lying_leg_raise', 'cable_crunch']
  },
  CABLE_CRUNCH: {
    id: 'cable_crunch',
    name: '绳索卷腹',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.ABS],
    equipment: '绳索',
    difficulty: 2,
    gifUrl: '/exercises/cable_crunch.gif',
    tips: ['脊柱弯曲', '挤压腹肌', '控制回放'],
    alternativeIds: ['machine_crunch', 'decline_crunch']
  },
  RUSSIAN_TWIST: {
    id: 'russian_twist',
    name: '俄罗斯转体',
    category: ExerciseCategory.ISOLATION,
    targetMuscles: [MuscleGroup.OBLIQUES, MuscleGroup.CORE],
    equipment: '哑铃/药球',
    difficulty: 2,
    gifUrl: '/exercises/russian_twist.gif',
    tips: ['脚可悬空或踩地', '控制旋转', '避免借力'],
    alternativeIds: ['side_plank', 'woodchop']
  }
};

// 动作查找辅助函数
export function getExerciseById(id) {
  return ExerciseDB[id.toUpperCase()] || null;
}

// 根据目标肌群获取动作
export function getExercisesByMuscle(muscleGroup) {
  return Object.values(ExerciseDB).filter(ex =>
    ex.targetMuscles.includes(muscleGroup)
  );
}

// 根据设备获取动作
export function getExercisesByEquipment(equipment) {
  return Object.values(ExerciseDB).filter(ex =>
    ex.equipment === equipment
  );
}
