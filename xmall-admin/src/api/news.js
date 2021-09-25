import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/ele/news/lists',
    method: 'get',
    params: query
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

export function create(data) {
  return request({
    url: '/ele/news/add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: `/ele/news/${data.id}`,
    method: 'post',
    data
  })
}

export function setStatus(data) {
  return request({
    url: '/ele/news/status',
    method: 'post',
    data
  })
}

export function deleteCategory(data) {
  return request({
    url: `/category/${data.id}`,
    method: 'delete',
    data
  })
}
export function hidden(data) {
  return request({
    url: `/ele/news/hidden/${data.id}`,
    method: 'post',
    data
  })
}
