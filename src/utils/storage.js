/**
 * 午间铁馆 - 本地数据存储
 * 使用 IndexedDB 存储训练记录和用户数据
 */

import { DB_CONFIG, STORE_NAMES } from './constants.js';

// 数据库对象
let db = null;

/**
 * 通用 IndexedDB 操作包装器
 * @param {string} storeName - 存储对象名称
 * @param {string} mode - 事务模式 ('readonly' | 'readwrite')
 * @param {Function} operation - 操作函数
 * @returns {Promise<any>}
 */
function dbOperation(storeName, mode, operation) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未初始化'));
      return;
    }

    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    try {
      const result = operation(store);

      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 创建可复用的存储操作对象
 * @param {string} storeName - 存储对象名称
 * @param {string} keyPath - 主键字段名
 * @returns {Object} 存储操作方法集
 */
function createStoreOperations(storeName, keyPath = 'id') {
  return {
    async get(key) {
      return dbOperation(storeName, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.get(key);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
        });
      });
    },

    async getAll(indexName = null) {
      return dbOperation(storeName, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const source = indexName ? store.index(indexName) : store;
          const request = source.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
    },

    async add(data) {
      return dbOperation(storeName, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const record = { ...data, createdAt: new Date().toISOString() };
          const request = store.add(record);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
    },

    async put(data) {
      return dbOperation(storeName, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.put(data);
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
    },

    async update(key, updates) {
      const existing = await this.get(key);
      if (!existing) {
        throw new Error('记录不存在');
      }
      return this.put({
        ...existing,
        ...updates,
        [keyPath]: key,
        updatedAt: new Date().toISOString()
      });
    },

    async delete(key) {
      return dbOperation(storeName, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.delete(key);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
    },

    async clear() {
      return dbOperation(storeName, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      });
    }
  };
}

/**
 * 初始化数据库
 */
export async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_CONFIG.NAME, DB_CONFIG.VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // 用户档案存储
      if (!database.objectStoreNames.contains(STORE_NAMES.USER_PROFILE)) {
        database.createObjectStore(STORE_NAMES.USER_PROFILE, { keyPath: 'id' });
      }

      // 训练记录存储
      if (!database.objectStoreNames.contains(STORE_NAMES.WORKOUTS)) {
        const workoutStore = database.createObjectStore(STORE_NAMES.WORKOUTS, {
          keyPath: 'id',
          autoIncrement: true
        });
        workoutStore.createIndex('date', 'date', { unique: false });
        workoutStore.createIndex('workoutType', 'workoutType', { unique: false });
      }

      // 训练计划存储
      if (!database.objectStoreNames.contains(STORE_NAMES.TRAINING_PLAN)) {
        database.createObjectStore(STORE_NAMES.TRAINING_PLAN, { keyPath: 'id' });
      }

      // 动作PR记录
      if (!database.objectStoreNames.contains(STORE_NAMES.PERSONAL_RECORDS)) {
        const prStore = database.createObjectStore(STORE_NAMES.PERSONAL_RECORDS, {
          keyPath: 'exerciseId'
        });
        prStore.createIndex('date', 'date', { unique: false });
      }

      // 待同步数据（离线使用）
      if (!database.objectStoreNames.contains(STORE_NAMES.PENDING_SYNC)) {
        const syncStore = database.createObjectStore(STORE_NAMES.PENDING_SYNC, {
          keyPath: 'id',
          autoIncrement: true
        });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// 基础存储操作
const userProfileOps = createStoreOperations(STORE_NAMES.USER_PROFILE);
const workoutsOps = createStoreOperations(STORE_NAMES.WORKOUTS);
const trainingPlanOps = createStoreOperations(STORE_NAMES.TRAINING_PLAN);
const prOps = createStoreOperations(STORE_NAMES.PERSONAL_RECORDS);

/**
 * 用户档案操作
 */
export const UserProfile = {
  async get() {
    return userProfileOps.get('current');
  },

  async save(profile) {
    return userProfileOps.put({
      ...profile,
      id: 'current',
      updatedAt: new Date().toISOString()
    });
  },

  async update(updates) {
    const current = await this.get() || {};
    return this.save({ ...current, ...updates });
  }
};

/**
 * 训练记录操作
 */
export const WorkoutHistory = {
  async add(workout) {
    return workoutsOps.add(workout);
  },

  async getAll() {
    const results = await workoutsOps.getAll();
    return results.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getByDate(date) {
    const all = await workoutsOps.getAll('date');
    return all.filter(w => w.date === date);
  },

  async getByType(type) {
    const all = await workoutsOps.getAll('workoutType');
    return all
      .filter(w => w.workoutType === type)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async update(id, updates) {
    return userProfileOps.update(id, updates);
  },

  async delete(id) {
    return workoutsOps.delete(id);
  },

  // 获取最近N天的训练
  async getRecent(days = 30) {
    const all = await this.getAll();
    const cutoff = getDaysAgo(days);

    return all.filter(w => new Date(w.date) >= cutoff);
  },

  // 获取本周训练
  async getThisWeek() {
    const weekStart = getWeekStart();
    const all = await this.getAll();
    return all.filter(w => new Date(w.date) >= weekStart);
  },

  // 获取本月训练
  async getThisMonth() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const all = await this.getAll();
    return all.filter(w => new Date(w.date) >= monthStart);
  }
};

/**
 * 训练计划操作
 */
export const TrainingPlan = {
  async get() {
    return trainingPlanOps.get('current');
  },

  async save(plan) {
    return trainingPlanOps.put({
      ...plan,
      id: 'current',
      updatedAt: new Date().toISOString()
    });
  }
};

/**
 * 个人记录(PR)操作
 */
export const PersonalRecords = {
  async get(exerciseId) {
    return prOps.get(exerciseId);
  },

  async getAll() {
    return prOps.getAll();
  },

  async save(record) {
    return prOps.put(record);
  },

  async update(exerciseId, record) {
    const existing = await this.get(exerciseId);

    // 检查是否是新PR
    if (existing) {
      if (record.weight > existing.weight ||
          (record.weight === existing.weight && record.reps > existing.reps)) {
        return this.save({ ...record, exerciseId, isNewPR: true });
      }
      return existing;
    }

    return this.save({ ...record, exerciseId, isNewPR: true });
  }
};

/**
 * 统计数据
 */
export const Stats = {
  // 获取总训练次数
  async getTotalWorkouts() {
    const all = await WorkoutHistory.getAll();
    return all.length;
  },

  // 获取连续训练天数
  async getStreak() {
    const all = await WorkoutHistory.getAll();
    if (all.length === 0) return 0;

    const dates = [...new Set(all.map(w => w.date))].sort().reverse();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    // 检查今天或昨天是否有训练
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (dates[i] === formatDate(expectedDate)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return streak;
  },

  // 获取各部位训练次数统计
  async getMuscleGroupStats() {
    const all = await WorkoutHistory.getAll();
    const stats = {};

    all.forEach(workout => {
      workout.exercises?.forEach(ex => {
        ex.targetMuscles?.forEach(muscle => {
          stats[muscle] = (stats[muscle] || 0) + 1;
        });
      });
    });

    return stats;
  },

  // 获取总训练容量
  async getTotalVolume() {
    const all = await WorkoutHistory.getAll();
    return all.reduce((sum, w) => sum + (w.totalVolume || 0), 0);
  },

  // 获取月度统计
  async getMonthlyStats() {
    const thisMonth = await WorkoutHistory.getThisMonth();

    let totalVolume = 0;
    let newPRs = 0;

    thisMonth.forEach(w => {
      totalVolume += w.totalVolume || 0;
      w.exercises?.forEach(e => {
        if (e.newPR) newPRs++;
      });
    });

    return {
      workouts: thisMonth.length,
      volume: Math.round(totalVolume),
      newPRs
    };
  }
};

/**
 * 导出数据
 */
export async function exportData() {
  const data = {
    userProfile: await UserProfile.get(),
    trainingPlan: await TrainingPlan.get(),
    workouts: await WorkoutHistory.getAll(),
    personalRecords: await PersonalRecords.getAll(),
    exportDate: new Date().toISOString()
  };

  return JSON.stringify(data, null, 2);
}

/**
 * 导入数据
 */
export async function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (data.userProfile) {
      await UserProfile.save(data.userProfile);
    }
    if (data.trainingPlan) {
      await TrainingPlan.save(data.trainingPlan);
    }
    if (data.workouts) {
      for (const workout of data.workouts) {
        await WorkoutHistory.add(workout);
      }
    }
    if (data.personalRecords) {
      for (const pr of data.personalRecords) {
        await PersonalRecords.save(pr);
      }
    }

    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
}

/**
 * 清除所有数据
 */
export async function clearAllData() {
  await initDB();

  const stores = Object.values(STORE_NAMES);

  for (const storeName of stores) {
    await createStoreOperations(storeName).clear();
  }
}

// ========== 工具函数 ==========

/**
 * 获取N天前的日期
 */
function getDaysAgo(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * 获取本周开始日期（周一）
 */
function getWeekStart() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - adjustedDay);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}
