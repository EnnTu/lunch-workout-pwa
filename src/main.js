/**
 * 午间铁馆 - 主入口 (优化版)
 */

import { SplitType, Level, FitnessTests } from './types/index.js';
import { ExerciseDB } from './data/exercises.js';
import {
  generateTrainingPlan,
  getTodayWorkout,
  getWeekProgress,
  estimateWorkoutDuration
} from './utils/trainingPlan.js';
import { estimateOneRMs } from './utils/oneRM.js';
import {
  UserProfile,
  WorkoutHistory,
  TrainingPlan,
  Stats,
  initDB
} from './utils/storage.js';
import { voiceCoach, RestTimer, WorkoutTimer } from './utils/voice.js';
import {
  drawLineChart,
  drawBarChart,
  generateProgressiveOverloadData,
  generateWeeklyVolumeData
} from './utils/charts.js';
import { WEEK_DAYS, DEFAULT_USER, WORKOUT_CONSTANTS } from './utils/constants.js';

// ===== DOM 元素缓存 =====
const DOM = {
  // 页面元素
  loading: null,
  screens: {},
  navItems: [],

  // 首页元素
  currentDate: null,
  weekDay: null,
  todayWorkoutCard: null,
  splitType: null,
  estimatedTime: null,
  workoutTitle: null,
  workoutDesc: null,
  startWorkoutBtn: null,
  weekProgress: null,
  monthWorkouts: null,
  monthVolume: null,
  monthPrs: null,

  // 训练页面元素
  backBtn: null,
  workoutSplitTitle: null,
  workoutTimer: null,
  restTimerBtn: null,
  voiceToggle: null,
  exerciseList: null,
  finishWorkoutBtn: null,

  // 弹窗元素
  restModal: null,
  restTimerDisplay: null,
  skipRest: null
};

// ===== 全局状态 =====
const AppState = {
  currentPlan: null,
  currentUser: null,
  workoutHistory: [],
  activeWorkout: null,
  workoutTimer: null,
  restTimer: null
};

// ===== 初始化 =====

/**
 * 初始化应用
 */
async function initApp() {
  try {
    // 缓存 DOM 元素
    cacheDOMElements();

    // 隐藏加载页
    setTimeout(() => {
      DOM.loading?.classList.add('hidden');
    }, 500);

    // 注册 Service Worker
    await registerServiceWorker();

    // 初始化数据库
    await initDB();

    // 加载用户数据
    await loadUserData();

    // 绑定事件
    bindEvents();

    // 渲染首页
    renderHome();
  } catch (error) {
    console.error('应用初始化失败:', error);
    alert('应用加载失败，请刷新页面重试');
  }
}

/**
 * 缓存 DOM 元素引用
 */
function cacheDOMElements() {
  DOM.loading = document.getElementById('loading');

  // 页面
  ['home', 'workout', 'stats', 'team', 'settings'].forEach(screen => {
    DOM.screens[screen] = document.getElementById(`screen-${screen}`);
  });

  // 导航
  DOM.navItems = document.querySelectorAll('.nav-item');

  // 首页
  DOM.currentDate = document.getElementById('current-date');
  DOM.weekDay = document.getElementById('week-day');
  DOM.todayWorkoutCard = document.getElementById('today-workout-card');
  DOM.splitType = document.getElementById('split-type');
  DOM.estimatedTime = document.getElementById('estimated-time');
  DOM.workoutTitle = document.getElementById('workout-title');
  DOM.workoutDesc = document.getElementById('workout-desc');
  DOM.startWorkoutBtn = document.getElementById('start-workout-btn');
  DOM.weekProgress = document.getElementById('week-progress');
  DOM.monthWorkouts = document.getElementById('month-workouts');
  DOM.monthVolume = document.getElementById('month-volume');
  DOM.monthPrs = document.getElementById('month-prs');

  // 训练页面
  DOM.backBtn = document.getElementById('back-btn');
  DOM.workoutSplitTitle = document.getElementById('workout-split-title');
  DOM.workoutTimer = document.getElementById('workout-timer');
  DOM.restTimerBtn = document.getElementById('rest-timer-btn');
  DOM.voiceToggle = document.getElementById('voice-toggle');
  DOM.exerciseList = document.getElementById('exercise-list');
  DOM.finishWorkoutBtn = document.getElementById('finish-workout-btn');

  // 弹窗
  DOM.restModal = document.getElementById('rest-modal');
  DOM.restTimerDisplay = document.getElementById('rest-timer');
  DOM.skipRest = document.getElementById('skip-rest');
}

