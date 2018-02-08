<template>
  <div>
    <div class="row row--no-margin row1 center-xs" :style="styleObject">
      <div class="overlay">
        <h1 class="header-logo col-xs-12 text-center">ГОТИН.COM</h1>
        <div class="header-text col-xs-12 text-center">Чудиш се дали си готин? Спориш с приятелите си кой е по-готин? Най-накрая има място, където да проверите кой е най-готин! Готин.com, мястото на готините хора.</div>
      </div>
    </div>

    <div class="row row--no-margin row2">
      <div class="column col-xs-12">
        <h1 class="text-center subheader">Най-готините</h1>
        <div class="text-center subtext">Ти може да си готин, но винаги има един най-готин. Тук са най-готините за седмицата, месеца и всички времена!</div>
        <div class="row">
          <div class="col-xs-4">
            <user-profile :user="topUserWeek"></user-profile>
          </div>
        </div>
      </div>
    </div>

    <div class="row row--no-margin row3">
      <div class="col-xs-12 column">
        <h1 class="text-center subheader">Рандъми</h1>
        <div class="text-center subtext">Как ще разбереш, че някой е готин, ако вече не е най-готиният? Разгледай някой и друг рандъм и ако е готин - кажи му го!</div>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import apiService from './mixins/api-service'
import UserProfile from './common/User'

import image1 from './../assets/images/chicken.jpg'
import image2 from './../assets/images/graffiti.jpg'
import image3 from './../assets/images/dog.jpg'
import image4 from './../assets/images/skateboard.jpg'
var backgrounds = [image1, image2, image3, image4]
var randomInt = getRandomInt(backgrounds.length)

export default {
  name: 'HelloWorld',
  data () {
    return {
      topUserWeek: null,
      styleObject: {
        'background-image': 'url(' + backgrounds[randomInt] + ')'
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    apiService.get('users/gotin/week')
      .then(response => {
        next(vm => vm.setData(response.data))
      })
      .catch(error => {
        this.$toastr('error', error.response.data.message, 'Грешка!')
      })
  },
  // when route changes and this component is already rendered,
  // the logic will be slightly different.
  beforeRouteUpdate (to, from, next) {
    this.topUserWeek = null
    apiService.get('users/gotin/week')
      .then(response => {
        this.setData(response.data)
        next()
      })
      .catch(error => {
        this.$toastr('error', error.response.data.message, 'Грешка!')
      })
  },
  methods: {
    setData (user) {
      this.topUserWeek = user
    }
  },
  components: { UserProfile },
  computed: mapGetters(['user', 'isLoggedIn', 'token'])
}

function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max))
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import './../assets/styles/settings/variables.scss';
  @import './../assets/styles/settings/mixins.scss';
  @import './../assets/styles/settings/colors.scss';

  .header {
    &-logo {
      font-family: $fontLogo;
      font-size: 72px;
      margin-bottom: 20px;
      @include responsive-xs {
        font-size: 64px;
      }
    }

    &-text {
      font-size: 18px;
      line-height: 26px;
    }
  }

  .subheader {
    font-family: $fontLogo;
    font-size: 32px;
    margin-bottom: 10px;
  }

  .subtext {
    font-size: 18px;
    line-height: 26px;
  }

  .row1 {
    background: url('./../assets/images/graffiti.jpg') no-repeat center center fixed;
    background-size: cover;
    color: $secondaryTextColor;

    .overlay {
      background: rgba(104, 130, 158, 0.4);
      padding: 180px 30px;
      width: 100%;
    }
  }

  .row2 {
    padding: 40px 30px;
  }

  .row3 {
    padding: 40px 30px;
    background: $themeLight;
  }
</style>
