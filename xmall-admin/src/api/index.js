import request from '@/utils/request'

export function fetchList() {
  return request({
    url: '/ele/index/data',
    method: 'get'
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createAdmin(data) {
  return request({
    url: '/ele/admin/add',
    method: 'post',
    data
  })
}

export function updateAdmin(data) {
  return request({
    url: `/ele/admin/${data.id}`,
    method: 'post',
    data
  })
}

export function deleteAdmin(data) {
  return request({
    url: `/ele/admin/${data.id}`,
    method: 'delete',
    data
  })
}

export function adminByUserName(userName) {
  return request({
    url: `/ele/admin/check/${userName}`,
    method: 'get'
  })
}
