/* eslint-disable space-before-function-paren */
class StatusStore {
  constructor() {
    this.globalLoadingCount = 0 // 全局请求的Ajax数量
  }
  setGlobalLoadingCount (count) {
    this.globalLoadingCount = count
  };
}

export default new StatusStore()
