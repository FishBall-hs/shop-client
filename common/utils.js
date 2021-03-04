export function getParamString (params) {
  const attr = []
  Object.keys(params).forEach(key => {
    attr.push([key, encodeURIComponent(params[key])].join('='))
  })
  return attr.join('&')
}
