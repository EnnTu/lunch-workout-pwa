/**
 * 午间铁馆 - 图表工具
 * 使用 Canvas 绘制简单的数据可视化
 */

// 默认配置
const DEFAULT_OPTIONS = {
  line: {
    padding: { top: 20, right: 20, bottom: 30, left: 40 },
    lineColor: '#e94560',
    fillColor: 'rgba(233, 69, 96, 0.1)',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#a0a0a0',
    showPoints: true,
    showFill: true,
    smooth: true
  },
  bar: {
    padding: { top: 20, right: 20, bottom: 30, left: 40 },
    barColor: '#00d9ff',
    barColorHighlight: '#e94560',
    gridColor: 'rgba(255, 255, 255, 0.1)',
    textColor: '#a0a0a0'
  }
};

/**
 * 设置 Canvas 尺寸和 DPR
 * @param {HTMLCanvasElement} canvas
 * @returns {Object} 上下文和尺寸信息
 */
function setupCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  return { ctx, width: rect.width, height: rect.height };
}

/**
 * 绘制网格线
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config
 */
function drawGrid(ctx, config) {
  const { width, height, padding, gridColor, textColor, maxValue, valueRange, dataLength } = config;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.fillStyle = textColor;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'right';

  // 横向网格线和 Y 轴标签
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Y轴标签
    const value = maxValue - (valueRange / 4) * i;
    ctx.fillText(Math.round(value).toString(), padding.left - 5, y + 3);
  }
}

/**
 * 绘制折线图
 * @param {HTMLCanvasElement} canvas
 * @param {Array} data
 * @param {Object} options
 */
export function drawLineChart(canvas, data, options = {}) {
  if (!canvas || !data?.length) return;

  try {
    const { ctx, width, height } = setupCanvas(canvas);
    const opts = { ...DEFAULT_OPTIONS.line, ...options };
    const { padding, lineColor, fillColor, gridColor, textColor, showPoints, showFill, smooth } = opts;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 计算数据范围
    const values = data.map(d => d.value);
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    const valueRange = maxValue - minValue || 1;

    // 绘制网格
    drawGrid(ctx, {
      width, height, padding, gridColor, textColor,
      maxValue, valueRange
    });

    // 计算点坐标
    const points = data.map((d, i) => ({
      x: padding.left + (chartWidth / (data.length - 1 || 1)) * i,
      y: padding.top + chartHeight - ((d.value - minValue) / valueRange) * chartHeight,
      label: d.label,
      value: d.value
    }));

    // 绘制填充区域
    if (showFill) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, padding.top + chartHeight);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    // 绘制折线
    drawSmoothLine(ctx, points, lineColor, smooth);

    // 绘制数据点
    if (showPoints) {
      drawDataPoints(ctx, points, lineColor);
    }

    // X轴标签
    drawXAxisLabels(ctx, data, width, height, padding, textColor);

    return points;
  } catch (error) {
    console.error('绘制折线图失败:', error);
  }
}

/**
 * 绘制平滑曲线
 */
function drawSmoothLine(ctx, points, lineColor, smooth) {
  ctx.beginPath();
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (smooth && points.length > 2) {
    // 平滑曲线
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  } else {
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
  }
  ctx.stroke();
}

/**
 * 绘制数据点
 */
