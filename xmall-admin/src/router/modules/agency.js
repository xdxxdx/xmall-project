/** When your routing table is too long, you can split it into small modules **/

// 代理商管理

import Layout from '@/layout'

const AgencyRouter = {
  path: '/agency',
  component: Layout,
  redirect: '/agency/list',
  name: 'News',
  alwaysShow: true,
  meta: {
    title: '代理商管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/agency/agency'),
      name: '代理商列表',
      meta: { title: '代理商列表' }
    }
  ]
}
export default AgencyRouter
