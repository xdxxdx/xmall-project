import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/ele/bag/lists',
    method: 'get',
    params: query
  })
}

export function create(data) {
  return request({
    url: '/ele/bag/add',
    method: 'post',
    data
  })
}
export function batchCreate(data) {
  return request({
    url: `/ele/bag/add/${data}`,
    method: 'post',
    data
  })
}
export function setBagStatus(data) {
  return request({
    url: `/ele/bag/status`,
    method: 'post',
    data
  })
}

export function update(data) {
  return request({
    url: `/ele/agency/${data.id}`,
    method: 'post',
    data
  })
}

export function deleteCategory(data) {
  return request({
    url: `/agency/${data.id}`,
    method: 'delete',
    data
  })
}
export function hiddenCategory(data) {
  return request({
    url: `/ele/agency/hidden/${data.id}`,
    method: 'post',
    data
  })
}

export function setStatus(data) {
  return request({
    url: '/ele/agency/status',
    method: 'post',
    data
  })
}
