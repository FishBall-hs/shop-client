
import axios from 'axios'
import { message } from 'antd'
import { getParamString } from './utils'
import statusStore from '../stores/statusStore'
import handleError from '../config/handleError'
import ReportData from '../config/reportData'
import commMethod from 'Common/utils/commMethod.js'
import addCatError from './addCatError.js'

const requestOver = () => {
  let currentGlobalLoadingCount = statusStore.globalLoadingCount
  if (currentGlobalLoadingCount > 0) {
    statusStore.setGlobalLoadingCount(currentGlobalLoadingCount - 1)
  }
}

function processResponse (url, response, resolve, reject, errorMsg) {
  // 处理 response 200 情况下的 error 和 成功
  if (!response) {
    const errorObj = {
      type: 'RESPONSE_ERROR',
      message: errorMsg || '未返回 resposne body',
      api: url
    }
    errorObj.type = 'RESPONSE_ERROR'
    handleError(errorObj)
    reject(errorObj)
  }

  if (response.error || response.status === 'fail') {
    const errorObj = Object.assign({
      code: 0,
      api: url,
      type: 'API_ERROR',
      exceptionType: 'SystemException',
      message: '返回数据失败',
      level: 'ALERT' // UNDO 正常, ALERT 弹出消息
    }, response.error || {})

    if (errorObj.level === 'ALERT' || errorObj.level === 'ALTER') {
      addCatError({ name: url, msg: errorObj.message })
      message.error(errorObj.message)
    }
    handleError(errorObj)
    reject(errorObj)
  }

  if (Object.prototype.toString.call(response) !== '[object Object]') {
    resolve(response)
  } else if (response.hasOwnProperty('data')) {
    resolve(response.data)
  } else if (response.hasOwnProperty('result')) {
    resolve(response.result)
  } else if (response.hasOwnProperty('status') && typeof response.status === 'object') {
    resolve(response.status)
  } else {
    resolve(response)
  }
}

function apiFactory (instance, url, errorMsg) {
  return {
    'get': function (params) {
      let phase = ''
      if (typeof params === 'string' && params) {
        phase = '?' + params
      } else if (Object.prototype.toString.call(params) === '[object Object]' && Object.keys(params).length) {
        phase = '?' + getParamString(params)
      }
      return new Promise((resolve, reject) => {
        return instance({
          url: url.join('/') + phase,
          method: 'GET'
        }).then(result => {
          // 处理 response 200 情况下的 error 和 成功
          processResponse(url.join('/') + ' Method: get', result.data, resolve, reject, errorMsg)
        }).catch(err => {
          reject(err)
        })
      })
    },
    'post': function (data, params) {
      let phase = ''
      if (typeof params === 'string' && params) {
        phase = '?' + params
      } else if (Object.prototype.toString.call(params) === '[object Object]' && Object.keys(params).length) {
        phase = '?' + getParamString(params)
      }
      return new Promise((resolve, reject) => {
        return instance({
          url: phase ? url.join('/') + phase : url.join('/'),
          data: data,
          method: 'POST'
        }).then(result => {
          // 处理 response 200 情况下的 error 和 成功
          processResponse(url.join('/') + ' Method: post', result.data, resolve, reject, errorMsg)
        }).catch(err => {
          reject(err)
        })
      })
    },
    'put': function (id, data) {
      return new Promise((resolve, reject) => {
        if (Object.prototype.toString.call(id) === '[object Object]') {
          data = id
        } else {
          url.push(id)
        }
        return instance({
          url: url.join('/'),
          data: data,
          method: 'PUT'
        }).then(result => {
          // 处理 response 200 情况下的 error 和 成功
          processResponse(url.join('/') + ' Method: put', result.data, resolve, reject, errorMsg)
        }).catch(err => {
          reject(err)
        })
      })
    },
    'delete': function (id, data) {
      return new Promise((resolve, reject) => {
        if (Object.prototype.toString.call(id) === '[object Object]') {
          data = id
        } else {
          url.push(id)
        }
        return instance({
          url: url.join('/'),
          data: data,
          method: 'DELETE'
        }).then(result => {
          // 处理 response 200 情况下的 error 和 成功
          processResponse(url.join('/') + ' Method: delete', result.data, resolve, reject, errorMsg)
        }).catch(err => {
          reject(err)
        })
      })
    },
    'upload': function (formData) {
      return new Promise((resolve, reject) => {
        return instance({
          url: url.join('/'),
          data: formData,
          method: 'POST'
        }).then(result => {
          // 处理 response 200 情况下的 error 和 成功
          processResponse(url.join('/') + ' Method: upload', result.data, resolve, reject, errorMsg)
        }).catch(err => {
          reject(err)
        })
      })
    },
    'download': function (params) {
      let phase = ''
      if (typeof params === 'string' && params) {
        phase = '?' + params
      } else if (Object.prototype.toString.call(params) === '[object Object]' && Object.keys(params).length) {
        phase = '?' + getParamString(params)
      }
      window.open(url.join('/') + phase)
      requestOver()
    }
  }
}

/**
 * Ajax 请求工具
 *
 * @param apiUrl optional The default config for the instance
 * @param errorMsg optional API出错后的默认错误信息
 * @param extra_headers optional 额外请求头
 * @return {axios} axios 的实例
 */
const request = (apiUrl, errorMsg, extra_headers = {}) => {
  let currentGlobalLoadingCount = statusStore.globalLoadingCount
  statusStore.setGlobalLoadingCount(currentGlobalLoadingCount + 1)

  let reportData = ''

  try {
    // 获取上报数据
    reportData = ReportData.interfaceReport(apiUrl)
  } catch (e) {
    console.log(e)
  }

  reportData = JSON.stringify(reportData)
  reportData = encodeURI(reportData)

  // 设置默认参数
  let requestOption = Object.assign({
    host: '',
    baseURL: '',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'X-Requested-With': 'XMLHttpRequest',
      'log-data': reportData
    },
    timeout: 30000,
    withCredentials: true
  }, extra_headers)

  let instance = axios.create(requestOption)
  instance.interceptors.response.use(response => {
    if ((response.data.status === 'fail' && response.data.error.code === 1010) || response.data.status === 401) {
      commMethod.logOut()
    }
    requestOver()
    return response
  }, error => {
    requestOver()
    let errRes = error.response || {}
    let status = errRes.status
    if (status === 401) {
      return Promise.reject(new Error())
    }
    if (status === 400) {
      return Promise.resolve({
        error: {
          code: 0,
          type: 'SERVER_ERROR',
          exceptionType: 'SystemException',
          message: `返回数据失败, 状态码：${status}`,
          level: 'UNDO' // UNDO 正常, ALERT 弹出消息
        },
        status: 'fail'
      })
    }

    if (status === 404) {
      return Promise.resolve({
        error: {
          code: 0,
          type: 'SERVER_ERROR',
          exceptionType: 'SystemException',
          message: `请求资源不存在, 状态码：${status}`,
          level: 'UNDO' // UNDO 正常, ALERT 弹出消息
        },
        status: 'fail'
      })
    }

    return Promise.resolve({
      error: {
        code: 0,
        exceptionType: 'SystemException',
        message: `后端服务异常, 状态码：${status}`,
        level: 'UNDO' // UNDO 正常, ALERT 弹出消息
      },
      status: 'fail'
    })
  })

  return apiFactory(instance, [apiUrl], errorMsg)
}

export default request
