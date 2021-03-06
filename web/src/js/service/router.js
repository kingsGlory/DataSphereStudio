/*
 * Copyright 2019 WeBank
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import VueRouter from 'vue-router';
import Layout from '../view/layout.vue';
import api from '@/js/service/api';
import storage from '@/js/helper/storage';
import Cookies from 'js-cookie';
import { Modal } from 'iview';

// 解决重复点击路由跳转报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const router = new VueRouter({
  routes: [
    {
      path: '',
      name: 'layout',
      redirect: '/newhome',
      component: Layout,
      meta: {
        title: 'CT-Luban',
        publicPage: true, // 权限公开
      },
      children: [
        {
          path: 'newhome',
          name: 'Newhome',
          meta: {
            title: 'CT-Luban',
            publicPage: true,
          },
          component: () => import('../view/newhome/index.vue'),
        },
        {
          name: 'API',
          path: 'api',
          component: () => import('../module/dataAPI/index.vue'),
          meta: {
            title: 'API',
            publicPage: true
          }
        },
        {
          name: 'WorkOrder',
          path: 'workOrder',
          component: () => import('../module/workOrder/index.vue'),
          meta: {
            title: 'WorkOrder',
            publicPage: true
          }
        },
        {
          name: 'NewAPI',
          path: 'newApi',
          component: () => import('../module/dataAPI/ApiForm.vue'),
          meta: {
            title: 'NewAPI',
            publicPage: true
          }
        },
        {
          path: 'home',
          name: 'Home',
          meta: {
            title: 'Scriptis',
            keepAlive: true, // 缓存导致页面有多个编辑器，广播事件会触发报错
            publicPage: true, // 权限公开
          },
          component: () => import('../view/home/index.vue'),
        },
        {
          path: 'project',
          name: 'Project',
          meta: {
            title: 'CT-Luban',
            publicPage: true,
          },
          component: () => import('../view/project/index.vue'),
        },
        {
          path: 'workflow',
          name: 'Workflow',
          meta: {
            title: 'My Workflow',
            publicPage: true,
            parent: 'Project',
          },
          component: () => import('../view/workflow/index.vue'),
        },
        {
          path: 'workspace',
          name: 'workspace',
          meta: {
            title: 'Workspace',
            publicPage: true,
          },
          component: () => import('../view/workspace/index.vue'),
        },
        {
          path: 'workspace1',
          name: 'workspace1',
          meta: {
            title: 'Workspace1',
            publicPage: true,
          },
          component: () => import('../view/newhome/module/workspace/index.vue'),
        },
        {
          path: 'commonIframe',
          name: 'commonIframe',
          meta: {
            title: 'DSS Component',
            publicPage: true,
          },
          component: () => import('../view/commonIframe/index.vue'),
        },
        {
          name: 'USER MANAGER',
          path: 'userManager',
          component: () => import('../view/userManager/index.vue'),
          meta: {
            title: 'userManager',
            publicPage: true,
          },
        },
        {
          path: 'console',
          name: 'Console',
          meta: {
            title: 'linkis console',
            publicPage: true,
          },
          component: () => import('../view/console/index.vue'),
          children: [{
            name: 'globalHistory',
            path: 'globalHistory',
            component: () => import('../module/globalHistory/index.vue'),
            meta: {
              title: 'Global History',
              publicPage: true,
            },
          }, {
            name: 'resource',
            path: 'resource',
            component: () => import('../module/resource/resource.vue'),
            meta: {
              title: 'resource',
              publicPage: true,
            },
          }, {
            name: 'setting',
            path: 'setting',
            component: () => import('../module/setting/setting.vue'),
            meta: {
              title: 'setting',
              publicPage: true,
            },
          }, {
            name: 'globalValiable',
            path: 'globalValiable',
            component: () => import('../module/globalValiable/index.vue'),
            meta: {
              title: 'Global Valiable',
              publicPage: true,
            },
          }, {
            name: 'FAQ',
            path: 'FAQ',
            component: () => import('../module/FAQ/index.vue'),
            meta: {
              title: 'FAQ',
              publicPage: true,
            },
          },
          ],
        },
        {
          path: 'newsNotice',
          name: 'NewsNotice',
          meta: {
            title: 'newsNotice',
            publicPage: true,
          },
          component: () => import('../module/newsNotice/index.vue')
        },
        {
          // path: 'detail/:id(\\d+)',
          path: 'noticeDetail',
          name: 'NoticeDetail',
          component: () => import('../module/newsNotice/detail/Detail.vue'),
          meta: {
            title: 'notifyDetail',
            publicPage: true,
          },
        },
        {
          path: 'redirect/:path*',
          hidden: true,
          component: () => import('../view/redirect/index')
        },
        {
          path: 'myResource',
          name: 'MyResource',
          component: () => import('../module/myResource/index.vue'),
          meta: {
            publicPage: true,
          },
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      meta: {
        title: 'Login',
        publicPage: true,
      },
      component: () => import('../view/login/index.vue'),
    },
    // 公用页面，不受权限控制
    {
      path: '/500',
      name: 'serverErrorPage',
      meta: {
        title: '服务器错误',
        publicPage: true,
      },
      component: () => import('../view/500.vue'),
    },
    {
      path: '/404',
      name: 'pageNotFound',
      meta: {
        title: '404',
        publicPage: true,
      },
      component: () => import('../view/404.vue'),
    },
    {
      path: '/403',
      name: 'pageForbidden',
      meta: {
        title: '403',
        publicPage: true,
      },
      component: () => import('../view/403.vue'),
    },
    {
      path: '*',
      meta: {
        title: 'CT-Luban',
        publicPage: true,
      },
      component: () => import('../view/404.vue'),
    },
  ],
});
router.beforeEach((to, from, next) => {
  const userInfo = storage.get('userInfo');
  console.log('userInfo.basic.status', userInfo);
  if(process.env.VUE_APP_CTYUN_SSO){
    if(to.path === '/login'){
      storage.clear('cookie');
      //清除cookie，防止用户之间登陆用户不一致
      Cookies.remove('bdp-user-ticket-id');
      
      var keys = document.cookie.match(/[^ =;]+(?==)/g)
      console.log('keys', keys, document.domain);
      if (keys) {
        for (var i = keys.length; i--;) {
          document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString() // 清除当前域名下的
          document.cookie = keys[i] + '=0;path=/luban/schedule;domain=' + document.domain + ';expires=' + new Date(0).toUTCString() // 清除当前域名路径下的cookie
        }
      }
      window.location = `https://www.ctyun.cn/login?service=${window.location.protocol}//${window.location.host}${process.env.VUE_APP_PREFIX}/api/rest_j/v1/application/ssologin`;
    } else if (to.path === '/newhome' || to.path === '/newsNotice' || to.path === '/noticeDetail' || to.path === '/redirect/newsNotice') {
      next()
    } else {
      if(userInfo.basic){
        const meaasgeStatus = new Map([
          [1, '开通中'],
          [2, '开通失败'],
          [7, '退订中'],
          [8, '退订失败'],
          [9, '退订成功'],
          [11, '订购已到期，请尽快续订，资源近期回收！'],
          [12, '过期续订中'],
          [13, '过期续订失败'],
          [14, '销户中'],
          [15, '销户失败'],
        ]);
        const regExp = /^(1|2|7|8|9|12|13|14|15)$/;
        if (regExp.test(userInfo.basic.status)) {
          Modal.confirm({
            title: '状态',
            content: `<p>${meaasgeStatus.get(userInfo.basic.status)}</p>`,
            okText: '请等待处理，或者联系客服 400-810-9889',
          });
          return;
        }
        switch (userInfo.basic.status) {
          case 0:
            Modal.confirm({
              title: '开通资源',
              content: '<p>尊敬的用户，使用本功能需要计算和存储资源，您可以去申请开通资源</p>',
              okText: '去开通',
              cancelText: '再看看案例和入门',
              onOk: () => {
                window.open(process.env.VUE_APP_CTYUN_SUBSCRIBE);
              },
              onCancel: () => {
                console.log('Clicked cancel');
              }
            });
            break;

          case 11:
            Modal.confirm({
              title: '账户过期',
              content: `<p>${meaasgeStatus.get(userInfo.basic.status)}</p>`,
              okText: '去续订',
              onOk: () => {
                const userId = userInfo.basic.ctyunUserId;
                api.fetch('workOrder', { ctyunUserId: userId }, 'get').then((rst) => {
                  const createTimeAry = rst.map((item) => {
                    return item.createTime;
                  })
                  const nearWorkOrder = rst.find(item => Math.max(...createTimeAry) === item.createTime);
                  window.open(`${process.env.VUE_APP_CTYUN_PROLONG}?orderId=${nearWorkOrder.workOrderId}`);
                });
              },
            });
            break;
        
          default:
            next();
            break;
        }
      }else{
        next()
      }
    }

  }else {
    if (to.meta) {
      if (to.meta.publicPage) {
        // 公共页面不需要权限控制（404，500）
        next();
      } else {
        next('/');
      }
    }
  }
});
router.afterEach((to) => {
  if (to.meta) {
    document.title = to.meta.title || 'CT-Luban';
  }
  if(process.env.VUE_APP_CTYUN_SSO){
    setTimeout(()=>{
      var _hmt = _hmt || [];
      (function() {
        //每次执行前，先移除上次插入的代码
        document.getElementById('baidu_tj') && document.getElementById('baidu_tj').remove();
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?cb396c1e4ce898b950eaffb369083a8e";
        hm.id = "baidu_tj"
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
    },0);
  }
});

export default router
;
