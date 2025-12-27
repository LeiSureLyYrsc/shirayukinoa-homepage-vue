// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import type { Theme } from 'vitepress'
import './styles/index.css'
import Loading from './components/Loading.vue'

export default {
  Layout,
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component('Loading', Loading)
  }
} satisfies Theme

