import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
window.$ = window.jQuery = require('jquery');
Vue.use({
  install: function(Vue) {
    Vue.prototype.$jQuery = require('jquery'); // you'll have this.$jQuery anywhere in your vue project
  }
});
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
