<template>
  <v-container fluid>
    <v-slide-y-transition mode="out-in">
      <v-layout column align-center>
        <!-- Pantalla que indica Carga de Datos  -->
        <v-flex align-center v-if="loadingFromAPI">
            <v-layout row wrap>
              <v-flex>
                <font-awesome-icon :icon="Icono" spin/>
              </v-flex>
              <v-flex xs12>
                  <v-card-text class="px-0">Cargando Datos...
                  </v-card-text>
              </v-flex>
            </v-layout>
        </v-flex>
        <!-- FIN Pantalla que indica Carga de Datos  -->
        <v-flex align-content-end>

             <!-- CONTENIDOS -->
    <div class="container-fluid" style="height: 100%;">
        <nav class="navbar navbar-light bg-faded">
            <div><i @click.stop.prevent="toggleSidebarMenu" class="fa fa-bars fa-2x"></i></div>
        </nav>

        <div id="setup-panel" :class="[sidebarIsOpen ? 'sidebar-menu-open' : 'sidebar-menu-closed']" v-click-outside="closeSidebarMenu">
            <tabs :options="{ useUrlFragment: false }">
                <tab name="Agregar Serie">
                    <div>
                        <form class="pl-2 pr-2">
                            <div class="input-group mb-2">
                                <input type="search" class="form-control" v-model="searchQuery" @input="debouncedSearch" placeholder="emae, ipc general, base monetaria, ...">
                                <span class="input-group-btn">
                                        <button class="btn btn-secondary" type="button" @click.prevent="doSearch"><i class="fa fa-search"></i></button>
                                    </span>
                            </div>
                            <div class="form-group row ml-0 mb-2">
                                <label for="select-dataset-tema" class="col-form-label">Tema: </label>
                                <div class="ml-2">
                                    <select v-model="searchDatasetTema" @change="doSearch" id="select-dataset-tema" class="form-control">
                                        <option disabled value="">Elegir uno....</option>
                                        <option value="any">Cualquiera</option>
                                        <option value="Actividad">Actividad</option>
                                        <option value="Precios">Precios</option>
                                        <option value="Dinero y Bancos">Dinero y Bancos</option>
                                        <option value="Sector Externo">Sector Externo</option>
                                        <option value="Economía Internacional">Economía Internacional</option>
                                        <option value="Finanzas Públicas">Finanzas Públicas</option>
                                        <option value="Empleo e Ingresos">Empleo e Ingresos</option>
                                        <option value="Mercados Financieros">Mercados Financieros</option>

                                    </select>
                                </div>
                            </div>
                            <div class="form-group row ml-0 mb-2">
                                <label for="select-periodicidad" class="col-form-label">Periodicidad al menos: </label>
                                <div class="ml-2">
                                    <select v-model="searchMinPeriodicity" @change="doSearch" id="select-periodicidad" class="form-control">
                                        <option disabled value="">Elegir uno....</option>
                                        <option value="1">Diario</option>
                                        <option value="30">Mensual</option>
                                        <option value="90">Trimestral</option>
                                        <option value="360">Anual</option>
                                        <option value="999">Cualquiera</option>
                                    </select>
                                </div>
                            </div>
                            <div class="small">
                                Último dato disponible:
                            </div>
                            <div class="form-group row ml-0">
                                <label for="select-first-year" class="col-form-label">Desde: </label>
                                <div class="ml-2 mr-2">
                                    <select v-model="searchMaxFirstYear" @change="doSearch" id="select-first-year" class="form-control">
                                        <option disabled value="">Elegir uno...</option>
                                        <option value="9999">Cualquiera</option>
                                        <option v-for="year in searchPossibleMinYears" :value="year">&le; {{year}}</option>
                                    </select>
                                </div>

                                <label for="select-last-year" class="col-form-label">Hasta: </label>
                                <div class="ml-2">
                                    <select v-model="searchMinLastYear" @change="doSearch" id="select-last-year" class="form-control">
                                        <option disabled value="">Elegir uno...</option>
                                        <option value="0">Cualquiera</option>
                                        <option v-for="year in searchPossibleMaxYears" :value="year">&ge; {{year}}</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                        <div id="search-results">
                            <div v-if="waitingSearchResults">
                                Buscando...
                            </div>
                            <div v-else>
                                <div v-if="searchResultsTotalPages > 1" id="pagination" >
                                    <paginate ref="paginate"
                                              :page-count="searchResultsTotalPages"
                                              :click-handler="goToSearchResultsPage"
                                              :initial-page="searchResultsCurrentPage - 1"
                                              :prev-text="'Prev'"
                                              :next-text="'Next'"
                                              :page-range="2"
                                              :margin-pages="1"
                                              :container-class="'pagination'"
                                              :page-class="'page-item'"
                                              :page-link-class="'page-link'"
                                              :prev-class="'page-item'"
                                              :prev-link-class="'page-link'"
                                              :next-class="'page-item'"
                                              :next-link-class="'page-link'"
                                    >
                                    </paginate>
                                </div>
                                <div v-if="searchResultsTotalResults !== null" class=" small text-right">
                                    {{ searchResultsTotalResults }} series encontradas
                                </div>

                                <div class="list-group">
                                    <a v-for="searchResult in searchResults" href="#" @click.prevent="addLine(searchResult)" class="list-group-item list-group-item-action flex-column align-items-start">
                                        <div class="d-flex w-100 justify-content-between">
                                            <div class="h6 mb-1">{{ searchResult.serie_descripcion}}</div>
                                        </div>
                                        <p class="mb-0">{{ searchResult.serie_unidades}}</p>
                                        <p class="mb-0">
                                            {{getReadableFrequency(searchResult.indice_tiempo_frecuencia)}}.
                                            {{ getReadableRange(searchResult.indice_tiempo_frecuencia, searchResult.serie_indice_inicio, searchResult.serie_indice_final) }}.
                                            ({{ searchResult.serie_id}})
                                        </p>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </tab>
                <tab name="Editar Serie">
                    <EditSeries/>
                </tab>
                <tab name="Formato">
                    En construcción
                </tab>
            </tabs>
        </div>

        <div class="d-flex" style="overflow-x: hidden; height: 100%;">
            <div id="the-chart">
                <Chart/>
            </div>
        </div>
    </div>
  



        <blockquote> 
          &#8220;First, solve the problem. Then, write the code.&#8221;
          <footer>
            <small>
              <em>&mdash;John Johnson</em>
            </small>
          </footer>
        </blockquote>
        </v-flex>
      </v-layout>
    </v-slide-y-transition>
  </v-container>