function drawDataPoints(ctx, points, lineColor) {
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

/**
 * 绘制 X 轴标签
 */
function drawXAxisLabels(ctx, data, width, height, padding, textColor) {
  const chartWidth = width - padding.left - padding.right;

  ctx.fillStyle = textColor;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';

  const labelStep = Math.ceil(data.length / 5);
  data.forEach((d, i) => {
    if (i % labelStep === 0) {
      const x = padding.left + (chartWidth / (data.length - 1 || 1)) * i;
      ctx.fillText(d.label, x, height - 10);
    }
  });
}

/**
 * 绘制柱状图
 * @param {HTMLCanvasElement} canvas
 * @param {Array} data
 * @param {Object} options
 */
export function drawBarChart(canvas, data, options = {}) {
  if (!canvas || !data?.length) return;

  try {
    const { ctx, width, height } = setupCanvas(canvas);
    const opts = { ...DEFAULT_OPTIONS.bar, ...options };
    const { padding, barColor, barColorHighlight, gridColor, textColor } = opts;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    // 计算最大值
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1 || 1;

    // 绘制网格线
    drawGrid(ctx, {
      width, height, padding, gridColor, textColor,
      maxValue, valueRange: maxValue
    });

    // 绘制柱状图
    drawBars(ctx, data, width, height, padding, chartWidth, chartHeight, maxValue, barColor, barColorHighlight);

    // X轴标签
    drawBarXAxisLabels(ctx, data, width, height, padding, chartWidth, textColor);
  } catch (error) {
    console.error('绘制柱状图失败:', error);
  }
}

/**
 * 绘制柱状图柱子
 */
function drawBars(ctx, data, width, height, padding, chartWidth, chartHeight, maxValue, barColor, barColorHighlight) {
  const barWidth = (chartWidth / data.length) * 0.6;
  const barSpacing = (chartWidth / data.length) * 0.4;

  data.forEach((d, i) => {
    const barHeight = (d.value / maxValue) * chartHeight;
    const x = padding.left + (barWidth + barSpacing) * i + barSpacing / 2;
    const y = padding.top + chartHeight - barHeight;

    const baseColor = d.highlight ? barColorHighlight : barColor;

    // 渐变色
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, baseColor + '80');

    // 绘制圆角矩形
    drawRoundedRect(ctx, x, y, barWidth, barHeight, 4, gradient);
  });
}

/**
 * 绘制圆角矩形
 */
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.beginPath();

  // 确保圆角不会太大
  const r = Math.min(radius, height / 2, width / 2);

  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();

  ctx.fillStyle = fillStyle;
  ctx.fill();
}

/**
 * 绘制柱状图 X 轴标签
 */
function drawBarXAxisLabels(ctx, data, width, height, padding, chartWidth, textColor) {
  const barWidth = (chartWidth / data.length) * 0.6;
  const barSpacing = (chartWidth / data.length) * 0.4;

  ctx.fillStyle = textColor;
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';

  data.forEach((d, i) => {
    const x = padding.left + (barWidth + barSpacing) * i + barSpacing / 2 + barWidth / 2;
    ctx.fillText(d.label, x, height - 10);
  });
}

/**
 * 绘制环形进度图
 * @param {HTMLCanvasElement} canvas
 * @param {number} percentage
 * @param {Object} options
 */
