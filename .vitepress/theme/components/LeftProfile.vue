<template>
  <!-- 新的居中展开按钮 -->
  <div 
    class="centered-toggle-btn"
    @click="toggleProfileVisible"
    v-if="!isProfileVisible && profileConfig && profileConfig.enabled"
    :title="'显示个人资料'"
  >
    <i class="fas fa-chevron-right"></i>
  </div>

  <div 
    class="left-profile" 
    v-if="profileConfig && profileConfig.enabled"
    :class="{ 'hidden': !isProfileVisible, 'sliding': isSliding }"
    :style="{
      '--profile-left': layoutConfig.position.left,
      '--profile-top': layoutConfig.position.top,
      '--profile-transform': layoutConfig.position.transform,
      '--profile-width': layoutConfig.size.width,
      '--profile-max-width': layoutConfig.size.maxWidth,
      '--card-padding': layoutConfig.card.padding,
      '--card-border-radius': layoutConfig.card.borderRadius,
      '--card-backdrop': layoutConfig.card.backdrop,
      '--card-shadow': layoutConfig.card.shadow,
      '--avatar-size': layoutConfig.avatar.size,
      '--avatar-border-width': layoutConfig.avatar.borderWidth,
      '--responsive-1500-left': layoutConfig.responsive.breakpoint1500.left,
      '--responsive-1500-width': layoutConfig.responsive.breakpoint1500.width,
      '--responsive-1500-padding': layoutConfig.responsive.breakpoint1500.padding,
      '--responsive-1400-left': layoutConfig.responsive.breakpoint1400.left,
      '--responsive-1400-width': layoutConfig.responsive.breakpoint1400.width,
      '--responsive-1400-padding': layoutConfig.responsive.breakpoint1400.padding,
      '--responsive-1400-avatar': layoutConfig.responsive.breakpoint1400.avatarSize || layoutConfig.avatar.size
    }"
  >
    <div class="profile-card">
      <!-- 关闭按钮 -->
      <div class="close-profile-btn" @click="toggleProfileVisible" title="隐藏个人资料">
        <i class="fa-solid fa-right-to-bracket"></i>
      </div>
      
      <!-- 头像区域 -->
      <div class="avatar-section" v-if="profileConfig.avatar">
        <img 
          :src="profileConfig.avatar" 
          :alt="profileConfig.name || '头像'" 
          class="profile-avatar"
        />
      </div>
      
      <!-- 个人信息 -->
      <div class="info-section">
        <h3 class="profile-name" v-if="profileConfig.name">
          {{ profileConfig.name }}
        </h3>
        <p class="profile-location" v-if="profileConfig.location">
          <i :class="profileConfig.locationIcon || 'fa-solid fa-globe'" class="location-icon"></i>
          <span class="location-text">{{ profileConfig.location }}</span>
        </p>
        <p class="profile-title" v-if="profileConfig.title">
          {{ profileConfig.title }}
        </p>
        <p class="profile-description" v-if="profileConfig.description">
          {{ profileConfig.description }}
        </p>
      </div>
      
      <!-- 更多链接区域 -->
      <div class="links-section" v-if="profileConfig.moreLinks && profileConfig.moreLinks.length > 0">
        <h4 class="links-title">{{ profileConfig.linksSectionTitle || '更多链接' }}</h4>
        
        <!-- 分页导航 -->
        <div class="pagination-nav" v-if="showPagination">
          <button 
            class="pagination-btn prev-btn"
            :class="{ disabled: !canGoToPrev }"
            :disabled="!canGoToPrev"
            @click="goToPrevPage"
            :title="'上一页'"
          >
            <i class="fas fa-chevron-up"></i>
          </button>
          
          <div class="page-indicator" v-if="paginationConfig.showPageIndicator">
            <span class="current-page">{{ currentPage }}</span>
            <span class="page-separator">/</span>
            <span class="total-pages">{{ totalPages }}</span>
          </div>
          
          <button 
            class="pagination-btn next-btn"
            :class="{ disabled: !canGoToNext }"
            :disabled="!canGoToNext"
            @click="goToNextPage"
            :title="'下一页'"
          >
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
        
        <!-- 链接列表 -->
        <div 
          class="links-container"
          @wheel="handleWheel"
          ref="linksContainerRef"
          :style="{ 
            height: showPagination ? containerHeight : 'auto',
            transition: `height ${(paginationConfig.animation?.resizeDuration || 0.4) * 1000}ms ${currentPageLinks.length > 3 ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : paginationConfig.animation?.easing || 'ease-out'}`
          }"
        >
          <ul 
            class="links-list"
            :class="{ 'animating': isAnimating }"
          >
            <li 
              v-for="(link, index) in currentPageLinks" 
              :key="`${link.name}-${index}-${currentPage}`"
              class="link-item"
              :class="{ 
                'stagger-animation': enableStagger, 
                'expanding-page': currentPageLinks.length > 3 
              }"
              :style="enableStagger ? { 
                'animation-delay': `${staggerDelay(index)}s`,
                'opacity': 'inherit', /* 允许自然继承，而不是在动画期间强制隐藏 */
                'transform-origin': 'center top' /* 从顶部开始变换，使扩展更自然 */
              } : {}"
            >
              <a 
                :href="link.url" 
                :target="link.external !== false ? '_blank' : '_self'"
                :rel="link.external !== false ? 'noopener noreferrer' : ''"
                class="link"
                :title="link.description || link.name"
              >
                <i v-if="link.icon" :class="link.icon" class="link-icon"></i>
                <span class="link-text">{{ link.name }}</span>
                <i v-if="link.external !== false" class="fas fa-external-link-alt external-icon"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useData } from 'vitepress'

