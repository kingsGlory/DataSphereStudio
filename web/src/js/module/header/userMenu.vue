<template>
  <ul
    class="user-menu">
    <li class="user-menu-arrow"/>
    <li
      class="user-menu-item"
      v-for="(menu) in menuList"
      :key="menu.id"
      @click="handleClick(menu.id)">
      <Icon
        class="user-menu-item-icon"
        :type="menu.icon"
      >
      </Icon>
      <span>{{ menu.name }}</span>
    </li>
  </ul>
</template>
<script>
import api from '@/js/service/api';
import Cookies from 'js-cookie';
export default {
  name: 'Menu',
  props: {
    isSuperUser: Boolean
  },
  data() {
    return {
      menuList: process.env.VUE_APP_CTYUN_SSO ? [
        {
          id: 'myResource',
          name: this.$t('message.navMune.myResource'),
          icon: 'ios-paper-outline',
        },
        {
          id: 'feedBack',
          name: this.$t('message.navMune.feedBack'),
          icon: 'ios-create-outline',
        },
        {
          id: 'clearCache',
          name: this.$t('message.navMune.clearCache'),
          icon: 'ios-trash-outline',
        },
        {
          id: 'logout',
          name: this.$t('message.navMune.logOut'),
          icon: 'ios-log-out',
        }]:

        [
          {
            id: 'clearCache',
            name: this.$t('message.navMune.clearCache'),
            icon: 'ios-trash-outline',
          },
          {
            id: 'logout',
            name: this.$t('message.navMune.logOut'),
            icon: 'ios-log-out',
          }]
      ,

    };

  },
  watch: { 
    isSuperUser: function(newVal){
      if(newVal){
        if(this.menuList[0].id !== 'user-management'){
          this.menuList.unshift({
            id: 'user-management',
            name: this.$t('message.navMune.userManager'),
            icon: 'ios-person-outline',
          },)
        }
      }else {
        if(this.menuList[0].id === 'user-management') {
          this.menuList.shift();
        }
      }
    }
  },
  methods: {
    handleClick(type) {
      switch (type) {
        case 'user-management':
          this.openUserManagement();
          break;
        case 'FAQ':
          this.openFAQ();
          break;
        case 'clearCache':
          this.clearCache();
          break;
        case 'myResource': 
          this.gotoMyResource();
          break;
        case 'workOrder':
          this.gotoWorkOrder();
          break;
        case 'logout':
          this.getRunningJob();
          break;
        case 'changeLang':
          this.changeLang();
          break;
        case 'feedBack':
          this.gotoMyFeedBack(this.$t('message.navMune.feedBack'));
          break;
      }
    },
    openUserManagement() {
      // this.$Message.info(this.$t('message.userMenu.comingSoon'));
      this.$router.push('/userManager')
    },
    openFAQ() {
      const newTab = window.open('about:blank');
      setTimeout(() => {
        newTab.location.href = this.getFAQUrl();
      }, 500);
    },
    clearCache() {
      this.$Modal.confirm({
        title: this.$t('message.userMenu.title'),
        content: this.$t('message.userMenu.content'),
        onOk: () => {
          this.dispatch('IndexedDB:deleteDb');
          this.$Message.success(this.$t('message.userMenu.clearCacheSuccess'));
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        },
        onCancel: () => {
        },
      });
    },
    getRunningJob() {
      // this.dispatch('Footer:getRunningJob', (num) => {
      //     debugger;
      //     if (!num) return this.logout();
      //     this.$Modal.confirm({
      //         title: '警告',
      //         content: `<p>您有${num}个任务正在执行</p><p>是否要继续登出？</p>`,
      //         onOk: () => {
      //             this.logout();
      //         },
      //         onCancel: () => {
      //         },
      //     });
      // });
      this.logout();
    },
    logout() {
      console.log("process.env.VUE_APP_CTYUN_SSO", process.env.VUE_APP_CTYUN_SSO);
      Cookies.remove('bdp-user-ticket-id');
      
      var keys = document.cookie.match(/[^ =;]+(?==)/g)
      console.log('keys', keys, document.domain);
      if (keys) {
        for (var i = keys.length; i--;) {
          document.cookie = keys[i] + '=0;path=/;expires=' + new Date(0).toUTCString() // 清除当前域名下的
          document.cookie = keys[i] + '=0;path=/luban/schedule;domain=' + document.domain + ';expires=' + new Date(0).toUTCString() // 清除当前域名路径下的cookie
        }
      }
      if(process.env.VUE_APP_CTYUN_SSO){
        api.fetch('/user/logout', 'get').then(() => {
          this.$emit('clear-session');
          window.location = process.env.VUE_APP_CTYUN_SSO;
          // this.$router.push({ path: '/login' });
        });
      }else {
        api.fetch('/user/logout', 'get').then(() => {
          this.$emit('clear-session');
          this.$router.push({ path: '/login' });
        });
      }
    },
    gotoMyResource() {
      this.$router.push('/myResource'); 
    },
    gotoWorkOrder() {
      this.$router.push('/workOrder');
    },
    changeLang() {
      // 中文切换英文
      if (localStorage.getItem('locale') === 'zh-CN') {
        localStorage.setItem('locale', 'en');
      } else {
        localStorage.setItem('locale', 'zh-CN');
      }
      window.location.reload();
    },
    gotoMyFeedBack(menuName, status) {
      this.$router.replace({
        path: '/redirect/newsNotice',
        query: {
          menuName,
          status
        }
      });
    },
  },
};
</script>
