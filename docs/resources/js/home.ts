/*!
jQuery Waypoints - v2.0.5
Copyright (c) 2011-2014 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
;(function() {
    const t = Array.prototype.indexOf || function(t) {
        for (let e = 0, n = this.length; e < n; e++) {
            if (e in this && this[e] === t) return e;
        }
        return -1;
    };
    const e = Array.prototype.slice;

    (function(t, e) {
        if (typeof define === "function" && define.amd) {
            return define("waypoints", ["jquery"], function(n) {
                return e(n, t);
            });
        } else {
            return e(t.jQuery, t);
        }
    })(window, function(n, r) {
        let i, o, l, s, f, u, c, a, h, d, p, y, v, w, g, m;
        i = n(r);
        a = t.call(r, "ontouchstart") >= 0;
        s = { horizontal: {}, vertical: {} };
        f = 1;
        c = {};
        u = "waypoints-context-id";
        p = "resize.waypoints";
        y = "scroll.waypoints";
        v = 1;
        w = "waypoints-waypoint-ids";
        g = "waypoint";
        m = "waypoints";

        type ScrollDirection = "right" | "left" | "down" | "up";
        type Axis = "horizontal" | "vertical";

        interface WaypointOptions {
            offset: number | string | (() => number);
            handler: (direction: ScrollDirection) => void;
            context?: any;
            continuous?: boolean;
            enabled?: boolean;
            horizontal?: boolean;
            triggerOnce?: boolean;
        }

        interface Waypoint {
            $element: JQuery;
            element: HTMLElement;
            axis: Axis;
            callback: (direction: ScrollDirection) => void;
            context: Context;
            enabled: boolean;
            id: string;
            offset: number | null;
            options: WaypointOptions;
            trigger: (direction: ScrollDirection) => void;
            disable: () => void;
            enable: () => void;
            destroy: () => void;
        }

        interface Context {
            $element: JQuery;
            element: HTMLElement;
            didResize: boolean;
            didScroll: boolean;
            id: string;
            oldScroll: { x: number; y: number };
            waypoints: { horizontal: Record<string, Waypoint>; vertical: Record<string, Waypoint> };
            doScroll: () => void;
            refresh: () => void;
            checkEmpty: () => void;
        }

        o = function() {
            function t(t: JQuery) {
                const e = this;
                this.$element = t;
                this.element = t[0];
                this.didResize = false;
                this.didScroll = false;
                this.id = "context" + f++;
                this.oldScroll = { x: t.scrollLeft(), y: t.scrollTop() };
                this.waypoints = { horizontal: {}, vertical: {} };
                this.element[u] = this.id;
                c[this.id] = this;
                t.bind(y, function() {
                    if (!(e.didScroll || a)) {
                        e.didScroll = true;
                        const t = function() {
                            e.doScroll();
                            return e.didScroll = false;
                        };
                        return r.setTimeout(t, n[m].settings.scrollThrottle);
                    }
                });
                t.bind(p, function() {
                    if (!e.didResize) {
                        e.didResize = true;
                        const t = function() {
                            n[m]("refresh");
                            return e.didResize = false;
                        };
                        return r.setTimeout(t, n[m].settings.resizeThrottle);
                    }
                });
            }

            t.prototype.doScroll = function() {
                const e = this;
                const t = {
                    horizontal: {
                        newScroll: this.$element.scrollLeft(),
                        oldScroll: this.oldScroll.x,
                        forward: "right" as ScrollDirection,
                        backward: "left" as ScrollDirection
                    },
                    vertical: {
                        newScroll: this.$element.scrollTop(),
                        oldScroll: this.oldScroll.y,
                        forward: "down" as ScrollDirection,
                        backward: "up" as ScrollDirection
                    }
                };
                if (a && (!t.vertical.oldScroll || !t.vertical.newScroll)) {
                    n[m]("refresh");
                }
                n.each(t, function(t, r) {
                    const l: Waypoint[] = [];
                    const o = r.newScroll > r.oldScroll;
                    const i = o ? r.forward : r.backward;
                    n.each(e.waypoints[t], function(t, e) {
                        if (r.oldScroll < e.offset && e.offset <= r.newScroll) {
                            l.push(e);
                        } else if (r.newScroll < e.offset && e.offset <= r.oldScroll) {
                            l.push(e);
                        }
                    });
                    l.sort(function(t, e) {
                        return t.offset - e.offset;
                    });
                    if (!o) {
                        l.reverse();
                    }
                    return n.each(l, function(t, e) {
                        if (e.options.continuous || t === l.length - 1) {
                            return e.trigger(i);
                        }
                    });
                });
                return this.oldScroll = { x: t.horizontal.newScroll, y: t.vertical.newScroll };
            };

            t.prototype.refresh = function() {
                const i = this;
                const r = n.isWindow(this.element);
                const e = this.$element.offset();
                this.doScroll();
                const t = {
                    horizontal: {
                        contextOffset: r ? 0 : e.left,
                        contextScroll: r ? 0 : this.oldScroll.x,
                        contextDimension: this.$element.width(),
                        oldScroll: this.oldScroll.x,
                        forward: "right" as ScrollDirection,
                        backward: "left" as ScrollDirection,
                        offsetProp: "left"
                    },
                    vertical: {
                        contextOffset: r ? 0 : e.top,
                        contextScroll: r ? 0 : this.oldScroll.y,
                        contextDimension: r ? n[m]("viewportHeight") : this.$element.height(),
                        oldScroll: this.oldScroll.y,
                        forward: "down" as ScrollDirection,
                        backward: "up" as ScrollDirection,
                        offsetProp: "top"
                    }
                };
                return n.each(t, function(t, e) {
                    return n.each(i.waypoints[t], function(t, r) {
                        let i = r.options.offset;
                        const o = r.offset;
                        const l = n.isWindow(r.element) ? 0 : r.$element.offset()[e.offsetProp];
                        if (n.isFunction(i)) {
                            i = i.apply(r.element);
                        } else if (typeof i === "string") {
                            i = parseFloat(i);
                            if (r.options.offset.indexOf("%") > -1) {
                                i = Math.ceil(e.contextDimension * i / 100);
                            }
                        }
                        r.offset = l - e.contextOffset + e.contextScroll - i;
                        if (r.options.onlyOnScroll && o != null || !r.enabled) {
                            return;
                        }
                        if (o !== null && o < e.oldScroll && e.oldScroll <= r.offset) {
                            return r.trigger(e.backward);
                        } else if (o !== null && o > e.oldScroll && e.oldScroll >= r.offset) {
                            return r.trigger(e.forward);
                        } else if (o === null && e.oldScroll >= r.offset) {
                            return r.trigger(e.forward);
                        }
                    });
                });
            };

            t.prototype.checkEmpty = function() {
                if (n.isEmptyObject(this.waypoints.horizontal) && n.isEmptyObject(this.waypoints.vertical)) {
                    this.$element.unbind([p, y].join(" "));
                    return delete c[this.id];
                }
            };

            return t;
        }();

        l = function() {
            function t(t: JQuery, e: Context, r: WaypointOptions) {
                const i = this;
                if (r.offset === "bottom-in-view") {
                    r.offset = function() {
                        let t = n[m]("viewportHeight");
                        if (!n.isWindow(e.element)) {
                            t = e.$element.height();
                        }
                        return t - n(this).outerHeight();
                    };
                }
                this.$element = t;
                this.element = t[0];
                this.axis = r.horizontal ? "horizontal" : "vertical";
                this.callback = r.handler;
                this.context = e;
                this.enabled = r.enabled;
                this.id = "waypoints" + v++;
                this.offset = null;
                this.options = r;
                e.waypoints[this.axis][this.id] = this;
                s[this.axis][this.id] = this;
                const o = this.element[w] != null ? this.element[w] : [];
                o.push(this.id);
                this.element[w] = o;
            }

            t.prototype.trigger = function(t: ScrollDirection) {
                if (!this.enabled) {
                    return;
                }
                if (this.callback != null) {
                    this.callback.apply(this.element, [t]);
                }
                if (this.options.triggerOnce) {
                    return this.destroy();
                }
            };

            t.prototype.disable = function() {
                return this.enabled = false;
            };

            t.prototype.enable = function() {
                this.context.refresh();
                return this.enabled = true;
            };

            t.prototype.destroy = function() {
                delete s[this.axis][this.id];
                delete this.context.waypoints[this.axis][this.id];
                return this.context.checkEmpty();
            };

            t.getWaypointsByElement = function(t: HTMLElement) {
                const r = t[w];
                if (!r) {
                    return [];
                }
                const e = n.extend({}, s.horizontal, s.vertical);
                return n.map(r, function(t) {
                    return e[t];
                });
            };

            return t;
        }();

        d = {
            init: function(t: any, e: WaypointOptions) {
                e = n.extend({}, n.fn[g].defaults, e);
                if (e.handler == null) {
                    e.handler = t;
                }
                this.each(function() {
                    const t = n(this);
                    let i = e.context != null ? e.context : n.fn[g].defaults.context;
                    if (!n.isWindow(i)) {
                        i = t.closest(i);
                    }
                    i = n(i);
                    let r = c[i[0][u]];
                    if (!r) {
                        r = new o(i);
                    }
                    return new l(t, r, e);
                });
                n[m]("refresh");
                return this;
            },
            disable: function() {
                return d._invoke.call(this, "disable");
            },
            enable: function() {
                return d._invoke.call(this, "enable");
            },
            destroy: function() {
                return d._invoke.call(this, "destroy");
            },
            prev: function(t: Axis, e: any) {
                return d._traverse.call(this, t, e, function(t, e, n) {
                    if (e > 0) {
                        return t.push(n[e - 1]);
                    }
                });
            },
            next: function(t: Axis, e: any) {
                return d._traverse.call(this, t, e, function(t, e, n) {
                    if (e < n.length - 1) {
                        return t.push(n[e + 1]);
                    }
                });
            },
            _traverse: function(t: Axis, e: any, i: (t: any[], e: number, n: any[]) => void) {
                if (t == null) {
                    t = "vertical";
                }
                if (e == null) {
                    e = r;
                }
                const l = h.aggregate(e);
                const o: any[] = [];
                this.each(function() {
                    const e = n.inArray(this, l[t]);
                    return i(o, e, l[t]);
                });
                return this.pushStack(o);
            },
            _invoke: function(t: string) {
                this.each(function() {
                    const e = l.getWaypointsByElement(this);
                    return n.each(e, function(e, n) {
                        n[t]();
                        return true;
                    });
                });
                return this;
            }
        };

        n.fn[g] = function() {
            const r = arguments[0];
            const t = 2 <= arguments.length ? e.call(arguments, 1) : [];
            if (d[r]) {
                return d[r].apply(this, t);
            } else if (n.isFunction(r)) {
                return d.init.apply(this, arguments);
            } else if (n.isPlainObject(r)) {
                return d.init.apply(this, [null, r]);
            } else if (!r) {
                return n.error("jQuery Waypoints needs a callback function or handler option.");
            } else {
                return n.error("The " + r + " method does not exist in jQuery Waypoints.");
            }
        };

        n.fn[g].defaults = {
            context: r,
            continuous: true,
            enabled: true,
            horizontal: false,
            offset: 0,
            triggerOnce: false
        };

        h = {
            refresh: function() {
                return n.each(c, function(t, e) {
                    return e.refresh();
                });
            },
            viewportHeight: function() {
                const t = r.innerHeight;
                return t != null ? t : i.height();
            },
            aggregate: function(t: any) {
                let e = s;
                if (t) {
                    e = c[n(t)[0][u]] != null ? c[n(t)[0][u]].waypoints : void 0;
                }
                if (!e) {
                    return [];
                }
                const r = { horizontal: [], vertical: [] };
                n.each(r, function(t, i) {
                    n.each(e[t], function(t, e) {
                        return i.push(e);
                    });
                    i.sort(function(t, e) {
                        return t.offset - e.offset;
                    });
                    r[t] = n.map(i, function(t) {
                        return t.element;
                    });
                    return r[t] = n.unique(r[t]);
                });
                return r;
            },
            above: function(t: any) {
                if (t == null) {
                    t = r;
                }
                return h._filter(t, "vertical", function(t, e) {
                    return e.offset <= t.oldScroll.y;
                });
            },
            below: function(t: any) {
                if (t == null) {
                    t = r;
                }
                return h._filter(t, "vertical", function(t, e) {
                    return e.offset > t.oldScroll.y;
                });
            },
            left: function(t: any) {
                if (t == null) {
                    t = r;
                }
                return h._filter(t, "horizontal", function(t, e) {
                    return e.offset <= t.oldScroll.x;
                });
            },
            right: function(t: any) {
                if (t == null) {
                    t = r;
                }
                return h._filter(t, "horizontal", function(t, e) {
                    return e.offset > t.oldScroll.x;
                });
            },
            enable: function() {
                return h._invoke("enable");
            },
            disable: function() {
                return h._invoke("disable");
            },
            destroy: function() {
                return h._invoke("destroy");
            },
            extendFn: function(t: string, e: any) {
                return d[t] = e;
            },
            _invoke: function(t: string) {
                const e = n.extend({}, s.vertical, s.horizontal);
                return n.each(e, function(e, n) {
                    n[t]();
                    return true;
                });
            },
            _filter: function(t: any, e: Axis, r: (i: Context, e: Waypoint) => boolean) {
                const i = c[n(t)[0][u]];
                if (!i) {
                    return [];
                }
                const o: any[] = [];
                n.each(i.waypoints[e], function(t, e) {
                    if (r(i, e)) {
                        o.push(e);
                    }
                });
                o.sort(function(t, e) {
                    return t.offset - e.offset;
                });
                return n.map(o, function(t) {
                    return t.element;
                });
            }
        };

        n[m] = function() {
            const n = arguments[0];
            const t = 2 <= arguments.length ? e.call(arguments, 1) : [];
            if (h[n]) {
                return h[n].apply(null, t);
            } else {
                return h.aggregate.call(null, n);
            }
        };

        n[m].settings = {
            resizeThrottle: 100,
            scrollThrottle: 30
        };

        return i.on("load.waypoints", function() {
            return n[m]("refresh");
        });
    });
}).call(this);

/*
Sticky Elements Shortcut for jQuery Waypoints - v2.0.5
Copyright (c) 2011-2014 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/jquery-waypoints/blob/master/licenses.txt
*/
;(function() {
    (function(t, n) {
        if (typeof define === "function" && define.amd) {
            return define(["jquery", "waypoints"], n);
        } else {
            return n(t.jQuery);
        }
    })(window, function(t) {
        const n = {
            wrapper: '<div class="sticky-wrapper" />',
            stuckClass: "stuck",
            direction: "down right"
        };

        const i = function(t: JQuery, n: { wrapper: string }) {
            t.wrap(n.wrapper);
            const i = t.parent();
            return i.data("isWaypointStickyWrapper", true);
        };

        t.waypoints("extendFn", "sticky", function(r: WaypointOptions) {
            const a = t.extend({}, t.fn.waypoint.defaults, n, r);
            const e = i(this, a);
            const s = a.handler;
            a.handler = function(n: ScrollDirection) {
                const i = t(this).children(":first");
                const r = a.direction.indexOf(n) !== -1;
                i.toggleClass(a.stuckClass, r);
                e.height(r ? i.outerHeight() : "");
                if (s != null) {
                    return s.call(this, n);
                }
            };
            e.waypoint(a);
            return this.data("stuckClass", a.stuckClass);
        });

        return t.waypoints("extendFn", "unsticky", function() {
            const t = this.parent();
            if (!t.data("isWaypointStickyWrapper")) {
                return this;
            }
            t.waypoint("destroy");
            this.unwrap();
            return this.removeClass(this.data("stuckClass"));
        });
    });
}).call(this);

// Code syntax highlighting by highlight.js
hljs.initHighlightingOnLoad();

$(function() {
    // Initiate scroll effects
    const s = skrollr.init({
        smoothScrolling: false,
        forceHeight: false
    });

    // Keep header stuck to top after scrolling down
    $('header').waypoint('sticky');

    // Show 3 random lovers/users of Papa Parse from
    // the list defined in lovers.js
    $('.lover').each(function() {
        const i = randomInt(0, peopleLovePapa.length - 1);
        const lover = peopleLovePapa.splice(i, 1)[0];

        let val = "";
        if (lover.link) {
            val += `<a href="${lover.link}">${lover.name}</a> `;
        } else {
            val += `${lover.name} `;
        }
        val += lover.description;
        if (lover.quote) {
            val += ` <i>"${lover.quote}"</i>`;
        }

        $(this).html(val);
    });

    // Schedule the ticker to change every so often
    setInterval(function() {
        const $current = $('.ticker-item.current');
        let $next = $current.next('.ticker-item');

        if (!$next.length) {
            $next = $current.siblings('.ticker-item').first();
        }

        $current.removeClass('current');
        setTimeout(function() {
            $next.addClass('current');
        }, 500); // at least as long as the CSS transition
    }, 7000);
});
