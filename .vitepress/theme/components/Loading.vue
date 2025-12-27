<template>
  <div 
    id="loader-wrapper" 
    :class="store.imgLoadStatus ? 'loaded' : null"
    :style="{
      '--mask-bg-start': loadingConfig.maskStyle?.backgroundColor || '#f0fff0',
      '--mask-bg-end': loadingConfig.maskStyle?.backgroundColorEnd || '#e6ffe6',
      '--mask-gradient-direction': loadingConfig.maskStyle?.gradientDirection || '135deg'
    }"
  >
    <div class="loader">
      <div class="loader-circle" />
      <div class="loader-text">
        <span class="name">
          {{ siteName }}
        </span>
        <span class="tip"> 加载中 </span>
      </div>
    </div>
    <div class="loader-section section-left" />
    <div class="loader-section section-right" />
  </div>
</template>

<script setup>
import { getStore } from "../store"
import { useData } from 'vitepress'

const store = getStore()
const { theme } = useData()

// 从配置中获取加载动画参数
const loadingConfig = theme.value.personalHome?.loadingConfig || {
  loader: { startDelay: 0.4, duration: 0.3 },
  maskFade: { startDelay: 0.1, duration: 0.5, opacity: 0.7 },
  maskSlide: { startDelay: 0.8, duration: 0.8 },
  maskStyle: { 
    backgroundColor: '#f0fff0', 
    backgroundColorEnd: '#e6ffe6', 
    gradientDirection: '135deg' 
  },
  totalDuration: 1.5
}

// 配置
const siteName = "Murasame's Home"
</script>

<style lang="scss" scoped>
#loader-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  overflow: hidden;
  .loader {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .loader-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: #228b22;
      animation: spin 1.8s linear infinite;
      z-index: 2;

      &:before {
        content: "";
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #32cd32;
        animation: spin-reverse 0.6s linear infinite;
      }

      &:after {
        content: "";
        position: absolute;
        top: 15px;
        left: 15px;
        right: 15px;
        bottom: 15px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-top-color: #00ff00;
        animation: spin 1s linear infinite;
      }
    }
    .loader-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #333;
      z-index: 2;
      margin-top: 40px;
      font-size: 24px;
      .name {
        font-family: 'MiSans Bold', 'MiSans', sans-serif;
        font-weight: bold;
      }
      .tip {
        margin-top: 6px;
        font-size: 18px;
        opacity: 0.6;
      }
    }
  }
  .loader-section {
    position: fixed;
    top: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(var(--mask-gradient-direction), var(--mask-bg-start) 0%, var(--mask-bg-end) 100%);
    z-index: 1;
    
    &.section-left {
      left: 0;
    }
    &.section-right {
      right: 0;
    }
  }
  &.loaded {
    visibility: hidden;
    transition: v-bind('`visibility 0s ${loadingConfig.totalDuration}s`');
    .loader {
      .loader-circle,
      .loader-text {
        opacity: 0;
        transition: v-bind('`opacity ${loadingConfig.loader.duration}s ${loadingConfig.loader.startDelay}s ease-out`');
      }
    }
    .loader-section {
      &.section-left {
        transform: translateX(-100%);
        transition: 
          v-bind('`opacity ${loadingConfig.maskFade.duration}s ${loadingConfig.maskFade.startDelay}s ease-out`'),
          v-bind('`transform ${loadingConfig.maskSlide.duration}s ${loadingConfig.maskSlide.startDelay}s cubic-bezier(0.645, 0.045, 0.355, 1)`');
        /* 在滑出期间保持一定透明度，避免突然消失 */
        opacity: v-bind('loadingConfig.maskFade.opacity');
      }
      &.section-right {
        transform: translateX(100%);
        transition: 
          v-bind('`opacity ${loadingConfig.maskFade.duration}s ${loadingConfig.maskFade.startDelay}s ease-out`'),
          v-bind('`transform ${loadingConfig.maskSlide.duration}s ${loadingConfig.maskSlide.startDelay}s cubic-bezier(0.645, 0.045, 0.355, 1)`');
        /* 在滑出期间保持一定透明度，避免突然消失 */
        opacity: v-bind('loadingConfig.maskFade.opacity');
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin-reverse {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
}
</style>