// 获取VitePress数据和配置
const { theme } = useData()

// 分页状态
const currentPage = ref(1)

// 动画状态
const isAnimating = ref(false)

// 滚轮相关
const wheelTimeout = ref(null)

// 模板引用
const linksContainerRef = ref(null)

// 响应式显示相关
const isProfileVisible = ref(true) // 默认显示
const isSliding = ref(false) // 是否正在进行滑动动画
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0) // 当前窗口宽度

// 从配置中获取左侧个人资料配置
const profileConfig = computed(() => {
  return theme.value.personalHome?.leftProfile || null
})

// 从配置中获取布局设置
const layoutConfig = computed(() => {
  return profileConfig.value?.layout || {
    position: { left: '3rem', top: '50%', transform: 'translateY(-50%)' },
    size: { width: '320px', maxWidth: '320px' },
    card: { padding: '2rem', borderRadius: '24px', backdrop: 'blur(20px)', shadow: '0 8px 32px rgba(0, 0, 0, 0.1)' },
    avatar: { size: '100px', borderWidth: '3px' },
    responsive: {
      breakpoint1500: { left: '2.5rem', width: '300px', padding: '1.75rem' },
      breakpoint1400: { left: '2rem', width: '280px', padding: '1.5rem', avatarSize: '90px' },
      hideBelow: '1200px'
    }
  }
})

// 分页配置
const paginationConfig = computed(() => {
  return profileConfig.value?.pagination || {
    enabled: true,
    itemsPerPage: 5,
    showPageIndicator: true,
    style: {
      buttonStyle: 'rounded',
      showPageNumbers: true,
      animationType: 'slide'
    },
    animation: {
      duration: 0.3,
      easing: 'ease-out',
      enableWheel: true,
      wheelCooldown: 0.3,
      enableResize: true,
      resizeDuration: 0.4
    }
  }
})

// 获取所有链接
const allLinks = computed(() => {
  return profileConfig.value?.moreLinks || []
})

// 计算总页数
const totalPages = computed(() => {
  if (!allLinks.value.length || !paginationConfig.value.enabled) return 1
  return Math.ceil(allLinks.value.length / paginationConfig.value.itemsPerPage)
})

// 是否显示分页
const showPagination = computed(() => {
  return paginationConfig.value.enabled && 
         allLinks.value.length > paginationConfig.value.itemsPerPage
})

