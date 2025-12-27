<script setup lang="ts">
import { useData, useRouter } from 'vitepress'
import { ref, onMounted, watch } from 'vue'
import PersonalHome from './components/PersonalHome.vue'
import Loading from './components/Loading.vue'
import { getStore } from './store'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter, page } = useData()
const router = useRouter()

// 获取store实例
const store = getStore()

// 检查并重定向到主页
const checkAndRedirectToHome = () => {
  // 获取当前路径
  const currentPath = page.value.relativePath
  
  // 如果不是主页路径（index.md），强制重定向到主页
  if (currentPath !== 'index.md' && currentPath !== '') {
    // 使用 window.location 进行强制重定向，确保完全跳转到主页
    window.location.href = '/'
    return true
  }
  return false
}

// 模拟背景图片加载
const simulateImageLoad = () => {
  // 模拟随机加载时间（300-600ms）
  const loadTime = Math.floor(Math.random() * (600 - 300 + 1)) + 300
  
  setTimeout(() => {
    store.setImgLoadStatus(true)
  }, loadTime)
}

// 页面加载完成
onMounted(() => {
  // 首先检查是否需要重定向
  const redirected = checkAndRedirectToHome()
  
  // 如果没有重定向，才开始模拟背景图片加载
  if (!redirected) {
    simulateImageLoad()
  }
})

// 监听路由变化，确保任何路由变化都会重定向到主页
watch(() => page.value.relativePath, (newPath) => {
  if (newPath !== 'index.md' && newPath !== '') {
    window.location.href = '/'
  }
})
</script>

<template>
  <!-- 只显示主页内容，非主页路径会被重定向 -->
  <PersonalHome />
  
  <!-- 加载遮罩 - 叠加在主页上 -->
  <Loading />
</template>