/**
 * 注册 Service Worker
 */
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker 注册成功:', registration);
  } catch (error) {
    console.log('Service Worker 注册失败:', error);
  }
}

/**
 * 加载用户数据
 */
async function loadUserData() {
  AppState.currentUser = await UserProfile.get() || { ...DEFAULT_USER };
  AppState.workoutHistory = await WorkoutHistory.getAll();
  AppState.currentPlan = await TrainingPlan.get();

  // 如果没有用户档案，保存默认设置
  if (!await UserProfile.get()) {
    AppState.currentUser.createdAt = new Date().toISOString();
    await UserProfile.save(AppState.currentUser);
  }

  // 如果没有训练计划，生成默认计划
  if (!AppState.currentPlan) {
    await regeneratePlan();
  }
}

/**
 * 重新生成训练计划
 */
async function regeneratePlan() {
  const estimatedRMs = estimateOneRMs(
    AppState.currentUser.fitnessTests,
    AppState.currentUser.bodyWeight
  );

  AppState.currentPlan = generateTrainingPlan({
    splitType: AppState.currentUser.splitType,
    level: AppState.currentUser.level,
    estimatedRMs,
    bodyWeight: AppState.currentUser.bodyWeight
  });

  await TrainingPlan.save(AppState.currentPlan);
}

// ===== 事件绑定 =====

/**
 * 绑定事件
 */
function bindEvents() {
  // 底部导航切换
  DOM.navItems.forEach(item => {
    item.addEventListener('click', handleNavClick);
  });

  // 返回按钮
  DOM.backBtn?.addEventListener('click', () => switchScreen('home'));

  // 开始训练按钮
  DOM.startWorkoutBtn?.addEventListener('click', startWorkout);

  // 休息计时器
  DOM.restTimerBtn?.addEventListener('click', () => showRestTimer());
  DOM.skipRest?.addEventListener('click', hideRestTimer);

  // 语音开关
  DOM.voiceToggle?.addEventListener('click', toggleVoice);

  // 完成训练按钮
  DOM.finishWorkoutBtn?.addEventListener('click', finishWorkout);
}

/**
 * 处理导航点击
 */
function handleNavClick(event) {
  const item = event.currentTarget;
  const screen = item.dataset.screen;
  switchScreen(screen);

  // 更新导航状态
  DOM.navItems.forEach(i => i.classList.remove('active'));
  item.classList.add('active');
}

/**
 * 切换语音
 */
function toggleVoice() {
  voiceCoach.setEnabled(!voiceCoach.enabled);
  if (DOM.voiceToggle) {
    DOM.voiceToggle.textContent = voiceCoach.enabled ? '🔊' : '🔇';
  }
}

// ===== 页面切换 =====

/**
 * 切换页面
 */
function switchScreen(screenName) {
  Object.values(DOM.screens).forEach(s => s?.classList.remove('active'));
  DOM.screens[screenName]?.classList.add('active');

  // 渲染对应页面内容
  const renderers = {
    home: renderHome,
    workout: renderWorkout,
    stats: renderStats,
    team: renderTeam,
    settings: renderSettings
  };

  renderers[screenName]?.();
}

// ===== 首页渲染 =====

/**
 * 渲染首页
 */
