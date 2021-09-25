import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/ele/user/lists',
    method: 'get',
    params: query
  })
}

export function setUserRole(data) {
  return request({
    url: `/ele/user/role`,
    method: 'post',
    data
  })
}
