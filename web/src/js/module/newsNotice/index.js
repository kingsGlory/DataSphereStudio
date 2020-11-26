// import Vue from 'vue';
export default {
  name: 'NewsNotice',
  data: {
    API_PATH: process.env.VUE_APP_MN_CONFIG_PREFIX || `${window.location.protocol}//${window.location.host}/operationApi/`,
    // API_PATH: process.env.VUE_APP_MN_CONFIG_PREFIX || `${window.location.protocol}//${window.location.host}/testApi/`,
  },
  component: () =>
    import('./index.vue'),
};