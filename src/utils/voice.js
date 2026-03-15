/**
 * 午间铁馆 - 语音指导系统
 * 使用 Web Speech API 提供训练语音指导
 */

import { VOICE_CONFIG } from './constants.js';

class VoiceCoach {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
    this.language = VOICE_CONFIG.LANGUAGE;
    this.rate = VOICE_CONFIG.DEFAULT_RATE;
    this.pitch = VOICE_CONFIG.DEFAULT_PITCH;
    this.volume = VOICE_CONFIG.DEFAULT_VOLUME;
    this.voice = null;
    this._utterance = null;

    this.init();
  }

  init() {
    // 等待语音列表加载
    if (this.synth?.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.selectVoice();
    }

    // 从本地存储读取设置
    this.loadSettings();
  }

  /**
   * 加载本地存储的设置
   */
  loadSettings() {
    try {
      const settings = localStorage.getItem('voice-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.enabled ?? true;
        this.rate = parsed.rate ?? VOICE_CONFIG.DEFAULT_RATE;
        this.volume = parsed.volume ?? VOICE_CONFIG.DEFAULT_VOLUME;
      }
    } catch (error) {
      console.warn('加载语音设置失败:', error);
    }
  }

  /**
   * 选择合适的语音
   */
  selectVoice() {
    if (!this.synth) return;

    const voices = this.synth.getVoices();

    // 优先选择中文男声
    this.voice = voices.find(v =>
      v.lang.includes('zh') && v.name.includes('男')
    ) || voices.find(v =>
      v.lang.includes('zh')
    ) || voices[0];
  }

  /**
   * 播放语音
   * @param {string} text - 要播报的文本
   * @param {Object} options - 选项
   */
  speak(text, options = {}) {
    if (!this.enabled || !this.synth || !text) return;

    // 取消之前的语音
    this.stop();

    try {
      this._utterance = new SpeechSynthesisUtterance(text);
      this._utterance.voice = this.voice;
      this._utterance.lang = this.language;
      this._utterance.rate = options.rate ?? this.rate;
      this._utterance.pitch = options.pitch ?? this.pitch;
      this._utterance.volume = options.volume ?? this.volume;

      if (options.onEnd) {
        this._utterance.onend = options.onEnd;
      }

      this._utterance.onerror = (event) => {
        console.warn('语音播放错误:', event.error);
      };

      this.synth.speak(this._utterance);
    } catch (error) {
      console.warn('语音播放失败:', error);
    }
  }

  /**
   * 播报训练开始
   */
  announceWorkoutStart(workoutName) {
    if (!workoutName) return;
    this.speak(`开始${workoutName}训练，准备好了吗？让我们开始！`);
  }

  /**
   * 播报动作信息
   */
  announceExercise(exerciseName, sets, reps, weight) {
    if (!exerciseName) return;
    const weightText = weight ? `${weight}公斤` : '自重';
    this.speak(`下一个动作，${exerciseName}，${sets}组，每组${reps}次，重量${weightText}`);
  }

  /**
   * 播报组间休息开始
   */
  announceRestStart(seconds) {
    const minuteText = seconds >= 60 ? `${Math.floor(seconds / 60)}分` : '';
    const secondText = seconds % 60 > 0 ? `${seconds % 60}秒` : '';
    this.speak(`组间休息，${minuteText}${secondText}`);
  }

  /**
   * 播报休息倒计时
   */
  announceRestCountdown(secondsLeft) {
    const announcementTimes = [30, 10, 5, 4, 3, 2, 1];
    if (announcementTimes.includes(secondsLeft)) {
      this.speak(`${secondsLeft}秒`, { rate: 1.2 });
    }
  }

  /**
   * 播报休息结束
   */
  announceRestEnd() {
    this.speak('休息时间到，准备下一组！', { rate: 1.1 });
  }

  /**
   * 播报鼓励语
   */
  announceEncouragement() {
    const encouragements = [
      '做得很好，继续保持！',
      '感受肌肉的收缩，控制动作！',
      '你可以的，再来一组！',
      '专注于每一次动作！',
      '很好，注意呼吸节奏！',
      '保持动作质量，不要借力！',
      '加油，突破自己！',
      '最后一组，全力以赴！'
    ];

    const random = encouragements[Math.floor(Math.random() * encouragements.length)];
    this.speak(random, { volume: 0.8 });
  }

  /**
   * 播报训练完成
   */
  announceWorkoutComplete(volume, prs) {
    let text = `训练完成！本次训练容量${Math.round(volume || 0)}公斤。`;
    if (prs > 0) {
      text += `恭喜你创造了${prs}个新纪录！`;
    }
    text += '好好休息，补充蛋白质！';
    this.speak(text);
  }

  /**
   * 播报渐进超负荷建议
   */
  announceProgressSuggestion(exerciseName, newWeight) {
    if (!exerciseName || !newWeight) return;
    this.speak(`${exerciseName}可以加重到${newWeight}公斤，挑战一下自己！`);
  }

  /**
   * 设置语音开关
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSettings();
  }

  /**
   * 设置语速
   */
  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
    this.saveSettings();
  }

  /**
   * 设置音量
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * 保存设置到本地存储
   */
  saveSettings() {
    try {
      localStorage.setItem('voice-settings', JSON.stringify({
        enabled: this.enabled,
        rate: this.rate,
        volume: this.volume
      }));
    } catch (error) {
      console.warn('保存语音设置失败:', error);
    }
  }

  /**
   * 停止当前语音
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this._utterance = null;
  }

  /**
   * 测试语音
   */
  test() {
    this.speak('语音测试，铁馆语音系统正常，准备好开始训练了吗？');
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stop();
    this.synth = null;
    this.voice = null;
  }
}

