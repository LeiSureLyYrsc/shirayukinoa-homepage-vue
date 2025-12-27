<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useData } from 'vitepress'
import { getStore } from '../store'
import LeftProfile from './LeftProfile.vue'
import Footer from './Footer.vue'

// 获取VitePress数据和配置
const { theme } = useData()

// 获取store实例
const store = getStore()

// 从配置中获取个人信息数据
const personalInfo = computed(() => {
  const config = theme.value.personalHome?.personalInfo
  return {
    name: config?.name,
    title: config?.title,
    avatar: config?.avatar,
    greeting: config?.greeting,
    backgroundImage: config?.backgroundImage
  }
})

// 从配置中获取社交链接
const socialLinks = computed(() => {
  return theme.value.personalHome?.socialLinks
})

// 从配置中获取提示文本
const hintText = computed(() => {
  return theme.value.personalHome?.hintText
})

// 从配置中获取动画配置
const animationConfig = computed(() => {
  return theme.value.personalHome?.animationConfig || {
    jitterFrequency: 0.6,
    rainbowColor: true,
    fontJitter: true,
    darkMode: true,
    darkModeTransition: {
      delay: 0.1,
      duration: 0.3,
      easing: 'ease-in-out',
      properties: ['background-color', 'color', 'border-color', 'box-shadow']
    },
    backgroundScale: {
      startDelay: 1.8,
      duration: 0.8,
      fallbackDelay: 4.0
    },
    greetingHover: {
      enabled: true,
      rotation: 360,
      duration: 0.5,
      easing: 'ease-in-out',
      scale: 1.1
    }
  }
})

// 暗色模式状态 - 使用配置文件默认值
const isDarkMode = ref(false)

// 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  
  // 保存到 localStorage
  localStorage.setItem('darkMode', isDarkMode.value.toString())
  
  // 发布自定义事件通知其他组件
  const darkModeEvent = new CustomEvent('darkModeChange', { detail: { isDarkMode: isDarkMode.value } })
  window.dispatchEvent(darkModeEvent)
  
  // 设置 document class 以便全局样式可以响应
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // 为了确保组件间状态同步，可以添加一个小延迟后再次触发事件
  setTimeout(() => {
    const syncEvent = new CustomEvent('darkModeSync', { detail: { isDarkMode: isDarkMode.value } })
    window.dispatchEvent(syncEvent)
  }, 50)
}

// 背景图缩放动画状态
const isLoaded = ref(false)

// 监听store中的加载状态
watch(() => store.imgLoadStatus, (newStatus) => {
  if (newStatus) {
    // 从配置中获取背景缩放开始延迟时间
    const delayMs = (animationConfig.value.backgroundScale?.startDelay || 1.8) * 1000
    setTimeout(() => {
      isLoaded.value = true
    }, delayMs) // 使用配置文件中的延迟时间
  }
})

// 页面加载完成后的备用逻辑
onMounted(() => {
  // 初始化暗色模式：优先读取 localStorage，否则使用配置文件默认值
  const savedDarkMode = localStorage.getItem('darkMode')
  isDarkMode.value = savedDarkMode !== null ? savedDarkMode === 'true' : animationConfig.value.darkMode
  
  // 同步暗色模式状态到 document class
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // 监听其他组件发出的暗色模式变更事件
  window.addEventListener('darkModeChange', (event) => {
    if (event.detail && event.detail.isDarkMode !== undefined) {
      isDarkMode.value = event.detail.isDarkMode
    }
  })
  
  // 备用延迟，防止store状态未正确更新
  const fallbackDelayMs = (animationConfig.value.backgroundScale?.fallbackDelay || 4.0) * 1000
  setTimeout(() => {
    if (!isLoaded.value) {
      isLoaded.value = true
    }
  }, fallbackDelayMs) // 使用配置文件中的备用延迟时间
})

// Greeting 悬停动画状态
const isGreetingAnimating = ref(false)

// 处理 greeting 悬停动画
const handleGreetingHover = () => {
  const config = animationConfig.value.greetingHover
  if (!config?.enabled || isGreetingAnimating.value) {
    return // 如果动画被禁用或正在进行中，则不触发
  }
  
  isGreetingAnimating.value = true
  
  // 动画完成后重置状态
  const duration = (config.duration || 0.5) * 1000
  setTimeout(() => {
    isGreetingAnimating.value = false
  }, duration)
}

