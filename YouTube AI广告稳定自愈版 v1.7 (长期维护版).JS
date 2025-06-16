// ==UserScript==
// @name         YouTube AI广告稳定自愈版 v1.7 (长期维护版)
// @namespace    http://tampermonkey.net/
// @version      1.7
// @description  专注YouTube广告净化，长期稳定、AI自愈、本地学习缓存、支持未来广告变化、低维护、断网容灾。
// @author       little fool
// @match        *://www.youtube.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      openkey.cloud
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  // ✅ AI接口配置
  const OPENKEY_API = 'https://openkey.cloud/v1/chat/completions';
  const keyParts = ['sk-', '1ytLN', 'fSpk5R34n', 'jTF628665', '6331c426cAeCb95E266F8D377'];
  const API_KEY = keyParts.join('');

  // ✅ 默认基础CSS广告选择器（基础保险）
  const DEFAULT_SELECTORS = [
    '.ytp-ad-module',
    '.ytp-ad-overlay-container',
    '.ytp-ad-player-overlay',
    '.ad-showing .video-ads',
    '#player-ads'
  ];

  // ✅ 本地缓存键名
  const CACHE_KEY = 'yt_ad_selectors_cache';
  const HISTORY_KEY = 'yt_ad_selectors_history';
  const UPDATE_KEY = 'yt_ad_last_update';

  let dynamicSelectors = [];
  let lastUpdate = 0;
  let lastAdState = false;
  let previousMuted = null;

  function log(...args) { console.log('[YouTube净化 v6.1]', ...args); }

  // ✅ AI更新核心逻辑
  async function updateSelectorsViaAI() {
    if (Date.now() - lastUpdate < 3600000) return;  // 每小时最多请求一次

    const prompt = "请提供当前YouTube最新广告CSS选择器数组，JSON格式，仅返回如 ['.ytp-ad-module', ...]";

    GM_xmlhttpRequest({
      method: 'POST',
      url: OPENKEY_API,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      data: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      }),
      onload: res => {
        try {
          const data = JSON.parse(res.responseText);
          let content = data.choices[0].message.content.trim().replace(/```json|```/g, '').trim();
          const list = JSON.parse(content);
          if (Array.isArray(list)) {
            dynamicSelectors = list;
            GM_setValue(CACHE_KEY, list);
            GM_setValue(UPDATE_KEY, Date.now());
            lastUpdate = Date.now();

            // 保存历史最多保留10个
            let history = GM_getValue(HISTORY_KEY, []);
            history.unshift(list);
            if (history.length > 10) history = history.slice(0, 10);
            GM_setValue(HISTORY_KEY, history);

            log('[AI更新成功]', list);
          } else {
            log('[AI返回异常]:', content);
            useFallback();
          }
        } catch (e) {
          console.warn('[AI解析失败]', e);
          useFallback();
        }
      },
      onerror: () => {
        console.warn('[AI请求失败]');
        useFallback();
      }
    });
  }

  // ✅ 容灾机制：AI失败时使用历史缓存
  function useFallback() {
    const history = GM_getValue(HISTORY_KEY, []);
    if (history.length > 0) {
      dynamicSelectors = history[0];
      log('[容灾] 使用历史缓存');
    } else {
      dynamicSelectors = [];
      log('[严重容灾] 无历史缓存，仅使用默认规则');
    }
  }

  // ✅ 软隐藏广告模块，降低被检测概率
  function hideAds() {
    [...DEFAULT_SELECTORS, ...dynamicSelectors].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.opacity = '0.01';
        el.style.pointerEvents = 'none';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.top = '-9999px';
        el.style.zIndex = '0';
      });
    });
  }

  // ✅ 智能跳过可跳广告
  function clickSkip() {
    const btn = document.querySelector('.ytp-ad-skip-button');
    if (btn && btn.offsetParent !== null) {
      setTimeout(() => { btn.click(); log('[跳过广告]'); }, 300 + Math.random() * 300);
    }
  }

  // ✅ 广告倍速+静音加速播放
  function accelerateAd() {
    const video = document.querySelector('video');
    const ad = document.querySelector('.ad-showing');
    if (!video) return;

    if (ad) {
      video.playbackRate = 16;
      if (!lastAdState) {
        previousMuted = video.muted;
        video.muted = true;
        log('[广告中] 倍速播放且静音');
      }
    } else {
      video.playbackRate = 1;
      if (lastAdState && previousMuted !== null) {
        video.muted = previousMuted;
        previousMuted = null;
        log('[广告结束] 恢复静音状态');
      }
    }
    lastAdState = !!ad;
  }

  // ✅ 每秒钟核心净化逻辑循环
  setInterval(() => {
    hideAds();
    clickSkip();
    accelerateAd();
  }, 1000);

  // ✅ 脚本初始化
  (function init() {
    log("【YouTube AI广告稳定自愈版 v6.1】启动");
    dynamicSelectors = GM_getValue(CACHE_KEY, []);
    lastUpdate = GM_getValue(UPDATE_KEY, 0);
    updateSelectorsViaAI();
    setInterval(updateSelectorsViaAI, 3600000); // 每小时尝试自愈一次
  })();
})();
