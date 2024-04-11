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
			return Math.round(((this.tFinal - this.tHot) / (this.tCold - this.tHot)) * this.vFinal);
		},
		vOolong: function () {
			return Math.round(this.vFinal / 100) / 2;
		}
	}
});