// 拆分问候语为字符数组，生成每个字符的抖动和MC jeb_风格颜色变换
const greetingChars = computed(() => {
  const text = personalInfo.value.greeting || ''
  const config = animationConfig.value
  
  return text.split('').map((char, idx) => ({
    char,
    // MC jeb_风格：每字独立色相循环延迟 (根据配置开关)
    hueDelay: config.rainbowColor ? `${(idx * 0.2).toFixed(2)}s` : '0s',
    // 抖动动画延迟：随机微调 (根据配置开关)
    jitterDelay: config.fontJitter ? `${(Math.random() * 0.3).toFixed(2)}s` : '0s'
  }))
})

</script>

<template>
  <div 
    class="personal-app" 
    :class="{ 'loaded': isLoaded, 'dark-mode': isDarkMode }"
    :style="{
      '--bg-image': personalInfo.backgroundImage ? `url('${personalInfo.backgroundImage}')` : '',
      '--bg-scale-duration': `${animationConfig.backgroundScale?.duration || 0.8}s`,
      '--dark-mode-delay': `${animationConfig.darkModeTransition?.delay || 0.1}s`,
      '--dark-mode-duration': `${animationConfig.darkModeTransition?.duration || 0.3}s`,
      '--dark-mode-easing': animationConfig.darkModeTransition?.easing || 'ease-in-out'
    }"
  >
    <!-- 左侧个人资料组件 -->
    <LeftProfile />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 问候语 -->
      <div class="greeting-container" v-if="personalInfo.greeting"
        :style="{
          '--greeting-hover-rotation': `${animationConfig.greetingHover?.rotation || 360}deg`,
          '--greeting-hover-duration': `${animationConfig.greetingHover?.duration || 0.5}s`,
          '--greeting-hover-easing': animationConfig.greetingHover?.easing || 'ease-in-out',
          '--greeting-hover-scale': animationConfig.greetingHover?.scale || 1.1
        }"
      >
        <div class="greeting" 
          :class="{ 
            'hover-enabled': animationConfig.greetingHover?.enabled !== false,
            'animating': isGreetingAnimating
          }"
          @mouseenter="handleGreetingHover"
        >
          <!-- 每个字符单独渲染以支持独立抖动 -->
          <span
            v-for="(item, idx) in greetingChars"
            :key="idx"
            class="greeting-char"
            :class="{ 
              'rainbow-enabled': animationConfig.rainbowColor, 
              'jitter-enabled': animationConfig.fontJitter 
            }"
            :style="{ 
              '--hue-delay': item.hueDelay, 
              '--jitter-delay': item.jitterDelay,
              '--jitter-duration': `${animationConfig.jitterFrequency}s`
            }"
          >
            {{ item.char }}
          </span>
        </div>
      </div>

      <!-- 个人介绍 -->
      <div class="intro" v-if="personalInfo.name || personalInfo.title">
        <h1 class="name" v-if="personalInfo.name">{{ personalInfo.name }}</h1>
        <p class="title" v-if="personalInfo.title">{{ personalInfo.title }}</p>
      </div>

      <!-- 头像 -->
      <div class="avatar-container" v-if="personalInfo.avatar">
        <img :src="personalInfo.avatar" :alt="personalInfo.name" class="avatar" />
      </div>

      <!-- 文本 -->
      <div class="hint" v-if="hintText">
        {{ hintText }}
      </div>

      <!-- 社交链接 -->
      <div class="social-links" v-if="socialLinks && socialLinks.length > 0">
        <a 
          v-for="social in socialLinks" 
          :key="social.name"
          :href="social.url"
          class="social-link"
          target="_blank"
          rel="noopener noreferrer"
          :title="social.name"
        >
          <i :class="social.icon"></i>
        </a>
      </div>

      <!-- 暗色模式切换按钮 - 根据配置显示 -->
      <div 
        class="dark-mode-container" 
        v-if="animationConfig.darkModeToggle"
        :class="animationConfig.darkModeButton?.position || 'bottom-right'"
      >
        <button 
          class="dark-mode-toggle" 
          @click="toggleDarkMode"
          :title="isDarkMode ? '切换到亮色模式' : '切换到暗色模式'"
          :style="{
            margin: animationConfig.darkModeButton?.style?.margin || '1rem',
            padding: animationConfig.darkModeButton?.style?.padding || '0.75rem 1.25rem',
            borderRadius: animationConfig.darkModeButton?.style?.borderRadius || '25px',
            backgroundColor: animationConfig.darkModeButton?.style?.backgroundColor || 'rgba(255, 255, 255, 0.1)',
            color: animationConfig.darkModeButton?.style?.color || 'rgba(255, 255, 255, 0.8)',
            backdropFilter: animationConfig.darkModeButton?.style?.backdropFilter || 'blur(10px)'
          }"
        >
          <i v-if="animationConfig.darkModeButton?.showIcon !== false" 
             :class="isDarkMode ? 
                    (animationConfig.darkModeButton?.iconDark || 'fas fa-sun') : 
                    (animationConfig.darkModeButton?.iconLight || 'fas fa-moon')"></i>
          <span v-if="animationConfig.darkModeButton?.showText !== false">
            {{ isDarkMode ? 
               (animationConfig.darkModeButton?.textDark || '亮色模式') : 
               (animationConfig.darkModeButton?.textLight || '暗色模式') }}
          </span>
        </button>
      </div>
    </main>

    <!-- 使用新的Footer组件 -->
    <Footer :isDarkMode="isDarkMode" />
  </div>
