/** When your routing table is too long, you can split it into small modules **/

// 系统管理路由

import Layout from '@/layout'

const adminRouter = {
  path: '/admin',
  component: Layout,
  redirect: '/admin/list',
  name: 'Admin',
  alwaysShow: true,
  meta: {
    title: '系统管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/system/admin'),
      name: '管理员',
      meta: { title: '管理员',
        roles: ['admin', 'agent'] }
    }
  ]
}
export default adminRouter