// 当前页链接
const currentPageLinks = computed(() => {
  if (!paginationConfig.value.enabled) {
    return allLinks.value
  }
  
  const startIndex = (currentPage.value - 1) * paginationConfig.value.itemsPerPage
  const endIndex = startIndex + paginationConfig.value.itemsPerPage
  return allLinks.value.slice(startIndex, endIndex)
})  // 动态容器高度计算
const containerHeight = computed(() => {
  if (!showPagination.value) {
    return 'auto'
  }
  
  const currentLinksCount = currentPageLinks.value.length
  
  // 精确的高度计算，基于实际CSS
  // .link 元素：
  //   - padding: 0.75rem (12px) 上下 = 24px
  //   - font-size: 0.95rem ≈ 15.2px
  //   - line-height: 默认约1.2 ≈ 18px
  //   - border: 1px = 2px
  //   - 图标和间距: ≈ 4px
  // .link-item margin-bottom: 0.75rem = 12px (除了最后一个)
  
  const linkPadding = 24        // 上下padding
  const textHeight = 18         // 文字行高  
  const borderAndSpacing = 6    // border + 额外间距
  const singleLinkHeight = linkPadding + textHeight + borderAndSpacing // = 48px
  const linkMargin = 12         // margin-bottom
  
  // 为了确保完整显示，添加充足的缓冲空间
  // 根据链接数量动态增加缓冲区，确保链接变多时有更多空间
  const baseBuffer = 24
  const dynamicBuffer = currentLinksCount > 3 ? currentLinksCount * 2 : 0 // 链接数多时增加缓冲
  const buffer = baseBuffer + dynamicBuffer
  
  const totalHeight = currentLinksCount > 0 
    ? (singleLinkHeight * currentLinksCount) + (linkMargin * Math.max(0, currentLinksCount - 1)) + buffer
    : 100 // 增加最小高度
  
  return `${Math.max(totalHeight, 100)}px`
})

// 分页控制
const canGoToPrev = computed(() => currentPage.value > 1)
const canGoToNext = computed(() => currentPage.value < totalPages.value)

// 动画持续时间的 CSS 变量
const animationDurationCSS = computed(() => {
  const duration = paginationConfig.value.animation?.duration || 0.2
  return `${duration}s`
})

// Stagger 动画相关
const enableStagger = computed(() => {
  return paginationConfig.value.animation?.stagger?.enabled || false
})

const staggerDelay = (index) => {
  if (!enableStagger.value) return 0
  const baseDelay = paginationConfig.value.animation?.stagger?.startDelay || 0.05
  const staggerDelay = paginationConfig.value.animation?.stagger?.delay || 0.08
  return baseDelay + (index * staggerDelay)
}

// 简单的页面切换函数，带有动态大小变换动画
const changePage = (newPage) => {
  if (currentPage.value === newPage) return // 仅检查是否是相同页面，移除 isAnimating.value 检查
  
  const duration = (paginationConfig.value.animation?.duration || 0.2) * 1000
  const resizeDuration = (paginationConfig.value.animation?.resizeDuration || 0.2) * 1000
  
  // 如果当前有动画进行中，清除之前的动画计时器
  if (isAnimating.value) {
    // 保持动画状态为 true，但允许更新页码
  } else {
    isAnimating.value = true
  }
  
  // 让当前页淡出
  setTimeout(() => {
    // 检查新页面是否比当前页面有更多链接，需要更大的容器高度
    const currentCount = currentPageLinks.value.length
    const startIndex = (newPage - 1) * paginationConfig.value.itemsPerPage
    const endIndex = startIndex + paginationConfig.value.itemsPerPage
    const newPageLinksCount = allLinks.value.slice(startIndex, endIndex).length
    
    // 如果新页面链接数更多，先设置一个更大的容器高度
    if (newPageLinksCount > currentCount && linksContainerRef.value) {
      // 预先扩展容器高度，准备容纳更多内容
      const additionalHeight = (newPageLinksCount - currentCount) * 60 // 每个链接估计高度
      linksContainerRef.value.style.willChange = 'height'
    }
    
    // 切换到新页面内容，触发高度变化
    currentPage.value = newPage
    
    // 强制重新应用 stagger 动画
    if (enableStagger.value) {
      // 强制重排，确保动画重新应用
      if (linksContainerRef.value) {
        linksContainerRef.value.style.display = 'none'
        linksContainerRef.value.offsetHeight // 触发重排
        linksContainerRef.value.style.display = ''
      }
    }
    
    // 计算 stagger 动画的总时长 - 但缩短，以便快速响应
    let staggerTotalDuration = 0
    if (enableStagger.value && currentPageLinks.value.length > 0) {
      const lastIndex = currentPageLinks.value.length - 1
      const lastDelay = staggerDelay(lastIndex) * 1000
      const animDuration = duration / 2 // 减半动画总时长，增强响应性
      staggerTotalDuration = lastDelay + animDuration
    }
    
    // 缩短设置为非动画状态的时间，提高响应性
    const totalDuration = Math.max(duration / 2, resizeDuration / 2, staggerTotalDuration / 2) // 减少总体动画时间
    setTimeout(() => {
      isAnimating.value = false
      // 清理性能优化属性
      if (linksContainerRef.value) {
        linksContainerRef.value.style.willChange = 'auto'
      }
    }, totalDuration)
  }, 50) // 短暂延迟让当前页面有时间淡出
}