</template>

<style scoped>
.personal-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 2rem 0 2rem;
  text-align: center;
  flex: 1;
  position: relative;
  
  /* 暗色模式过渡效果 - 使用配置变量 */
  transition: 
    background-color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s),
    color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: var(--bg-image);
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    filter: blur(0px); /* 初始无模糊 */
    z-index: -1;
    transform: scale(1.5); /* 初始放大状态改为1.5倍 */
    transition: transform var(--bg-scale-duration, 0.8s) cubic-bezier(0.25, 0.46, 0.45, 0.94), 
                filter 0.6s ease-out 0.8s; /* 使用配置的缩放持续时间 */
  }
  
  &.loaded::before {
    transform: scale(1); /* 缩放到正常大小 */
    filter: blur(10px); /* 缩放完成后启用模糊 */
  }
}

.main-content {
  max-width: 600px;
  width: 100%;
  border-radius: 20px;
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateY(-3rem); /* 将整体内容往上抬 */
}

.greeting-container {
  display: inline-block;
  cursor: pointer;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.greeting {
  font-size: 2rem;
  display: inline-block;
  /* 由 .greeting-char 独立实现渐变和抖动 */
  background: none;
  animation: none;
  white-space: nowrap;
  /* 确保变换原点在中心 */
  transform-origin: center;
  /* 默认状态无变换 */
  transform: rotate(0deg) scale(1);
  /* 平滑过渡效果 */
  transition: transform var(--greeting-hover-duration, 0.5s) var(--greeting-hover-easing, ease-in-out);
}

/* Greeting 悬停旋转动画 - 通过 JavaScript 控制的类名触发 */
.greeting.hover-enabled.animating {
  transform: rotate(var(--greeting-hover-rotation, 360deg)) scale(var(--greeting-hover-scale, 1.1));
}

.greeting-char {
  display: inline-block;
  color: hsl(120, 100%, 50%); /* 默认绿色，与动画起始颜色一致 */
  /* 暗色模式过渡效果 */
  transition: color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s);
  /* 默认无动画，根据类名条件启用 */
}

.greeting-char.rainbow-enabled {
  animation: jeb-cycle 3s linear infinite;
  animation-delay: var(--hue-delay);
}

.greeting-char.jitter-enabled {
  animation: jitter var(--jitter-duration, 0.6s) ease-in-out infinite;
  animation-delay: var(--jitter-delay);
}

.greeting-char.rainbow-enabled.jitter-enabled {
  animation: jeb-cycle 3s linear infinite, jitter var(--jitter-duration, 0.6s) ease-in-out infinite;
  animation-delay: var(--hue-delay), var(--jitter-delay);
}

@keyframes spin-scale-with-pause {
  0% { 
    transform: rotate(0deg) scale(1); 
  }
  22.22% { 
    transform: rotate(540deg) scale(1.3); 
  }
  44.44% { 
    transform: rotate(1080deg) scale(1); 
  }
  44.45% { 
    transform: rotate(1080deg) scale(1); 
  }
  100% { 
    transform: rotate(1080deg) scale(1); 
  }
}

@keyframes spin-scale-fast {
  0% { 
    transform: rotate(0deg) scale(1.5) scale(1); 
  }
  50% { 
    transform: rotate(180deg) scale(1.5) scale(1.3); 
  }
  100% { 
    transform: rotate(360deg) scale(1.5) scale(1); 
  }
}