async function renderHome() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  if (DOM.currentDate) {
    DOM.currentDate.textContent = dateStr;
  }

  // 获取今日训练
  const todayWorkout = getTodayWorkout(AppState.currentPlan, AppState.workoutHistory);
  const weekProgress = getWeekProgress(AppState.currentPlan, AppState.workoutHistory);

  // 更新本周第几天
  const completedThisWeek = weekProgress.filter(d => d.completed).length;
  if (DOM.weekDay) {
    DOM.weekDay.textContent = completedThisWeek;
  }

  // 更新今日训练卡片
  renderTodayWorkoutCard(todayWorkout);

  // 渲染本周进度
  renderWeekProgress(weekProgress);

  // 更新月度统计
  await renderMonthlyStats();
}

/**
 * 渲染今日训练卡片
 */
function renderTodayWorkoutCard(todayWorkout) {
  if (!DOM.splitType || !DOM.workoutTitle) return;

  if (todayWorkout.type === 'rest') {
    DOM.splitType.textContent = '休息日';
    DOM.splitType.style.background = '#a0a0a0';
    DOM.workoutTitle.textContent = '今日休息';
    DOM.workoutDesc.textContent = '恢复也是训练的一部分，保证充足睡眠和营养';
    DOM.estimatedTime.textContent = '';
    DOM.startWorkoutBtn.style.display = 'none';
  } else {
    DOM.splitType.textContent = todayWorkout.name;
    DOM.splitType.style.background = '#e94560';
    DOM.workoutTitle.textContent = todayWorkout.name;
    DOM.workoutDesc.textContent = todayWorkout.description;
    DOM.estimatedTime.textContent = `预计 ${estimateWorkoutDuration(todayWorkout)} 分钟`;
    DOM.startWorkoutBtn.style.display = 'block';
  }
}

/**
 * 渲染本周进度
 */
function renderWeekProgress(weekProgress) {
  if (!DOM.weekProgress) return;

  const fragment = document.createDocumentFragment();

  weekProgress.forEach(d => {
    const dayEl = document.createElement('div');
    dayEl.className = `progress-day ${d.completed ? 'completed' : ''} ${d.isToday ? 'today' : ''}`;
    dayEl.innerHTML = `
      <span style="color: ${d.isToday ? 'var(--success)' : 'inherit'};">${d.day}</span>
      <span style="font-size: 10px; margin-top: 2px;">${d.name}</span>
    `;
    fragment.appendChild(dayEl);
  });

  DOM.weekProgress.innerHTML = '';
  DOM.weekProgress.appendChild(fragment);
}

/**
 * 渲染月度统计
 */
async function renderMonthlyStats() {
  if (!DOM.monthWorkouts || !DOM.monthVolume || !DOM.monthPrs) return;

  const monthlyStats = await Stats.getMonthlyStats();

  DOM.monthWorkouts.textContent = monthlyStats.workouts;
  DOM.monthVolume.textContent = formatVolume(monthlyStats.volume);
  DOM.monthPrs.textContent = monthlyStats.newPRs;
}

/**
 * 格式化容量显示
 */
function formatVolume(volume) {
  return volume > 1000 ? `${(volume / 1000).toFixed(1)}k` : volume;
}

// ===== 训练功能 =====

/**
 * 开始训练
 */
function startWorkout() {
  const todayWorkout = getTodayWorkout(AppState.currentPlan, AppState.workoutHistory);

  if (todayWorkout.type === 'rest') return;

  AppState.activeWorkout = createActiveWorkout(todayWorkout);

  // 切换到训练页面
  switchScreen('workout');
  document.querySelector('.nav-item[data-screen="workout"]')?.classList.add('active');

  // 启动计时器
  startWorkoutTimer();

  // 语音播报
  voiceCoach.announceWorkoutStart(todayWorkout.name);

  // 渲染训练内容
  renderActiveWorkout();
}

/**
 * 创建活跃训练对象
 */