const goToPrevPage = () => {
  if (canGoToPrev.value) { // 移除 !isAnimating.value 条件检查
    changePage(currentPage.value - 1)
  }
}

const goToNextPage = () => {
  if (canGoToNext.value) { // 移除 !isAnimating.value 条件检查
    changePage(currentPage.value + 1)
  }
}

// 滚轮事件处理
const handleWheel = (event) => {
  if (!showPagination.value || !paginationConfig.value.animation?.enableWheel) return
  
  event.preventDefault()
  
  // 防止过快切换
  if (wheelTimeout.value) {
    clearTimeout(wheelTimeout.value)
  }
  
  wheelTimeout.value = setTimeout(() => {
    const deltaY = event.deltaY
    
    if (deltaY > 0) {
      // 向下滚动，下一页
      goToNextPage()
    } else if (deltaY < 0) {
      // 向上滚动，上一页
      goToPrevPage()
    }
  }, 20) // 减少防抖时间，提升响应速度
}

// 处理个人资料显示/隐藏的函数
const toggleProfileVisible = () => {
  isSliding.value = true
  isProfileVisible.value = !isProfileVisible.value
  
  // 移除 localStorage 持久化，每次刷新页面都重置为初始状态
  
  // 添加动画结束后的回调
  setTimeout(() => {
    isSliding.value = false
  }, 600) // 动画持续时间后移除滑动状态，与 CSS transition 保持一致
}

// 检查窗口大小
const checkWindowSize = () => {
  if (typeof window === 'undefined') return
  
  windowWidth.value = window.innerWidth
  const breakpointWidth = parseBreakpoint(layoutConfig.value.responsive.hideBelow || '1200px')
  
  // 每次加载时根据屏幕大小设置显示状态，不读取本地存储
  // 小屏幕默认隐藏，大屏幕默认显示
  isProfileVisible.value = !(windowWidth.value <= breakpointWidth)
}

// 解析断点字符串
const parseBreakpoint = (breakpoint) => {
  if (!breakpoint) return 1200 // 默认值
  return parseInt(breakpoint.replace(/[^0-9]/g, ''), 10) || 1200
}

// 重置所有交互状态
const resetInteractionStates = () => {
  // 重置分页到第一页
  currentPage.value = 1
  // 重置动画状态
  isAnimating.value = false
  // 重置滑动状态
  isSliding.value = false
  // 其他需要重置的状态可以在这里添加
}

// 生命周期
onMounted(() => {
  // 重置所有交互状态
  resetInteractionStates()
  
  // 检查初始窗口大小
  checkWindowSize()
  
  // 添加窗口大小变化事件监听
  window.addEventListener('resize', checkWindowSize)
})

onUnmounted(() => {
  // 清理定时器
  if (wheelTimeout.value) {
    clearTimeout(wheelTimeout.value)
  }
  
  // 移除窗口大小变化事件监听
  window.removeEventListener('resize', checkWindowSize)
})

