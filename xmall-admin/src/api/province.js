import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/ele/province/lists',
    method: 'get',
    params: query
  })
}

export function provinceListWithCity(query) {
  return request({
    url: '/ele/province/listWithCities',
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
    url: '/ele/province/add',
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: `/ele/province/${data.id}`,
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
    url: `/ele/province/hidden/${data.id}`,
    method: 'post',
    data
  })
}