function createActiveWorkout(todayWorkout) {
  return {
    date: new Date().toISOString().split('T')[0],
    workoutType: todayWorkout.type,
    name: todayWorkout.name,
    startTime: Date.now(),
    exercises: todayWorkout.exercises.map(e => ({
      ...e,
      setsCompleted: 0,
      sets: Array.from({ length: e.sets }, (_, i) => ({
        setNumber: i + 1,
        weight: e.weight,
        reps: e.reps,
        completed: false
      }))
    })),
    totalVolume: 0,
    duration: 0
  };
}

/**
 * 启动训练计时器
 */
function startWorkoutTimer() {
  if (AppState.workoutTimer) {
    AppState.workoutTimer.destroy();
  }

  AppState.workoutTimer = new WorkoutTimer((elapsed) => {
    if (DOM.workoutTimer) {
      DOM.workoutTimer.textContent = formatTime(elapsed);
    }
  });

  AppState.workoutTimer.start();
}

/**
 * 格式化时间显示
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 渲染训练页面（空状态）
 */
function renderWorkout() {
  if (AppState.activeWorkout) return;

  const todayWorkout = getTodayWorkout(AppState.currentPlan, AppState.workoutHistory);

  if (todayWorkout.type === 'rest') {
    renderRestDayWorkout();
  } else {
    renderWorkoutPreview();
  }

  // 重置计时器显示
  if (DOM.workoutTimer) {
    DOM.workoutTimer.textContent = '00:00';
  }
}

/**
 * 渲染休息日训练页面
 */
function renderRestDayWorkout() {
  if (!DOM.workoutSplitTitle || !DOM.exerciseList) return;

  DOM.workoutSplitTitle.textContent = '休息日';
  DOM.exerciseList.innerHTML = `
    <div class="card" style="text-align: center; padding: 40px;">
      <p style="font-size: 48px; margin-bottom: 16px;">😴</p>
      <h3>今天是休息日</h3>
      <p style="color: var(--text-muted); margin-top: 8px;">恢复也是训练的一部分</p>
    </div>
  `;
}

/**
 * 渲染训练预览
 */
function renderWorkoutPreview() {
  if (!DOM.workoutSplitTitle || !DOM.exerciseList) return;

  const todayWorkout = getTodayWorkout(AppState.currentPlan, AppState.workoutHistory);
  DOM.workoutSplitTitle.textContent = todayWorkout.name;

  DOM.exerciseList.innerHTML = `
    <div class="card" style="text-align: center; padding: 40px;">
      <p style="color: var(--text-muted); margin-bottom: 16px;">点击首页"开始训练"按钮开始今日训练</p>
      <button class="btn" onclick="App.switchScreen('home')">返回首页</button>
    </div>
  `;
}

/**
 * 渲染训练中的动作列表
 */
function renderActiveWorkout() {
  if (!AppState.activeWorkout || !DOM.exerciseList) return;

  DOM.workoutSplitTitle.textContent = AppState.activeWorkout.name;

  const fragment = document.createDocumentFragment();

  AppState.activeWorkout.exercises.forEach((ex, exIndex) => {
    const exerciseEl = createExerciseElement(ex, exIndex);
    fragment.appendChild(exerciseEl);
  });

  DOM.exerciseList.innerHTML = '';
  DOM.exerciseList.appendChild(fragment);
}

/**
 * 创建动作元素
 */
function createExerciseElement(ex, exIndex) {
  const div = document.createElement('div');
  div.className = 'exercise-item';
  div.dataset.exercise = exIndex;

  const repsText = ex.reps || `${ex.time}秒`;
  const weightText = ex.weight || '自重';

  div.innerHTML = `
    <div class="exercise-header">
      <div>
        <div class="exercise-name">${ex.name}</div>
        <div class="exercise-target">${ex.sets.length}组 × ${repsText} | ${weightText}kg</div>
      </div>
      <button class="btn btn-secondary demo-btn" data-exercise-id="${ex.exerciseId}" style="width: auto; padding: 8px 12px; font-size: 12px;">
        演示
      </button>
    </div>
    <div class="sets-container">
      ${ex.sets.map((set, setIndex) => createSetRowHTML(set, exIndex, setIndex)).join('')}
    </div>
  `;

  // 绑定演示按钮事件
  const demoBtn = div.querySelector('.demo-btn');
  demoBtn.addEventListener('click', () => showExerciseDemo(ex.exerciseId));

  // 绑定输入框事件
  const inputs = div.querySelectorAll('.set-input');
  inputs.forEach(input => {
    input.addEventListener('change', handleSetInputChange);
  });

  // 绑定完成按钮事件
  const checkBtns = div.querySelectorAll('.set-check');
  checkBtns.forEach(btn => {
    btn.addEventListener('click', handleSetComplete);
  });

  return div;
}