export function drawRingProgress(canvas, percentage, options = {}) {
  if (!canvas) return;

  try {
    const { ctx, width, height } = setupCanvas(canvas);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    const {
      bgColor = 'rgba(255, 255, 255, 0.1)',
      progressColor = '#e94560',
      textColor = '#fff',
      lineWidth = 8
    } = options;

    ctx.clearRect(0, 0, width, height);

    // 背景圆环
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = bgColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 进度圆环
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * Math.max(0, Math.min(100, percentage)) / 100);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = progressColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 中心文字
    ctx.fillStyle = textColor;
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(percentage)}%`, centerX, centerY);
  } catch (error) {
    console.error('绘制环形进度图失败:', error);
  }
}

// ===== 数据生成函数 =====

/**
 * 计算线性回归
 * @param {Array} data
 * @returns {Object} 斜率和截距
 */
function calculateLinearRegression(data) {
  const n = data.length;
  const sumX = data.reduce((sum, _, i) => sum + i, 0);
  const sumY = data.reduce((sum, d) => sum + d.estimated1RM, 0);
  const sumXY = data.reduce((sum, d, i) => sum + i * d.estimated1RM, 0);
  const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: sumY / n };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * 生成渐进超负荷分析图表数据
 * @param {Array} workoutHistory
 * @param {string} exerciseId
 * @returns {Object|null}
 */
export function generateProgressiveOverloadData(workoutHistory, exerciseId) {
  if (!workoutHistory?.length || !exerciseId) return null;

  try {
    const exerciseData = workoutHistory
      .flatMap(w => w.exercises || [])
      .filter(e => e.exerciseId === exerciseId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (exerciseData.length < 2) return null;

    // 计算每次训练的估算1RM
    const data = exerciseData.map(e => {
      const estimated1RM = Math.max(...e.sets.map(s =>
        s.weight * (1 + s.reps / 30)
      ));
      const volume = e.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);

      return {
        date: e.date,
        label: e.date.slice(5), // MM-DD
        estimated1RM: Math.round(estimated1RM),
        volume,
        maxWeight: Math.max(...e.sets.map(s => s.weight))
      };
    });

    // 计算趋势线
    const { slope, intercept } = calculateLinearRegression(data);

    const firstValue = data[0].estimated1RM;
    const lastValue = data[data.length - 1].estimated1RM;
    const progressPercent = firstValue > 0
      ? ((lastValue - firstValue) / firstValue * 100).toFixed(1)
      : '0.0';

    return {
      data: data.map((d, i) => ({
        ...d,
        trend: slope * i + intercept
      })),
      slope,
      progressPercent,
      isImproving: slope > 0
    };
  } catch (error) {
    console.error('生成渐进超负荷数据失败:', error);
    return null;
  }
}

/**
 * 生成周容量数据
 * @param {Array} workoutHistory
 * @param {number} weeks
 * @returns {Array}
 */
export function generateWeeklyVolumeData(workoutHistory, weeks = 8) {
  if (!workoutHistory?.length) {
    return Array.from({ length: weeks }, (_, i) => ({
      label: `W${i + 1}`,
      value: 0,
      highlight: i === weeks - 1
    }));
  }

  try {
    const now = new Date();
    const data = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const weekWorkouts = workoutHistory.filter(w => {
        const date = new Date(w.date);
        return date >= weekStart && date < weekEnd;
      });

      const volume = weekWorkouts.reduce((sum, w) =>
        sum + (w.totalVolume || 0), 0
      );

      data.push({
        label: `W${weeks - i}`,
        value: Math.round(volume),
        highlight: i === 0
      });
    }

    return data;
  } catch (error) {
    console.error('生成周容量数据失败:', error);
    return [];
  }
}

// 肌肉群名称映射
const MUSCLE_NAMES = {
  'chest_upper': '上胸', 'chest_middle': '中胸', 'chest_lower': '下胸',
  'back_lats': '背阔', 'back_traps': '斜方', 'back_rhomboids': '菱形',
  'shoulders_front': '前束', 'shoulders_side': '中束', 'shoulders_rear': '后束',
  'biceps': '二头', 'triceps': '三头',
  'quads': '股四', 'hamstrings': '腘绳', 'glutes': '臀', 'calves': '小腿',
  'abs': '腹肌', 'core': '核心'
};

/**
 * 生成肌肉群训练频率数据
 * @param {Array} workoutHistory
 * @returns {Array}
 */
export function generateMuscleFrequencyData(workoutHistory) {
  if (!workoutHistory?.length) return [];

  try {
    const muscleMap = {};

    workoutHistory.forEach(w => {
      w.exercises?.forEach(e => {
        e.targetMuscles?.forEach(muscle => {
          muscleMap[muscle] = (muscleMap[muscle] || 0) + 1;
        });
      });
    });

    return Object.entries(muscleMap)
      .map(([muscle, count]) => ({
        label: MUSCLE_NAMES[muscle] || muscle,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  } catch (error) {
    console.error('生成肌肉群频率数据失败:', error);
    return [];
  }
}