// 监听窗口大小变化
watch(() => windowWidth.value, (newWidth) => {
  const breakpointWidth = parseBreakpoint(layoutConfig.value.responsive.hideBelow || '1200px')
  
  // 窗口大小改变时始终调整显示状态，不考虑用户之前的设置
  // 小屏幕默认隐藏，大屏幕默认显示
  isProfileVisible.value = !(newWidth <= breakpointWidth)
})
</script>

<style scoped>
.left-profile {
  position: fixed;
  left: var(--profile-left, 3rem);
  top: var(--profile-top, 50%);
  transform: translateY(-50%); /* 固定垂直居中，不使用变量以避免动画冲突 */
  z-index: 100;
  max-width: var(--profile-max-width, 320px);
  width: var(--profile-width, 320px);
  transform-style: preserve-3d; /* 确保3D变换效果 */
  backface-visibility: hidden; /* 优化平移动画 */
}

.profile-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: var(--card-backdrop, blur(20px));
  border-radius: var(--card-border-radius, 24px);
  padding: var(--card-padding, 2rem);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow, 0 8px 32px rgba(0, 0, 0, 0.1));
}

.profile-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.avatar-section {
  text-align: center;
  margin-bottom: 0.1rem; /* 减小头像下方的边距 */
}

.profile-avatar {
  width: var(--avatar-size, 100px);
  height: var(--avatar-size, 100px);
  border-radius: 50%;
  object-fit: cover;
  border: var(--avatar-border-width, 3px) solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.1);
}

.info-section {
  text-align: center;
  margin-bottom: 1.2rem; /* 减小信息部分的底部边距 */
}

.profile-name {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0rem 0; /* 减小名称的底部边距 */
  color: rgba(255, 255, 255, 0.9);
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-location {
  font-size: 0.9rem;
  margin: 0 0 0.4rem 0; /* 减小底部边距 */
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem; /* 减小图标和文本之间的间距 */
}

.location-icon {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  opacity: 0.9;
  display: inline-block; /* 确保图标和文本平行 */
  vertical-align: middle; /* 垂直居中对齐 */
}

.location-text {
  font-weight: 500;
  display: inline-block; /* 确保图标和文本平行 */
  vertical-align: middle; /* 垂直居中对齐 */
}

.profile-title {
  font-size: 1rem;
  margin: 0 0 0.5rem 0; /* 减小标题的底部边距 */
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
}

.profile-description {
  font-size: 0.9rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
}

.links-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 0.75rem;
}

/* 链接容器和动画样式 */
.links-container {
  position: relative;
  overflow: visible; /* 确保内容不被裁剪 */
  will-change: height; /* 优化高度变化动画性能 */
  /* 高度过渡在内联样式中定义，可以使用配置的参数 */
  transform-style: preserve-3d; /* 提升渲染层，优化动画 */
  backface-visibility: hidden; /* 优化渲染性能 */
}

.links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  transition: opacity v-bind(animationDurationCSS) ease-out, transform v-bind(animationDurationCSS) ease-out;
  /* 确保内容在高度变化时保持流畅 */
  min-height: 0;
  position: relative;
  z-index: 2; /* 确保链接列表在动画期间不受其他元素干扰 */
}

.links-list.animating {
  opacity: 0.6; /* 提高透明度，使内容更清晰可见 */
  transform: translateY(5px); /* 减少变换幅度 */
  /* 移除 pointer-events: none，允许动画期间进行交互 */
}

/* 链接项样式 */
.link-item {
  margin-bottom: 0.75rem;
  /* 为新页面的链接项添加淡入效果 */
  animation: linkSlideIn v-bind(animationDurationCSS) ease-out both;
  will-change: opacity, transform; /* 优化动画性能 */
}

/* 交错动画的链接项 */
.link-item.stagger-animation {
  opacity: 0;
  /* 初始状态设置为不可见，通过延迟动画显示 */
  animation: staggerFadeIn v-bind(animationDurationCSS) ease-out forwards;
  /* 延迟通过 inline style 设置 */
}

/* 扩展页面的链接项特殊动画 */
.link-item.expanding-page {
  animation-duration: calc(v-bind(animationDurationCSS) * 1.2); /* 略微延长动画时间 */
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* 更自然的缓动 */
}