/**
 * 创建组行 HTML
 */
function createSetRowHTML(set, exIndex, setIndex) {
  return `
    <div class="set-row" data-set="${setIndex}" data-exercise="${exIndex}">
      <span class="set-number">${set.setNumber}</span>
      <input type="number" class="set-input" placeholder="重量" value="${set.weight || ''}" data-field="weight">
      <span style="color: var(--text-muted);">kg</span>
      <input type="number" class="set-input" placeholder="次数" value="${set.reps || ''}" data-field="reps">
      <span style="color: var(--text-muted);">次</span>
      <button class="set-check ${set.completed ? 'completed' : ''}" data-exercise="${exIndex}" data-set="${setIndex}">
        ${set.completed ? '✓' : ''}
      </button>
    </div>
  `;
}

/**
 * 处理组输入变更
 */
function handleSetInputChange(event) {
  const input = event.target;
  const row = input.closest('.set-row');
  const exIndex = parseInt(row.dataset.exercise);
  const setIndex = parseInt(row.dataset.set);
  const field = input.dataset.field;
  const value = parseFloat(input.value) || 0;

  if (AppState.activeWorkout) {
    AppState.activeWorkout.exercises[exIndex].sets[setIndex][field] = value;
  }
}

/**
 * 处理组完成
 */
function handleSetComplete(event) {
  const btn = event.currentTarget;
  const exIndex = parseInt(btn.dataset.exercise);
  const setIndex = parseInt(btn.dataset.set);

  if (!AppState.activeWorkout) return;

  const set = AppState.activeWorkout.exercises[exIndex].sets[setIndex];
  set.completed = !set.completed;

  if (set.completed) {
    // 自动开始休息计时
    const restSeconds = AppState.activeWorkout.exercises[exIndex].restSeconds || WORKOUT_CONSTANTS.DEFAULT_REST_SECONDS;
    showRestTimer(restSeconds);

    // 播报下一组
    if (setIndex < AppState.activeWorkout.exercises[exIndex].sets.length - 1) {
      voiceCoach.announceEncouragement();
    }
  }

  renderActiveWorkout();
}

/**
 * 显示动作演示
 */
function showExerciseDemo(exerciseId) {
  const exercise = ExerciseDB[exerciseId.toUpperCase()];
  if (!exercise) return;

  const modal = createModal(exercise);
  document.body.appendChild(modal);
}

/**
 * 创建动作演示弹窗
 */
function createModal(exercise) {
  const modal = document.createElement('div');
  modal.className = 'exercise-modal';
  modal.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2>${exercise.name}</h2>
      <button class="close-modal" style="
        background: none; border: none; color: var(--text); font-size: 24px; cursor: pointer;
      ">✕</button>
    </div>
    <div style="background: var(--light); border-radius: 16px; padding: 20px; margin-bottom: 20px;">
      <div style="height: 200px; background: var(--dark); border-radius: 12px;
        display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
        [${exercise.name} 动作演示 GIF]
      </div>
    </div>
    <div style="background: var(--light); border-radius: 16px; padding: 20px;">
      <h3 style="margin-bottom: 12px;">动作要点</h3>
      <ul style="list-style: none; padding: 0;">
        ${exercise.tips.map(tip => `<li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
          ✓ ${tip}
        </li>`).join('')}
      </ul>
      <p style="margin-top: 16px; color: var(--text-muted);">
        器械: ${exercise.equipment} | 难度: ${'★'.repeat(exercise.difficulty)}
      </p>
    </div>
  `;

  // 样式
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.95); z-index: 300;
    display: flex; flex-direction: column;
    padding: 20px; overflow-y: auto;
  `;

  // 绑定关闭事件
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  return modal;
}

