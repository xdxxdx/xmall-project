/** When your routing table is too long, you can split it into small modules **/

// 系统管理路由

import Layout from '@/layout'

const CarouselRouter = {
  path: '/carousel',
  component: Layout,
  redirect: '/carousel/list',
  name: 'Carousel',
  alwaysShow: true,
  meta: {
    title: '轮播管理',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/carousel/carousel'),
      name: '轮播列表',
      meta: { title: '轮播列表' }
    }
  ]
}
export default CarouselRouter
