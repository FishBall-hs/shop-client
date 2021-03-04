/**
*  @return 常用错误映射表
*
    const errorConfig = {
        'API_ERROR': '业务异常(api 返回error)',
        'API_FORMAT_ERROR': 'api 返回数据格式异常 ',
        'JAVASCRIPT_ERROR': 'JS 解析异常',
        'JAVASCRIPT_API_ERROR': 'JS 解析后台返回值异常',
        'NETWORK_ERROR': '网络异常',
        'SERVER_ERROR': '服务器异常',
        'RESPONSE_ERROR': '请求未返回结果',
        'PARAMS_ERROR': 'API 配置项异常',
    };
*
* @return 返回的error对象示例
        {
            type: 'API_ERROR',
            api: fetch_request_params.url,
            message: '业务异常',
            error: response.error,
            status: response.status,
        }
*/

const handleError = (error) => {
  if (!error) {
    console.error('未传递异常信息')
  }
  if (!error.type) {
    error = {
      type: 'JAVASCRIPT_ERROR',
      message: error.message,
      api: '非api类型',
      error: new Error(error)
    }
  }
  console.warn(`type: ${error.type.toLowerCase()} | message: ${error.message} | source: ${error.api}`)
}

export default handleError
