<template>
  <div class="column main-col">
      <div class="row row--no-margin flex-1 middle-xs main-row">
          <div class="container">
              <div class="row">
                <div class="col-xs-12 col-md-6 column">
                    <form class="form login-pad" v-on:submit="login">
                        <h2 class="text-center heading">Вход</h2>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                                <input type="text" name="login-name" class="form-control" placeholder="Име" v-model="loginUser.email">
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                                <input type="password" name="login-password" class="form-control" placeholder="Парола" v-model="loginUser.password">
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                                <div class="form-control" style="visibility: hidden"></div>
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                                <div class="form-control facebook-login" v-on:click="fbLogin"><span class="ti-facebook"></span> <span class="hide-xs">connect with</span> facebook</div>
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <button type="submit" class="invisible-button">
                                <span class="ti-control-play"></span>
                            </button>
                        </div>
                    </form>
                </div>
                <div class="col-xs-12 col-md-6 column" v-on:submit="register">
                    <form class="form register-pad">
                        <h2 class="text-center heading">Регистрация</h2>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                            <input type="text" name="reg-name" class="form-control" placeholder="Име за вход" v-model="registerUser.username">
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                            <input type="text" name="reg-name" class="form-control" placeholder="Име за пред хора" v-model="registerUser.displayName">
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                            <input type="password" name="reg-password" class="form-control" placeholder="Парола" v-model="registerUser.password">
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <div class="form-group">
                            <input type="password" name="reg-password-repeat" class="form-control" placeholder="Повтори парола" v-model="registerUser.confirmPassword">
                            </div>
                        </div>
                        <div class="row row--no-margin center-xs">
                            <button type="submit" class="invisible-button">
                                <span class="ti-control-forward"></span>
                            </button>
                        </div>
                    </form>
                </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import apiService from './mixins/api-service'
import localStorageService from './mixins/local-storage'

/* eslint-disable */
(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = '//connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'))

window.fbAsyncInit = function() {
    FB.init({
        appId      : '150068215790542',
        cookie     : true,
        xfbml      : true,
        version    : 'v2.5'
    });
};

export default {
  name: 'Login',
  data () {
    return {
      loginUser: {
          email: '',
          password: ''
      },
      registerUser: {
          username: '',
          displayName: '',
          password: '',
          confirmPassword: ''
      }
    }
  },
  mixins: [localStorageService],
  methods: {
      fbLogin() {
        FB.login(response => {
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                //POST request to 'users/facebook-login', facebookResponseObject
                //this.facebookLogin(response);
                apiService.post('users/facebook-login', response)
                    .then((data) => {
                        this.$toastr('success', 'Успешен вход!')
                        this.processLogin(data)
                    })
            } else if (response.status === 'not_authorized') {
                // The person is logged into Facebook, but not your app.
            } else {
                // The person is not logged into Facebook, so we're not sure if
                // they are logged into this app or not.
            }
        }, { scope: 'email,public_profile' });
      },
      login(event) {
        event.preventDefault()
        if(this.loginUser.email != '' && this.loginUser.email.length > 1 && this.loginUser.password != '' && this.loginUser.password.length > 1){
            apiService.post('users/login', this.loginUser)
                .then((response) => {
                    this.$toastr('success', 'Успешен вход!')
                    this.processLogin(response)
                })
                .catch((err) => {
                    this.$toastr('error', err.response.data.message, 'Грешка!')
                })
        }
      },
      register(event) {
        event.preventDefault()
        
        if(this.registerUser.username == '' || this.registerUser.username.length < 2 || this.registerUser.password == '' || this.registerUser.password.length < 2
            || this.registerUser.confirmPassword == '' || this.registerUser.confirmPassword.length < 2 || this.registerUser.displayName == ''
            || this.registerUser.displayName.length < 2){
            return this.$toastr('error', 'Всички полета са задължителни!')
        }
        if(this.registerUser.password != this.registerUser.confirmPassword){
            return this.$toastr('error', 'Паролите не съвпадат!')
        }
        apiService.post('users/register', this.registerUser)
            .then((response) => {
                this.$toastr('success', 'Успешна регистрация!')
                this.processLogin(response)
            })
            .catch((err, a, b) => {
                this.$toastr('error', err.response.data.message, 'Грешка!')
            })
      },
      processLogin(response) {
        apiService.defaults.headers.common['x-access-token'] = response.data.token
        this.$store.commit('saveCurrentUser', response.data.user)
        this.setJson('currentUser', response.data.user)
        this.$store.commit('saveToken', response.data.token)
        this.setData('authToken', response.data.token)
        this.$router.push('/')
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import './../assets/styles/settings/variables.scss';
  @import './../assets/styles/settings/colors.scss';
    .main-col {
        min-height: 100%;
        background: url('./../assets/images/register.jpg') no-repeat center center fixed;
        background-size: cover;
    }

    .main-row {
        background: rgba(174, 189, 56, 0.1);
    }

    .heading {
        font-family: $fontLogo;
        font-size: 32px;
        margin-bottom: 60px;
    }

    .login-pad, .register-pad {
        padding: 60px 0;
        margin: 20px 0px;
        border-radius: 8px;
    }

    .register-pad {
        color: $secondaryTextColor;
        background: rgba(104, 130, 158, 0.7);
        box-shadow: inset 0px 0px 255px 10px rgba(0,0,0,0.3);
    }

    .login-pad {
        color: $secondaryTextColor;
        background: rgba(174, 189, 56, 0.7);
        box-shadow: inset 0px 0px 255px 10px rgba(0,0,0,0.3);
    }

    .invisible-button {
        background: transparent;
        border: none;
        color: white;
        font-size: 48px;
        margin-top: 20px;
        cursor: pointer;

        &:active {
            span {
                color: $themeDark;
            }
        }
    }
</style>
