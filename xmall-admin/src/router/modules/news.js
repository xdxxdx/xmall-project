/** When your routing table is too long, you can split it into small modules **/

// 系统管理路由

import Layout from '@/layout'

const NewsRouter = {
  path: '/news',
  component: Layout,
  redirect: '/news/list',
  name: 'News',
  alwaysShow: true,
  meta: {
    title: '资讯管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/news/news'),
      name: '资讯列表',
      meta: { title: '资讯列表' }
    }
  ]
}
export default NewsRouter