// 单例导出
export const voiceCoach = new VoiceCoach();

/**
 * 计时器基类
 */
class Timer {
  constructor() {
    this.interval = null;
    this.isRunning = false;
    this._onTick = null;
  }

  start(callback, intervalMs = 1000) {
    if (this.isRunning) return;

    this.isRunning = true;
    this._onTick = callback;

    this.interval = setInterval(() => {
      if (this._onTick) {
        this._onTick();
      }
    }, intervalMs);
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
    }
  }

  resume() {
    if (!this.isRunning) {
      this.start(this._onTick);
    }
  }

  destroy() {
    this.pause();
    this._onTick = null;
  }
}

/**
 * 休息计时器（带语音播报）
 */
export class RestTimer {
  constructor(duration = 90, onTick = null, onComplete = null) {
    this.duration = duration;
    this.remaining = duration;
    this.timer = new Timer();
    this.onTick = onTick;
    this.onComplete = onComplete;
  }

  start() {
    voiceCoach.announceRestStart(this.remaining);

    this.timer.start(() => {
      this.remaining--;

      // 播报倒计时
      voiceCoach.announceRestCountdown(this.remaining);

      if (this.onTick) {
        this.onTick(this.remaining);
      }

      if (this.remaining <= 0) {
        this.complete();
      }
    });
  }

  pause() {
    this.timer.pause();
  }

  resume() {
    if (this.remaining > 0) {
      this.timer.resume();
    }
  }

  reset(duration = null) {
    this.timer.pause();
    this.remaining = duration || this.duration;
  }

  addTime(seconds) {
    this.remaining = Math.max(0, this.remaining + seconds);
    if (this.onTick) {
      this.onTick(this.remaining);
    }
  }

  complete() {
    this.timer.pause();
    voiceCoach.announceRestEnd();
    this.playBeep();

    if (this.onComplete) {
      this.onComplete();
    }
  }

  playBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);

      // 清理音频上下文
      setTimeout(() => {
        audioCtx.close().catch(() => {});
      }, 600);
    } catch (e) {
      console.log('无法播放提示音');
    }
  }

  formatTime() {
    const minutes = Math.floor(this.remaining / 60);
    const seconds = this.remaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  destroy() {
    this.timer.destroy();
    this.onTick = null;
    this.onComplete = null;
  }
}

/**
 * 训练计时器
 */
export class WorkoutTimer {
  constructor(onTick = null) {
    this.startTime = null;
    this.elapsed = 0;
    this.timer = new Timer();
    this.onTick = onTick;
  }

  start() {
    this.startTime = Date.now() - this.elapsed * 1000;

    this.timer.start(() => {
      this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      if (this.onTick) {
        this.onTick(this.elapsed);
      }
    });
  }

  pause() {
    this.timer.pause();
  }

  resume() {
    if (!this.timer.isRunning) {
      this.start();
    }
  }

  stop() {
    this.timer.pause();
    const final = this.elapsed;
    this.elapsed = 0;
    this.startTime = null;
    return final;
  }

  formatTime() {
    const hours = Math.floor(this.elapsed / 3600);
    const minutes = Math.floor((this.elapsed % 3600) / 60);
    const seconds = this.elapsed % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  destroy() {
    this.timer.destroy();
    this.onTick = null;
  }
}