.link-item:last-child {
  margin-bottom: 0; /* 最后一个链接项不需要底边距 */
}

/* 新页面链接项的淡入动画 */
@keyframes linkSlideIn {
  0% {
    opacity: 0;
    transform: translateY(5px); /* 减少移动距离，提升动画速度 */
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
}

.link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(4px);
}

.link-icon {
  margin-right: 0.75rem;
  width: 18px;
  text-align: center;
  font-size: 1rem;
}

.link-text {
  flex: 1;
  font-size: 0.95rem;
}

.external-icon {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-left: 0.5rem;
}

/* 分页样式 */
.pagination-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.pagination-btn:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
}

.pagination-btn.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 动画期间按钮样式 */
.links-list.animating ~ .pagination-nav .pagination-btn:not(.disabled) {
  opacity: 0.6;
  transform: scale(0.95);
  pointer-events: none;
}

.page-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  user-select: none;
}

.current-page {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.page-separator {
  color: rgba(255, 255, 255, 0.5);
}

.total-pages {
  color: rgba(255, 255, 255, 0.6);
}

.link-item.fade-in {
  animation: fadeIn v-bind(animationDurationCSS) ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px); /* 减少移动距离，更快速 */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 交错动画关键帧 */
@keyframes staggerFadeIn {
  0% {
    opacity: 0;
    transform: translateY(5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 当页面扩展时的特殊动画 - 支持容器高度增加 */
.expanding-page.stagger-animation {
  animation-name: expandingStaggerFadeIn;
}

@keyframes expandingStaggerFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(5px);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.02) translateY(-2px); /* 轻微放大，给人一种"展开"的感觉 */
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.contact-section {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 1rem;
}

.contact-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.contact-items {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.contact-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

/* 响应式设计 - 使用配置变量 */
@media (max-width: 1500px) {
  .left-profile {
    left: var(--responsive-1500-left, 2.5rem);
    max-width: var(--responsive-1500-width, 300px);
    width: var(--responsive-1500-width, 300px);
  }
  
  .profile-card {
    padding: var(--responsive-1500-padding, 1.75rem);
  }
}

@media (max-width: 1400px) {
  .left-profile {
    left: var(--responsive-1400-left, 2rem);
    max-width: var(--responsive-1400-width, 280px);
    width: var(--responsive-1400-width, 280px);
  }
  
  .profile-card {
    padding: var(--responsive-1400-padding, 1.5rem);
  }
  
  .profile-avatar {
    width: var(--responsive-1400-avatar, 90px);
    height: var(--responsive-1400-avatar, 90px);
  }
  
  .profile-name {
    font-size: 1.3rem;
  }
  
  .profile-title {
    font-size: 0.95rem;
  }
  
  .profile-description {
    font-size: 0.85rem;
  }
}

/* 移除了媒体查询中的 display: none，改为通过 JS 控制显示/隐藏 */
/* 为响应式布局添加过渡效果 */
.left-profile {
  transition: transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1); /* 使用平滑的缓动函数，增加持续时间使平移更明显 */
  transform-origin: left center; /* 确保从左侧开始变换 */
  will-change: transform; /* 优化平移性能 */
}

/* 隐藏状态 - 向左平移出视图 */
.left-profile.hidden {
  transform: translateX(-120%) translateY(-50%) !important; /* 使用负百分比确保完全移出视图 */
  pointer-events: none; /* 隐藏时禁用交互 */
  opacity: 1; /* 保持不透明度，专注于平移效果 */
}

/* 滑动动画时的状态 */
.left-profile.sliding {
  will-change: transform; /* 优化平移动画性能 */
}

/* 添加入场动画 - 从左向右平移 */
@keyframes slideInFromLeft {
  0% {
    transform: translateX(-120%) translateY(-50%);
  }
  100% {
    transform: translateX(0) translateY(-50%);
  }
}

/* 添加出场动画 - 从右向左平移 */
@keyframes slideOutToLeft {
  0% {
    transform: translateX(0) translateY(-50%);
  }
  100% {
    transform: translateX(-120%) translateY(-50%);
  }
}

/* 切换按钮样式 */
/* 新的居中展开按钮 */
.centered-toggle-btn {
  position: fixed;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-left: none;
  border-radius: 0 12px 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 101;
  transition: all 0.3s ease, background-color 0.2s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 根据配置动态计算居中按钮的位置 */
.centered-toggle-btn {
  /* 使用 CSS 变量保持在控件的水平中心点 */
  left: 0;
  /* 垂直位置保持与左侧个人资料相同 */
  top: var(--profile-top, 50%);
  transform: translateY(-50%);
}

.centered-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%);
  opacity: 0;
  transition: opacity 0.3s;
}

.centered-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 2px 2px 15px rgba(0, 0, 0, 0.15);
}

.centered-toggle-btn:hover::before {
  opacity: 1;
}

.centered-toggle-btn:active {
  transform: translateY(-50%) scale(0.95);
}

.centered-toggle-btn i {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  transition: transform 0.3s;
}

.centered-toggle-btn:hover i {
  transform: scale(1.2);
  color: rgba(255, 255, 255, 1);
}

/* 右上角关闭按钮样式 */
.close-profile-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
}

