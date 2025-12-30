import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default 
defineConfig({
  title: "Murasame's Homepage",
  description: "我已经下了决心，要与深爱的少女一起在这片土地生活下去。",
  head: [
    ['link', { rel: 'icon', href: '/assets/kawaii.jpg' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@xiaomi/misans@latest/lib/Bold/result.css' }]
  ],
  
  // 重定向路径到主页，但排除静态资源
  rewrites: {
    ':path((?!assets/).*)': 'index.md'
  },

  // 清理 URL，移除 .html 后缀
  cleanUrls: true,
  
  // Vite 配置
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler' // 使用现代 Sass API，解决 legacy-js-api 警告
        },
        sass: {
          api: 'modern-compiler' // 同时配置 sass 和 scss
        }
      }
    }
  },

  themeConfig: {
    // 自定义个人主页配置
    personalHome: {
      // 个人信息
      personalInfo: {
        name: 'ムラサメ',
        title: '我喜欢你',
        avatar: '/assets/kawaii.jpg',
        greeting: 'Ciallo～(∠・ω< )⌒★',
        backgroundImage: '/assets/Murasame.jpg'
      },
      
      // 社交链接
      socialLinks: [
        { name: 'GitHub', url: 'https://github.com/LeiSureLyYrsc', icon: 'fab fa-github' },
        { name: 'Twitter', url: 'https://twitter.com/LeiSureLy_Yrsc', icon: 'fab fa-x' },
        { name: 'Mailto', url: 'mailto:congyu@sbhfy.cn', icon: 'fa fa-envelope' }
      ],
      
      // 介绍文本
      hintText: '我已经下了决心，要与深爱的少女一起在这片土地生活下去。我对此无比自豪。',
      
      // 动画相关配置
      animationConfig: {
        jitterFrequency: 0.6, // 抖动频率(秒)
        rainbowColor: true, // 颜色渐变开关
        fontJitter: true, // 字体抖动开关
        darkMode: true, // 默认暗色模式开关
        darkModeToggle: false, // 是否显示暗色模式开关按钮
        
        // 暗色模式开关控件配置
        darkModeButton: {
          position: 'bottom-right', // 位置: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
          showIcon: true,          // 是否显示图标
          showText: true,          // 是否显示文本
          iconLight: 'fas fa-moon', // 亮色模式下的图标
          iconDark: 'fas fa-sun',   // 暗色模式下的图标
          textLight: '暗色模式',    // 亮色模式下的文本
          textDark: '亮色模式',     // 暗色模式下的文本
          style: {
            margin: '1rem',         // 边距
            padding: '0.75rem 1.25rem', // 内边距
            borderRadius: '25px',   // 圆角
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // 背景颜色
            color: 'rgba(255, 255, 255, 0.8)',          // 文字颜色
            backdropFilter: 'blur(10px)',                // 背景模糊
          }
        },
        
        // 暗色模式切换动画配置
        darkModeTransition: {
          delay: 0, // 暗色模式切换开始延迟时间(秒)
          duration: 0.3, // 暗色模式切换动画持续时间(秒)
          easing: 'ease-in-out', // 缓动函数 (ease, ease-in, ease-out, ease-in-out, linear)
          properties: ['background-color', 'color', 'border-color', 'box-shadow'] // 需要动画的CSS属性
        },
        
        // 背景图缩放动画配置
        backgroundScale: {
          startDelay: 1.8, // 背景缩放开始延迟时间(秒)
          duration: 0.8, // 背景缩放持续时间(秒)
          fallbackDelay: 4.0 // 备用延迟时间(秒)，防止store状态未正确更新
        },
        
        // Greeting 问候语悬停旋转动画配置
        greetingHover: {
          enabled: true, // 启用 greeting 悬停动画
          rotation: 360, // 旋转角度(度)
          duration: 0.5, // 旋转动画持续时间(秒)
          easing: 'ease-in-out', // 缓动函数
          scale: 1.1 // 悬停时的缩放倍数
        }
      },
      
      // 加载动画配置
      loadingConfig: {
        // 加载指示器（圆圈和文字）动画配置
        loader: {
          startDelay: 0.8, // 开始淡出延迟时间(秒)
          duration: 0.3 // 淡出持续时间(秒)
        },
        
        // 遮罩透明化动画配置
        maskFade: {
          startDelay: 0.1, // 开始透明化延迟时间(秒)
          duration: 0.8, // 透明化持续时间(秒)
          opacity: 0.7 // 最终透明度 (0-1, 1为完全不透明，0为完全透明)
        },
        
        // 遮罩滑出动画配置
        maskSlide: {
          startDelay: 1.2, // 开始滑出延迟时间(秒)
          duration: 0.6 // 滑出持续时间(秒)
        },
        
        // 遮罩样式配置
        maskStyle: {
          backgroundColor: '#f0fff0', // 遮罩背景色 (起始颜色)
          backgroundColorEnd: '#e6ffe6', // 遮罩背景色 (结束颜色)
          gradientDirection: '135deg' // 渐变方向
        },
        
        // 整体隐藏时间配置
        totalDuration: 2.0 // 整个动画完成后隐藏延迟时间(秒) - 确保所有动画完成
      },
      
      // 左侧个人资料配置
      leftProfile: {
        enabled: true, // 是否启用左侧个人资料
        name: '筱狗Murasame',
        title: '喜欢丛雨酱',
        location: '穗织', // 所在地
        locationIcon: 'fa-solid fa-globe', // 所在地图标
        description: '热爱编程，喜欢探索新技术，致力于创造有趣的项目。',
        avatar: '/assets/kawaii2.jpg',
        
        // 布局和样式配置
        layout: {
          position: {
            left: '6rem', // 距离左边的距离
            top: '50%', // 垂直位置 (50% 为居中)
            transform: 'translateY(-50%)' // 变换 (居中对齐)
          },
          size: {
            width: '340px', // 组件宽度
            maxWidth: '400px' // 最大宽度
          },
          card: {
            padding: '2rem', // 卡片内边距
            borderRadius: '24px', // 卡片圆角
            backdrop: 'blur(20px)', // 背景模糊效果
            shadow: '0 8px 32px rgba(0, 0, 0, 0.1)' // 阴影效果
          },
          avatar: {
            size: '100px', // 头像尺寸
            borderWidth: '3px' // 头像边框宽度
          },
          responsive: {
            // 1500px 断点配置
            breakpoint1500: {
              left: '2.5rem',
              width: '300px',
              padding: '1.75rem'
            },
            // 1400px 断点配置
            breakpoint1400: {
              left: '2rem',
              width: '280px',
              padding: '1.5rem',
              avatarSize: '90px'
            },
            // 隐藏断点
            hideBelow: '1200px'
          }
        },
        
        // 更多链接配置
        linksSectionTitle: '更多链接',
        
        // 分页配置
        pagination: {
          enabled: true,
          itemsPerPage: 5,
          showPageIndicator: true,
          style: {
            buttonStyle: 'rounded', // 'rounded' | 'square'
            showPageNumbers: true,
            animationType: 'fade' // 'fade' | 'slide'
          },
          // 动画配置
          animation: {
            duration: 0.2, // 动画持续时间（秒）
            easing: 'ease-out', // 缓动函数
            enableWheel: true, // 启用滚轮切换
            wheelCooldown: 0.2, // 滚轮冷却时间（秒）- 减少冷却时间
            enableResize: true, // 启用动态大小变换
            resizeDuration: 0.2, // 大小变换动画持续时间（秒）- 减半提升速度
            stagger: {
              enabled: true, // 启用交错动画
              delay: 0.08, // 每个链接的延迟时间（秒）
              startDelay: 0.05 // 开始延迟时间（秒）
            }
          }
        },
        
        moreLinks: [
          {
            name: '个人博客',
            url: 'https://blog.shirayukinoa.top',
            icon: 'fa-brands fa-microblog',
            description: '我的个人博客',
            external: false
          },
          {
            name: 'MikuTap',
            url: 'https://miku.shirayukinoa.top',
            icon: 'fa-brands fa-gratipay',
            description: '来体验 Miku 钢琴吧！',
            external: false
          },
          {
            name: '2026 新年倒计时',
            url: 'https://2026.sbhfy.cn',
            icon: 'fa-solid fa-bell',
            description: '距离新年还有多长时间？',
            external: true
          }
        ]
      },

      // 右侧时间组件配置
      rightTime: {
        enabled: true,
        order: 2, // 控制显示顺序
        layout: {
          position: { right: '3rem', top: '50%', transform: 'translateY(-50%)' },
          size: { width: '300px', maxWidth: '300px' },
          card: { padding: '1rem', borderRadius: '24px', backdrop: 'blur(20px)', shadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }
        }
      },

      // 右侧图片轮播器组件配置
      rightImageViewer: {
        enabled: true,
        order: 1, // 控制显示顺序
        images: [
          '/assets/kawaii.jpg',
          '/assets/kawaii2.jpg',
          '/assets/Murasame.jpg'
        ],
        altText: '展示图片',
        cycleInterval: 5000,
        layout: {
          position: { right: '3rem', top: '20%', transform: 'translateY(-50%)' },
          size: { width: '300px', maxWidth: '300px' },
          card: { padding: '1rem', borderRadius: '24px', backdrop: 'blur(20px)', shadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }
        }
      },

      // 右侧音乐播放器组件配置
      rightMusicPlayer: {
        enabled: true,
        order: 3, // 控制显示顺序
        songs: [
          { id: '1824045033', name: '晴天' },
          { id: '1824045034', name: '七里香' },
          { id: '1824045035', name: '夜曲' }
        ],
        autoPlay: false,
        autoPlayDelay: 3000,
        layout: {
          position: { right: '3rem', top: '80%', transform: 'translateY(-50%)' },
          size: { width: '300px', maxWidth: '300px' },
          card: { padding: '1rem', borderRadius: '24px', backdrop: 'blur(20px)', shadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }
        }
      }
    }
  }
})
