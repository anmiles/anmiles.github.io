var app = new Vue({
    el: '#app',
    data: {
        tHot: 90,
        tCold: 20,
        tFinal: 75,
        vFinal: 200
    },
    computed: {
        vCold: function () {
            return Math.floor(((this.tFinal - this.tHot) / (this.tCold - this.tHot)) * this.vFinal);
        }
    }
});