.close-profile-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(180deg);
}

.close-profile-btn i {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.close-profile-btn:hover i {
  color: rgba(255, 255, 255, 1);
}

/* 暗色模式样式 - 适配自定义暗色模式 */
.personal-app.dark-mode .left-profile {
  .profile-card {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  .profile-card:hover {
    background: rgba(0, 0, 0, 0.5);
  }
  
  .profile-name {
    background: linear-gradient(135deg, #90ee90 0%, #98fb98 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .link {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .link:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .pagination-btn {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .pagination-btn:hover:not(.disabled) {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .pagination-btn.disabled {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

/* VitePress 暗色模式样式 */
html.dark .left-profile {
  .profile-card {
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .profile-card:hover {
    background: rgba(30, 30, 30, 0.9);
  }
  
  .profile-name {
    color: #42b883;
  }
  
  .profile-title, .profile-description, .profile-location {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .location-icon {
    color: rgba(255, 255, 255, 0.9);
  }
  
  .links-title, .contact-title {
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .link {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }
  
  .link:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 1);
  }
  
  .pagination-btn {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }
  
  .pagination-btn:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 1);
  }
  
  .pagination-btn.disabled {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.08);
  }
  
  .centered-toggle-btn {
    background: rgba(30, 30, 30, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.25);
  }
  
  .centered-toggle-btn::before {
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 50%);
  }
  
  .centered-toggle-btn:hover {
    background: rgba(40, 40, 40, 0.9);
    box-shadow: 2px 2px 15px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.15);
  }
  
  .centered-toggle-btn i {
    color: rgba(255, 255, 255, 0.8);
  }
  
  .centered-toggle-btn:hover i {
    color: #42b883; /* 使用与网站主题一致的绿色 */
  }
  
  .close-profile-btn {
    background: rgba(30, 30, 30, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .close-profile-btn:hover {
    background: rgba(40, 40, 40, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .close-profile-btn i {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .close-profile-btn:hover i {
    color: #42b883; /* 与网站主题一致的绿色 */
  }
}

/* 移动设备适配样式 */
@media (max-width: 768px) {
  .centered-toggle-btn {
    height: 80px; /* 移动设备上增加按钮高度，便于触摸 */
    width: 40px;
    top: 30%; /* 更靠上的位置，避免手机屏幕中间区域可能被其他交互覆盖 */
  }
  
  .centered-toggle-btn i {
    font-size: 1.1rem;
  }
  
  /* 移动设备上调整滑动距离和动画速度 */
  .left-profile.hidden {
    transform: translateX(-120%) translateY(-50%) !important; /* 移动设备上滑动更远，确保完全离开视图并保持垂直居中 */
  }
  
  .left-profile {
    transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1); /* 移动设备上使用适当的动画速度 */
  }
  
  /* 移动设备上增大关闭按钮 */
  .close-profile-btn {
    width: 38px;
    height: 38px;
    top: 10px;
    right: 10px;
  }
  
  .close-profile-btn i {
    font-size: 1rem;
  }
}
</style>