</template>

<script>

    import axios from 'axios'
    import _ from 'lodash'
    import Chart from '@/components/Chart.vue'
    import EditSeries from '@/components/EditSeries.vue'
    import {globalStore} from '../main.js'
    import bus from '@/components/EventBus.js'
    import Paginate from 'vuejs-paginate'
    import {utilsMixin} from '../util.js'

    export default {
        mounted: function () {
            let self = this
            // Whenever the meta is changed, push the new metadata into the query string.
            bus.$on('seriesArrayMetaChanged', function (newArray) {
                self.$router.push({name: 'HelloWorld', query: {meta: JSON.stringify(newArray)}})
            })

            this.searchQuery = ''
            this.debouncedSearch()
        },
        name: 'HelloWorld',
        components: {
            Chart,
            Paginate,
            EditSeries
        },
        mixins: [utilsMixin],
        data () {
            return {
                searchQuery: '',
                searchMinPeriodicity: 999,
                searchMinLastYear: 0,
                searchMaxFirstYear: 9999,
                searchDatasetTema: 'any',
                waitingSearchResults: false,
                searchResults: [],
                searchResultsCurrentPage: 1,
                searchResultsTotalPages: 1,
                searchResultsTotalResults: null,
                sidebarIsOpen: true,
                searchPossibleMaxYears: _.range((new Date()).getFullYear(), 2000),
                searchPossibleMinYears: _.range(1881, (new Date()).getFullYear() - 1)
            }
        },
        methods: {
            doSearch () {
                let self = this
                self.waitingSearchResults = true
                axios.get(globalStore.metadataApiBaseUrl + 'query', {
                    params: {
                        q: self.searchQuery,
                        min_periodicity: self.searchMinPeriodicity,
                        min_last_year: self.searchMinLastYear,
                        max_first_year: self.searchMaxFirstYear,
                        dataset_tema: self.searchDatasetTema,
                        page: self.searchResultsCurrentPage
                    }
                }).then(function (response) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('Response from query:')
                        console.log(response.data)
                    }
                    self.searchResults = response.data.data
                    self.searchResultsTotalPages = response.data.last_page
                    self.searchResultsTotalResults = response.data.total
                    if (response.data.status === 'bad query') {
                        self.searchResultsTotalResults = null
                    }
                }).catch(function (error) {
                    console.log(error)
                    self.$toast('Error en el buscador, intente nuevamente', {
                        className: 'et-alert',
                        horizontalPosition: 'center',
                        closable: 'true'
                    })
                }).then(function () {
                    self.waitingSearchResults = false
                })
            },
            debouncedSearch: _.debounce(function (e) {
                // When typing a search query, reset the number of results and results page to the initial one
                this.searchResults = []
                this.searchResultsCurrentPage = 1
                this.doSearch()
            }, 500),
            addLine (searchResult) {
                bus.addSeriesMeta(searchResult)
            },
            toggleSidebarMenu: function () {
                this.sidebarIsOpen = !this.sidebarIsOpen
            },
            closeSidebarMenu: function () {
                this.sidebarIsOpen = false
            },
            goToSearchResultsPage: function (page) {
                this.searchResultsCurrentPage = page
                this.doSearch()
            }
        }
    }
</script>

<style scoped>
    h1, h2 {
      font-weight: normal;
    }
    /* ul.test {
      list-style-type: none;
      padding: 0;
    }
    li.test {
      display: inline-block;
      margin: 0 10px;
    } */
    #search-results {
        overflow: auto;
    }
    #setup-panel {
        overflow-x: hidden;
        transition: 0.5s ease;
        position: fixed;
        z-index: 2;
        background: white;
        border: 1px black solid;
        height: 100%;
        max-width: 450px;
        width: calc(100vw - 55px);
        top: 5px;
    }
    #setup-panel.sidebar-menu-open {
        left: 55px;

    }
    #setup-panel.sidebar-menu-closed {
        left: -600px;
    }
    #the-chart {
        flex: 1;
    }
    .h6 {
        font-weight: bold;
    }
    #pagination {
        display: table;
        margin: 0 auto;
    }
</style>
