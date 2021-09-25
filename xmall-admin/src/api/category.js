import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/category/lists',
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

export function createCategory(data) {
  return request({
    url: '/category/add',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: `/category/${data.id}`,
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
export function hiddenCategory(data) {
  return request({
    url: `/user/hidden/${data.id}`,
    method: 'post',
    data
  })
}
