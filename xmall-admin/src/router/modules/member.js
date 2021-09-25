/** When your routing table is too long, you can split it into small modules **/

// 会员管理

import Layout from '@/layout'

const memberRouter = {
  path: '/member',
  component: Layout,
  redirect: '/member/list',
  name: 'Member',
  alwaysShow: true,
  meta: {
    title: '用户管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/member/member'),
      name: '用户信息',
      meta: { title: '用户信息' }
    }
  ]
}
export default memberRouter
