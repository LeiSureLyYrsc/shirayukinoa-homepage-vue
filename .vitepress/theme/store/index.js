import { reactive } from 'vue'

// 创建一个简单的响应式store
export const mainStore = () => {
  return reactive({
    imgLoadStatus: false,
    setImgLoadStatus(status) {
      this.imgLoadStatus = status
    }
  })
}

// 创建全局store实例
let storeInstance = null

export const getStore = () => {
  if (!storeInstance) {
    storeInstance = mainStore()
  }
  return storeInstance
}

// 导出默认的store实例
export default getStore()
