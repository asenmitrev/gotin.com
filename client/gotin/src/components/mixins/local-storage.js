export default {
  methods: {
    setData (key, val) {
      localStorage && localStorage.setItem(key, val)
    },
    getData (key) {
      return localStorage && localStorage.getItem(key)
    },
    setJson (key, val) {
      localStorage && localStorage.setItem(key, JSON.stringify(val))
    },
    getJson (key) {
      return localStorage && JSON.parse(localStorage.getItem(key))
    },
    removeFromStorage (key) {
      localStorage.removeItem(key)
    }
  }
}
