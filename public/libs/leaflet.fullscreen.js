(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
        // Browser globals
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
}(function (L) {
    L.Control.Fullscreen = L.Control.extend({
        options: {
            position: 'topleft',
            title: {
                'false': 'View Fullscreen',
                'true': 'Exit Fullscreen'
            }
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-control-fullscreen leaflet-bar leaflet-control');

            this.link = L.DomUtil.create('a', 'leaflet-control-fullscreen-button leaflet-bar-part', container);
            this.link.href = '#';

            this._map = map;
            this._map.on('fullscreenchange', this._toggleTitle, this);
            this._toggleTitle();

            L.DomEvent.on(this.link, 'click', this._click, this);

            return container;
        },

        _click: function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            this._map.toggleFullscreen(this.options);
        },

        _toggleTitle: function() {
            this.link.title = this.options.title[this._map.isFullscreen()];
        }
    });

    L.Map.include({
        isFullscreen: function () {
            return this._isFullscreen || false;
        },

        toggleFullscreen: function (options) {
            if (this.isFullscreen()) {
                if (options && options.pseudoFullscreen) {
                    this._disablePseudoFullscreen(document.body);
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else {
                    this._disablePseudoFullscreen(document.body);
                }
            } else {
                if (options && options.pseudoFullscreen) {
                    this._enablePseudoFullscreen(document.body);
                } else if (document.body.requestFullscreen) {
                    document.body.requestFullscreen();
                } else if (document.body.mozRequestFullScreen) {
                    document.body.mozRequestFullScreen();
                } else if (document.body.webkitRequestFullscreen) {
                    document.body.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                } else if (document.body.msRequestFullscreen) {
                    document.body.msRequestFullscreen();
                } else {
                    this._enablePseudoFullscreen(document.body);
                }
            }

        },

        _enablePseudoFullscreen: function () {
            L.DomUtil.addClass(document.body, 'leaflet-pseudo-fullscreen');
            this._setFullscreen(true);
            this.fire('fullscreenchange');
        },

        _disablePseudoFullscreen: function () {
            L.DomUtil.removeClass(document.body, 'leaflet-pseudo-fullscreen');
            this._setFullscreen(false);
            this.fire('fullscreenchange');
        },

        _setFullscreen: function(fullscreen) {
            this._isFullscreen = fullscreen;
            if (fullscreen) {
                L.DomUtil.addClass(document.body, 'leaflet-fullscreen-on');
            } else {
                L.DomUtil.removeClass(document.body, 'leaflet-fullscreen-on');
            }
            this.invalidateSize();
        },

        _onFullscreenChange: function (e) {
            var fullscreenElement =
                document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement;

            if (fullscreenElement === document.body && !this._isFullscreen) {
                this._setFullscreen(true);
                this.fire('fullscreenchange');
            } else if (fullscreenElement !== document.body && this._isFullscreen) {
                this._setFullscreen(false);
                this.fire('fullscreenchange');
            }
        }
    });

    L.Map.mergeOptions({
        fullscreenControl: false
    });

    L.Map.addInitHook(function () {
        if (this.options.fullscreenControl) {
            this.fullscreenControl = new L.Control.Fullscreen(this.options.fullscreenControl);
            this.addControl(this.fullscreenControl);
        }

        var fullscreenchange;

        if ('onfullscreenchange' in document) {
            fullscreenchange = 'fullscreenchange';
        } else if ('onmozfullscreenchange' in document) {
            fullscreenchange = 'mozfullscreenchange';
        } else if ('onwebkitfullscreenchange' in document) {
            fullscreenchange = 'webkitfullscreenchange';
        } else if ('onmsfullscreenchange' in document) {
            fullscreenchange = 'MSFullscreenChange';
        }

        if (fullscreenchange) {
            var onFullscreenChange = L.bind(this._onFullscreenChange, this);

            this.whenReady(function () {
                L.DomEvent.on(document, fullscreenchange, onFullscreenChange);
            });

            this.on('unload', function () {
                L.DomEvent.off(document, fullscreenchange, onFullscreenChange);
            });
        }
    });

    L.control.fullscreen = function (options) {
        return new L.Control.Fullscreen(options);
    };
}));
