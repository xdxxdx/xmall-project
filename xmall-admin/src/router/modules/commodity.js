/** When your routing table is too long, you can split it into small modules **/

// 商品管理

import Layout from '@/layout'

const commodityRouter = {
  path: '/commodity',
  component: Layout,
  redirect: '/commodity/list',
  name: 'Member',
  alwaysShow: true,
  meta: {
    title: '商品管理',
    icon: 'table'
  },
  children: [
    {
      path: 'category',
      component: () => import('@/views/commodity/category'),
      name: '商品类别',
      meta: { title: '商品类别' }
    }, {
      path: 'list',
      component: () => import('@/views/commodity/commodity'),
      name: '商品列表',
      meta: { title: '商品列表' }
    }
  ]
}
export default commodityRouter
