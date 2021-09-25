import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/commodity/lists',
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

export function createCommodity(data) {
  return request({
    url: '/commodity/add',
    method: 'post',
    data
  })
}

export function updateCommodity(data) {
  return request({
    url: `/commodity/${data.id}`,
    method: 'post',
    data
  })
}

export function hiddenCommodity(data) {
  return request({
    url: `/commodity/hidden/${data.id}`,
    method: 'post',
    data
  })
}

export function deleteCommodity(data) {
  return request({
    url: `/commodity/${data.id}`,
    method: 'delete',
    data
  })
}

