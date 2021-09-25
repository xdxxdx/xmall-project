import request from '@/utils/request'

export function deleteSpec(data) {
  return request({
    url: `/spec/${data.id}`,
    method: 'delete',
    data
  })
}

