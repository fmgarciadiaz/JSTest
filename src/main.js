// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import Toast from 'vue-easy-toast'
import VueHighcharts from 'vue-highcharts'
import loadStock from 'highcharts/modules/stock'
import loadExporting from 'highcharts/modules/exporting'
import Highcharts from 'highcharts'
import Tabs from 'vue-tabs-component'
import vClickOutside from 'v-click-outside'

Vue.use(Vuetify)
Vue.use(Toast)

loadStock(Highcharts)
loadExporting(Highcharts)
Vue.use(VueHighcharts, { Highcharts })

Vue.use(vClickOutside)
Vue.use(Tabs)

Vue.config.productionTip = false

/* Constantes */
let metadataApiBaseUrl
if (process.env.NODE_ENV === 'production') {
    metadataApiBaseUrl = 'http://api-series-de-tiempo.tasacionya.com/'
} else {
    metadataApiBaseUrl = 'http://api-series-de-tiempo.tasacionya.com/'
}

export const globalStore = new Vue({
    data: {
        metadataApiBaseUrl: metadataApiBaseUrl,
        analyticsId: ''
    }
})


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
