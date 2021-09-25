/** When your routing table is too long, you can split it into small modules **/

// 系统管理路由

import Layout from '@/layout'

const BagRouter = {
  path: '/bag',
  component: Layout,
  redirect: '/bag/list',
  name: '环保袋管理',
  alwaysShow: true,
  meta: {
    title: '环保袋管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/dictionary/bag'),
      name: '环保袋列表',
      meta: { title: '环保袋列表' }
    }
  ]
}
export default BagRouter