// ===== 休息计时器 =====

/**
 * 显示休息计时器
 */
function showRestTimer(seconds = WORKOUT_CONSTANTS.DEFAULT_REST_SECONDS) {
  if (!DOM.restModal) return;

  DOM.restModal.style.display = 'flex';

  if (AppState.restTimer) {
    AppState.restTimer.destroy();
  }

  AppState.restTimer = new RestTimer(
    seconds,
    (remaining) => {
      if (DOM.restTimerDisplay) {
        DOM.restTimerDisplay.textContent = formatTime(remaining);
      }
    },
    () => {
      hideRestTimer();
    }
  );

  AppState.restTimer.start();
}

/**
 * 隐藏休息计时器
 */
function hideRestTimer() {
  if (!DOM.restModal) return;

  DOM.restModal.style.display = 'none';

  if (AppState.restTimer) {
    AppState.restTimer.destroy();
    AppState.restTimer = null;
  }
}

/**
 * 添加休息时间
 */
function addRestTime(seconds) {
  if (AppState.restTimer) {
    AppState.restTimer.addTime(seconds);
  }
}

// ===== 完成训练 =====

/**
 * 完成训练
 */
async function finishWorkout() {
  if (!AppState.activeWorkout) return;

  // 停止计时器
  if (AppState.workoutTimer) {
    AppState.activeWorkout.duration = AppState.workoutTimer.stop();
  }

  // 计算总容量
  AppState.activeWorkout.totalVolume = calculateTotalVolume(AppState.activeWorkout.exercises);

  // 统计PR
  const newPRs = await countNewPRs(AppState.activeWorkout);

  // 保存训练记录
  await WorkoutHistory.add(AppState.activeWorkout);

  // 保存完成提示所需数据
  const { totalVolume, duration } = AppState.activeWorkout;

  // 语音播报
  voiceCoach.announceWorkoutComplete(totalVolume, newPRs);

  // 清空当前训练
  AppState.workoutHistory = await WorkoutHistory.getAll();
  AppState.activeWorkout = null;

  // 返回首页
  switchScreen('home');

  // 显示完成提示
  showCompletionAlert(totalVolume, duration);
}

/**
 * 计算总容量
 */
function calculateTotalVolume(exercises) {
  return exercises.reduce((total, ex) => {
    return total + ex.sets.reduce((sum, set) => {
      return set.completed ? sum + (set.weight * set.reps) : sum;
    }, 0);
  }, 0);
}

/**
 * 统计新PR数量
 */
async function countNewPRs(workout) {
  let count = 0;

  for (const ex of workout.exercises) {
    const completedSets = ex.sets.filter(s => s.completed);
    if (completedSets.length === 0) continue;

    const maxWeight = Math.max(...completedSets.map(s => s.weight));

    // 简化处理，实际需要查询历史PR
    // TODO: 实现完整的PR检测逻辑
  }

  return count;
}

/**
 * 显示完成提示
 */
function showCompletionAlert(totalVolume, duration) {
  const minutes = Math.floor(duration / 60);
  alert(`训练完成！\n总容量: ${Math.round(totalVolume)}kg\n用时: ${minutes}分钟`);
}

// ===== 统计页面 =====

/**
 * 渲染统计数据页面
 */
async function renderStats() {
  const recentHistory = await WorkoutHistory.getRecent(28);

  // 获取所有训练过的动作
  const exerciseIds = [...new Set(recentHistory.flatMap(w =>
    w.exercises?.map(e => e.exerciseId) || []
  ))];

  if (exerciseIds.length === 0) {
    renderEmptyStats();
    return;
  }

  // 渲染渐进超负荷图表
  await renderProgressiveOverloadChart(recentHistory, exerciseIds[0]);

  // 渲染周容量图表
  renderVolumeChart();

  // 渲染动作进步排行
  renderExerciseProgress(exerciseIds, recentHistory);
}