@keyframes hover-scale {
  0% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.8); 
  }
  100% { 
    transform: scale(1.5); 
  }
}
/* 彩虹渐变背景动画 */
@keyframes rainbow {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}
/* 不规则多方向抖动动画 */
@keyframes jitter {
  0% { transform: translate(0, 0); }
  15% { transform: translate(-2px, 2px); }
  30% { transform: translate(2px, -2px); }
  45% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  75% { transform: translate(-2px, 2px); }
  90% { transform: translate(2px, -2px); }
  100% { transform: translate(0, 0); }
}
/* MC jeb_风格色相循环动画 - 从绿色开始 */
@keyframes jeb-cycle {
  0%   { color: hsl(120, 100%, 50%); }  /* 绿色 */
  16%  { color: hsl(180, 100%, 50%); }  /* 青色 */
  33%  { color: hsl(240, 100%, 50%); }  /* 蓝色 */
  50%  { color: hsl(300, 100%, 50%); }  /* 紫色 */
  66%  { color: hsl(0, 100%, 50%); }    /* 红色 */
  83%  { color: hsl(60, 100%, 50%); }   /* 黄色 */
  100% { color: hsl(120, 100%, 50%); }  /* 绿色 */
}

.intro {
  margin-bottom: 2rem;
}

.name {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #228b22 0%, #32cd32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  /* 暗色模式过渡效果 */
  transition: background var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s);
}

.title {
  font-size: 1.2rem;
  margin: 0;
  /* 暗色模式过渡效果 */
  transition: color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s);
}

.avatar-container {
  margin: 2rem 0;
  transform: translateY(-2rem); /* 将头像往上抬 */
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #f3f4f6;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
}

.hint {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  transform: translateY(-2rem); /* 将提示文本往上抬 */
  /* 暗色模式过渡效果 */
  transition: color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s);
}

.social-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  transform: translateY(-2rem); /* 将社交链接往上抬 */
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  text-decoration: none;
  font-size: 1.2rem;
  /* 使用配置的过渡效果 */
  transition: 
    background-color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s),
    color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s),
    transform 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.dark-mode-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  transform: translateY(-2rem);
  
  /* 根据配置调整位置 */
  &.top-right {
    position: fixed;
    top: 0;
    right: 0;
    margin-bottom: 0;
    transform: none;
    z-index: 100;
  }
  
  &.top-left {
    position: fixed;
    top: 0;
    left: 0;
    margin-bottom: 0;
    transform: none;
    z-index: 100;
  }
  
  &.bottom-right {
    position: fixed;
    bottom: 5rem; /* 为了不与页脚重叠 */
    right: 0;
    margin-bottom: 0;
    transform: none;
    z-index: 100;
  }
  
  &.bottom-left {
    position: fixed;
    bottom: 5rem; /* 为了不与页脚重叠 */
    left: 0;
    margin-bottom: 0;
    transform: none;
    z-index: 100;
  }
}

.dark-mode-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 25px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  /* 使用配置的过渡效果 */
  transition: 
    background-color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s),
    color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s),
    transform 0.3s ease;
  backdrop-filter: blur(10px);
  font-size: 0.9rem;
}

.dark-mode-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.dark-mode-toggle i {
  font-size: 1rem;
}

.dark-mode-toggle span {
  margin-left: 0.25rem;
}

/* 暗色模式样式 */
.personal-app.dark-mode {
  /* 页脚样式已移至Footer.vue组件 */
  
  .dark-mode-toggle {
    /* 除非配置中明确设置，否则使用这些默认值 */
    background: rgba(0, 0, 0, 0.2) !important;
    color: rgba(255, 255, 255, 0.9) !important;
  }
  
  .dark-mode-toggle:hover {
    background: rgba(0, 0, 0, 0.4) !important;
    color: rgba(255, 255, 255, 1) !important;
  }
  
  .social-link {
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }
  
  .social-link:hover {
    background: rgba(0, 0, 0, 0.3);
  }
  
  /* 文字颜色反转 */
  .greeting {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .name {
    background: linear-gradient(135deg, #90ee90 0%, #98fb98 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .title {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .hint {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .footer-text {
    color: rgba(255, 255, 255, 0.9);
  }
  
  &::before {
    filter: blur(0px) brightness(0.7);
  }
  
  &.loaded::before {
    filter: blur(10px) brightness(0.7);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .personal-app {
    padding: 1rem;
  }
  
  .name {
    font-size: 2.5rem;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .name {
    font-size: 2rem;
  }
  
  .social-links {
    gap: 0.75rem;
  }
  
  .social-link {
    width: 40px;
    height: 40px;
  }
}
</style>
