<template>
  <div id="app">
    <div class="form-row align-items-center">
      <section class="col-12">
        <h1 class="bold text-capitalize pb-10">Results</h1>
        <hr>
      </section>
      <section class="col-12 bg-light">
        <h4 class="card-title mb-0 py-3">
          Filtros
          <button
            class="btn btn-dark btn-sm"
            v-on:click="isHidden = !isHidden"
          >{{(isHidden)?"mostrar":"ocultar"}}</button>
        </h4>
        <div class="row" v-if="!isHidden">
          <div class="col form-group">
            <label>filter by type, Tipo de Inmueble</label>
            <select v-model="name" class="form-control">
              <option value>All</option>
              <option v-for="x in results.data" :key="x.id">{{ x.name.en.name }}</option>
            </select>
          </div>
          <div class="col form-group">
            <label>Sort by</label>
            <select class="form-control" @change="sort">
              <option value>As loaded</option>
              <option value="name-asc">Name (asc)</option>
              <option value="name-desc">Name (desc)</option>
              <option value="date-asc">Date (asc)</option>
              <option value="date-desc">Date (desc)</option>
              <option value="manual">Manual</option>
            </select>
          </div>
          <div class="col form-group">
            <label>Search everything in row</label>
            <input v-model="search_terms" @keyup="search()" type="text" class="form-control">
          </div>
          <div class="col form-check">
            <label class="form-check-label">
              <input type="checkbox" v-model="featured" class="form-check-input" value="1"> if featured equals '1'
            </label>
          </div>
          <a @click="resetFilters" class="btn btn-primary">Reset filters</a>
        </div>
      </section>
      <section class="col-12">
        <table id="myTable2" class="table">
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col">Images</th>
              <th scope="col">name</th>
              <th scope="col">details</th>
              <th scope="col">date</th>
            </tr>
          </thead>
          <draggable id="myTable" :disabled="!enabled" v-model="results.data" tag="tbody">
            <tr v-for="(item,index) in filteredResults" :key="index">
              <th scope="row">{{item.manual_position}}</th>
              <td>
                <img v-bind:src="item.image" class="img-thumbnail" style="max-height: 50px;">
              </td>
              <td>
                {{item.name.en.name}}
                <span
                  class="badge badge-dark"
                  v-if="item.featured == '1'"
                >featured</span>
              </td>
              <td>{{item.metatags.en.description}}</td>
              <td>{{item.created_at}}</td>
            </tr>
          </draggable>
        </table>
      </section>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import draggable from "vuedraggable";
export default {
  name: "app",
  components: {
    draggable
  },
  data() {
    return {
      enabled: false,
      ms: false,
      name: "",
      search_terms: "",
      featured: "",
      opportunity: "",
      value: "",
      isHidden: false,
      isLoading: false,
      sortable: false,
      results: {}
    };
  },
  methods: {
    fetch() {
      var that = this;
      axios
        .get("https://webcms.dev/json-test")
        .then(function(response) {
          that.results = response;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    originsort() {
      var tbody = document.getElementById("myTable");
      var rows = [].slice.call(tbody.querySelectorAll("tr"));
      rows.sort(function(a, b) {
        return a.cells[0].innerHTML - b.cells[0].innerHTML;
      });
      rows.forEach(function(v) {
        tbody.appendChild(v);
      });
    },
    search() {
      var value = this.search_terms.toLowerCase();
      $("#myTable tr").filter(function() {
        $(this).toggle(
          $(this)
            .text()
            .toLowerCase()
            .indexOf(value) > -1
        );
      });
    },
    resetFilters() {
      this.name = "";
      this.search_terms = "";
      this.comment2 = "";
      $("#myTable tr").filter(function() {
        $(this).toggle(
          $(this)
            .text()
            .toLowerCase()
            .indexOf("") > -1
        );
      });
    },
    sort(e) {
      var that = this;
      var table, tbody, rows, switching, i, x, y, dir, shouldSwitch, n, value;
      value = e.target.value;
      table = document.getElementById("myTable2");
      tbody = document.getElementById("myTable");
      switching = true;
      function convertDate(d) {
        var p = d.split("-");
        return +(p[0] + p[1] + p[2].split(" ")[0]);
      }
      if (value == "name-asc") {
        n = 2;
        dir = "asc";
      } else if (value == "name-desc") {
        n = 2;
        dir = "desc";
      }
      if ((value == "name-asc") | (value == "name-desc")) {
        this.ms = false;
        while (switching) {
          switching = false;
          rows = table.rows;
          for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[2];
            y = rows[i + 1].getElementsByTagName("TD")[2];
            if (dir == "desc") {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
              }
            } else if (dir == "asc") {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
              }
            }
          }
          if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
          }
        }
      } else if ((value == "date-asc") | (value == "date-desc")) {
        this.ms = false;
        rows = [].slice.call(tbody.querySelectorAll("tr"));
        rows.sort(function(a, b) {
          if (value == "date-asc") {
            return (
              convertDate(a.cells[4].innerHTML) -
              convertDate(b.cells[4].innerHTML)
            );
          } else {
            return (
              convertDate(b.cells[4].innerHTML) -
              convertDate(a.cells[4].innerHTML)
            );
          }
        });
        rows.forEach(function(v) {
          tbody.appendChild(v);
        });
      } else if (value == "manual") {
        this.enabled = true;
        this.ms = true;
      } else {
        this.fetch();
        this.originsort();
      }
    }
  },
  computed: {
    filteredResults() {
      if (this.featured == true) {
        this.opportunity = 1;
      } else {
        this.opportunity = "";
      }
      return this.results.data.filter(item => {
        return (
          item.name.en.name.match(this.name) &&
          item.featured >= this.opportunity
        );
      });
    }
  },
  created() {
    this.fetch();
  },
  watch: {
    ms(newValue, oldValue) {
      if (oldValue && !newValue) {
        for (let i = 0; i < this.results.data.length; i++) {
          this.results.data[i].manual_position = i + 1;
        }
      } else if (!oldValue && newValue) {
        this.originsort();
      }
    }
  }
};
</script>

<style lang="scss">
</style>
