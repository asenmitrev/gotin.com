<template>
  <div class="row row--no-margin between-xs middle-xs header">
      <div class="logo">
          <router-link to="/">готин.com</router-link>
      </div>

      <div class="menu" v-click-outside="hide">
        <span class="ti-menu" @click="toggle"></span>

        <div class="dropdown" v-show="menuOpen">
            <router-link to="/" class="dropdown-item"><span class="ti-home"></span>Начало</router-link>
            <router-link to="/coolest" class="dropdown-item"><span class="ti-crown"></span>Най-готините</router-link>
            <router-link to="/random" class="dropdown-item"><span class="ti-face-smile"></span>Рандъми</router-link>
            <router-link to="/login" class="dropdown-item" v-if="!isLoggedIn"><span class="ti-power-off"></span>Вход</router-link>
            <div class="dropdown-item" v-if="isLoggedIn" @click="logout"><span class="ti-power-off"></span>Изход</div>
        </div>
      </div>
  </div>
</template>

<script>
import ClickOutside from 'vue-click-outside'
import localStorageService from './mixins/local-storage'

export default {
  name: 'AppHeader',
  data () {
    return {
      menuOpen: false
    }
  },
  mixins: [localStorageService],
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn
    }
  },
  methods: {
    toggle () {
      this.menuOpen = !this.menuOpen
    },
    hide () {
      this.menuOpen = false
    },
    logout () {
        this.removeFromStorage('currentUser');
        this.removeFromStorage('authToken');
        this.$store.commit('logout')
    }
  },

  directives: {
    ClickOutside
  }
}
</script>

<style lang="scss" scoped>
    @import './../assets/styles/settings/variables.scss';
    @import './../assets/styles/settings/colors.scss';

    .header {
        padding: 10px 15px;
        height: $headerHeight;
        box-shadow: 0px 2px 28px 2px rgba(0,0,0,0.4);
        background: $menuBackgroundColor;
        color: $menuTextColor;
        position: fixed;
        width: 100%;
        top: 0;
    }

    .logo {
        font-family: $fontLogo;
        font-size: 38px;

        a {
            color: $menuTextColor;

            &:hover {
                text-decoration: none;
            }
        }
    }

    .menu {
        padding: 10px;
        cursor: pointer;
        position: relative;
    }

    .dropdown {
        position: absolute;
        top: 45px;
        right: 0;
        background: white;
        min-width: 200px;
        border: 1px solid #bbb;
        font-size: 18px;

        &-item {
            padding: 15px 20px;
            display: block;
            color: $primaryTextColor;
        }

        span {
            margin-right: 10px;
        }
    }

    .ti-menu {
        font-size: 24px;
    }
</style>