/**
 * 渲染空统计状态
 */
function renderEmptyStats() {
  const chartEl = document.getElementById('progressive-overload-chart');
  if (chartEl) {
    chartEl.innerHTML = '<p>还没有训练数据，开始你的第一次训练吧！</p>';
  }
}

/**
 * 渲染渐进超负荷图表
 */
async function renderProgressiveOverloadChart(recentHistory, sampleExerciseId) {
  const chartContainer = document.getElementById('progressive-overload-chart');
  if (!chartContainer) return;

  const progressData = generateProgressiveOverloadData(recentHistory, sampleExerciseId);

  if (progressData) {
    const chartData = progressData.data.map(d => ({
      label: d.label,
      value: d.estimated1RM
    }));

    const canvas = createChartCanvas(chartContainer);
    drawLineChart(canvas, chartData, {
      lineColor: '#e94560',
      fillColor: 'rgba(233, 69, 96, 0.2)'
    });
  }
}

/**
 * 创建图表 Canvas
 */
function createChartCanvas(container) {
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.innerHTML = '';
  container.appendChild(canvas);
  return canvas;
}

/**
 * 渲染容量图表
 */
function renderVolumeChart() {
  const chartContainer = document.getElementById('volume-chart');
  if (!chartContainer) return;

  const volumeData = generateWeeklyVolumeData(AppState.workoutHistory, 8);
  const canvas = createChartCanvas(chartContainer);

  drawBarChart(canvas, volumeData, {
    barColor: '#00d9ff',
    barColorHighlight: '#e94560'
  });
}

/**
 * 渲染动作进步排行
 */
function renderExerciseProgress(exerciseIds, recentHistory) {
  const progressList = document.getElementById('exercise-progress-list');
  if (!progressList) return;

  const exerciseProgress = exerciseIds
    .slice(0, 5)
    .map(id => {
      const data = generateProgressiveOverloadData(recentHistory, id);
      return {
        id,
        name: ExerciseDB[id.toUpperCase()]?.name || id,
        progress: data ? parseFloat(data.progressPercent) : 0
      };
    })
    .sort((a, b) => b.progress - a.progress);

  const fragment = document.createDocumentFragment();

  exerciseProgress.forEach((ex, i) => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);
    `;
    item.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="width: 24px; height: 24px; background: ${i < 3 ? 'var(--primary)' : 'var(--light)'};
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: bold;">${i + 1}</span>
        <span>${ex.name}</span>
      </div>
      <span style="color: var(--success); font-weight: bold;">+${ex.progress}%</span>
    `;
    fragment.appendChild(item);
  });

  progressList.innerHTML = '';
  progressList.appendChild(fragment);
}

// ===== 团队页面 =====

/**
 * 渲染团队页面
 */
function renderTeam() {
  renderTeamMembers();
  renderLeaderboard();
}

/**
 * 渲染团队成员
 */
