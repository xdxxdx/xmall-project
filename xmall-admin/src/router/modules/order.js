/** When your routing table is too long, you can split it into small modules **/

// 系统管理路由

import Layout from '@/layout'

const OrderRouter = {
  path: '/order',
  component: Layout,
  redirect: '/order/list',
  name: '订单管理',
  alwaysShow: true,
  meta: {
    title: '订单管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/order/order'),
      name: '订单列表',
      meta: { title: '订单列表' }
    },
    {
      path: 'cash',
      component: () => import('@/views/order/cash'),
      name: '提现列表',
      meta: { title: '提现列表' }
    },
    {
      path: 'doorRecycle',
      component: () => import('@/views/order/doorRecycle'),
      name: '上门回收订单',
      meta: { title: '上门回收订单' }
    }
  ]
}
export default OrderRouter
