import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/ele/house/lists',
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

export function create(data) {
  return request({
    url: '/ele/house/add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: `/ele/house/${data.id}`,
    method: 'post',
    data
  })
}

export function deleteCategory(data) {
  return request({
    url: `/house/${data.id}`,
    method: 'delete',
    data
  })
}
export function hiddenCategory(data) {
  return request({
    url: `/ele/house/hidden/${data.id}`,
    method: 'post',
    data
  })
}