function renderTeamMembers() {
  const container = document.getElementById('team-members');
  if (!container) return;

  const teamMembers = [
    { name: '我', avatar: '👤', workouts: 12, volume: 8540 },
    { name: '同事A', avatar: '👨', workouts: 10, volume: 7200 },
    { name: '同事B', avatar: '👩', workouts: 8, volume: 5800 }
  ];

  const fragment = document.createDocumentFragment();

  teamMembers.forEach(m => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex; align-items: center; gap: 12px; padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    `;
    item.innerHTML = `
      <span style="font-size: 32px;">${m.avatar}</span>
      <div style="flex: 1;">
        <div style="font-weight: 600;">${m.name}</div>
        <div style="font-size: 12px; color: var(--text-muted);">
          ${m.workouts}次训练 · ${(m.volume / 1000).toFixed(1)}k容量
        </div>
      </div>
      <div style="text-align: right;">
        <div style="color: var(--success); font-weight: bold;">🔥 ${m.workouts}</div>
        <div style="font-size: 11px; color: var(--text-muted);">连续打卡</div>
      </div>
    `;
    fragment.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
}

/**
 * 渲染排行榜
 */
function renderLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  if (!leaderboard) return;

  const teamMembers = [
    { name: '我', avatar: '👤', workouts: 12 },
    { name: '同事A', avatar: '👨', workouts: 10 },
    { name: '同事B', avatar: '👩', workouts: 8 }
  ];

  const sorted = [...teamMembers].sort((a, b) => b.workouts - a.workouts);

  const fragment = document.createDocumentFragment();

  sorted.forEach((m, i) => {
    const item = document.createElement('div');
    item.style.cssText = `
      display: flex; align-items: center; gap: 12px; padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    `;
    item.innerHTML = `
      <span style="font-size: 20px;">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
      <span style="font-size: 24px;">${m.avatar}</span>
      <span style="flex: 1;">${m.name}</span>
      <span style="font-weight: bold;">${m.workouts}次</span>
    `;
    fragment.appendChild(item);
  });

  leaderboard.innerHTML = '';
  leaderboard.appendChild(fragment);
}

// ===== 设置页面 =====

/**
 * 渲染设置页面
 */
async function renderSettings() {
  const user = await UserProfile.get();

  // 设置选项值
  setSettingValue('split-setting', user?.splitType);
  setSettingValue('level-setting', user?.level);
  setCheckboxValue('voice-setting', voiceCoach.enabled);

  // 渲染体能测试项目
  renderFitnessTests(user);

  // 绑定设置变更
  bindSettingsEvents();
}

/**
 * 设置下拉框值
 */
function setSettingValue(id, value) {
  const el = document.getElementById(id);
  if (el && value) {
    el.value = value;
  }
}

/**
 * 设置复选框值
 */
function setCheckboxValue(id, checked) {
  const el = document.getElementById(id);
  if (el) {
    el.checked = checked;
  }
}

/**
 * 渲染体能测试项目
 */
function renderFitnessTests(user) {
  const container = document.getElementById('fitness-tests');
  if (!container || !user?.fitnessTests) return;

  const fragment = document.createDocumentFragment();

  Object.entries(user.fitnessTests).forEach(([key, value]) => {
    const test = FitnessTests[key.toUpperCase()];
    if (!test) return;

    const item = document.createElement('div');
    item.style.cssText = `
      display: flex; justify-content: space-between; padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    `;
    item.innerHTML = `
      <span>${test.name}</span>
      <span style="color: var(--success); font-weight: bold;">${value} ${test.unit}</span>
    `;
    fragment.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(fragment);
}

/**
 * 绑定设置事件
 */
function bindSettingsEvents() {
  const splitSetting = document.getElementById('split-setting');
  const levelSetting = document.getElementById('level-setting');
  const voiceSetting = document.getElementById('voice-setting');

  splitSetting?.addEventListener('change', async (e) => {
    await UserProfile.update({ splitType: e.target.value });
    AppState.currentUser.splitType = e.target.value;
    await regeneratePlan();
    alert('训练计划已更新');
  });

  levelSetting?.addEventListener('change', async (e) => {
    await UserProfile.update({ level: e.target.value });
    AppState.currentUser.level = e.target.value;
    await regeneratePlan();
    alert('训练计划已更新');
  });

  voiceSetting?.addEventListener('change', (e) => {
    voiceCoach.setEnabled(e.target.checked);
  });
}

// ===== 全局导出 =====

// 将需要在全局访问的函数挂载到 App 命名空间
window.App = {
  switchScreen,
  addRestTime
};

// 向后兼容的全局函数
window.addRestTime = addRestTime;

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
  if (AppState.workoutTimer) {
    AppState.workoutTimer.destroy();
  }
  if (AppState.restTimer) {
    AppState.restTimer.destroy();
  }
});
