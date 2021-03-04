import request from 'Common/request.js'

// request方法调用demo
class RequestAPI {
    // https://www.lawtime.cn/public/common/getClickArticle?id=535686  ==> 随便找的公网测试接口
    getShopGoodsAPI = (params) => {
      return request('/api/public/common/getClickArticle', '获取失败').get(params)
    }
}

export default new RequestAPI()
