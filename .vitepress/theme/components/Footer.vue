<script setup>
import { ref, computed, onMounted } from 'vue'
import { useData } from 'vitepress'

// 获取VitePress数据和配置
const { theme } = useData()

// 从父组件接收的暗色模式状态
const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

// 内部的暗色模式状态，与父组件同步
const localDarkMode = ref(props.isDarkMode)

// 监听父组件的暗色模式变化
onMounted(() => {
  // 初始同步
  localDarkMode.value = props.isDarkMode
  
  // 监听全局暗色模式变更事件
  window.addEventListener('darkModeChange', (event) => {
    if (event.detail && event.detail.isDarkMode !== undefined) {
      localDarkMode.value = event.detail.isDarkMode
    }
  })
  
  // 也可以通过监控 document.documentElement.classList 来检测变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isDark = document.documentElement.classList.contains('dark')
        localDarkMode.value = isDark
      }
    })
  })
  
  observer.observe(document.documentElement, { attributes: true })
})

// 获取当前年份
const currentYear = ref(new Date().getFullYear())
</script>

<template>
  <footer class="footer" :class="{ 'dark-mode': localDarkMode }" 
          :style="{
            '--dark-mode-delay': '0s',
            '--dark-mode-duration': '0.3s',
            '--dark-mode-easing': 'ease-in-out'
          }">
    <p class="footer-text">
      Powered by <a href="https://github.com/LeiSureLyYrsc" target="_blank" title="作者">筱狗Murasame</a> | © 2025-{{ currentYear }} | MIT License
      <br>
      <a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2025120188号-2</a>
    </p>
  </footer>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  z-index: 10;
  text-align: center;
  /* 暗色模式过渡效果 */
  transition: 
    background-color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s),
    color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s);
}

.footer-text {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  /* 暗色模式过渡效果 */
  transition: color var(--dark-mode-duration, 0.3s) var(--dark-mode-easing, ease-in-out) var(--dark-mode-delay, 0.1s);
}

.footer-text a,
.footer-year a {
  color: #6495ed;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-text a:hover,
.footer-year a:hover {
  color: #4169e1;
  text-decoration: underline;
}

.footer-year {
  margin: 0;
  font-size: 0.8rem;
}

/* 暗色模式样式 */
.footer.dark-mode {
  background: rgba(0, 0, 0, 0.3);
  color: rgba(255, 255, 255, 0.9);
}

.footer.dark-mode .footer-text {
  color: rgba(255, 255, 255, 0.9);
}

.footer.dark-mode .footer-text a {
  color: #87ceeb;
}

.footer.dark-mode .footer-text a:hover {
  color: #add8e6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer {
    padding: 0.8rem 1.5rem;
  }
  
  .footer-text {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 0.6rem 1rem;
  }
  
  .footer-text {
    font-size: 0.8rem;
  }
}
</style>
