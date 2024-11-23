import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  hash: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  history: {
    type: 'hash'
  },
  layout: {
    title: '@umijs/max',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
      layout: false
    },
    {
      name: '权限演示',
      path: '/book',
      component: './Book',
      layout: false
    },
  ],
  npmClient: 'pnpm',
});

