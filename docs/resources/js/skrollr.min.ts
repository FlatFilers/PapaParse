/*! skrollr 0.6.27 (2014-09-28) | Alexander Prinzhorn - https://github.com/Prinzhorn/skrollr | Free to use under terms of MIT license */
(function (e: Window, t: Document) {
    "use strict";

    type EasingFunction = (progress: number) => number;
    type KeyframeProps = { [key: string]: { value: any, easing: EasingFunction } };
    type Keyframe = { frame: number, props: KeyframeProps, isEnd?: boolean, isPercentage?: boolean, mode?: string, offset?: number, constant?: string, anchors?: string[], eventType?: string };
    type Skrollable = { element: HTMLElement, styleAttr: string, classAttr: string, anchorTarget: HTMLElement | null, keyFrames: Keyframe[], smoothScrolling: boolean, edgeStrategy: string, emitEvents: boolean, lastFrameIndex: number, dirtyStyleAttr?: string, dirtyClassAttr?: string };
    type Constants = { [key: string]: number };
    type EventHandlers = { beforerender?: (data: any) => boolean, render?: (data: any) => void, keyframe?: (element: HTMLElement, name: string, direction: string) => void };

    enum Direction {
        Down = "down",
        Up = "up"
    }

    enum EdgeStrategy {
        Set = "set",
        Ease = "ease",
        Reset = "reset"
    }

    enum EventType {
        TouchStart = "touchstart",
        TouchMove = "touchmove",
        TouchCancel = "touchcancel",
        TouchEnd = "touchend"
    }

    enum Anchor {
        Start = "start",
        End = "end",
        Center = "center",
        Bottom = "bottom"
    }

    const o = t.documentElement;
    const a = t.body;
    let it: any;
    let ut: Constants = {};
    let yt: EdgeStrategy = EdgeStrategy.Set;
    let ct: EventHandlers = {};
    let ft = true;
    let Vt = 1;
    let mt = 0.004;
    let dt = true;
    let gt = 200;
    let vt = { targetTop: 0 };
    let Gt = false;
    let st: HTMLElement | null = null;
    let pt: any;
    let ht = false;
    let qt = -1;
    let Lt = Date.now();
    let Mt = 0;
    let $t = 0;
    let _t = false;
    let Bt = 0;
    let Ot = 0;
    let zt: Direction = Direction.Down;
    let Kt = 0;
    let Tt = "";
    let Yt: { element: EventTarget, name: string, listener: EventListener }[] = [];
    let lt: Skrollable[] = [];

    const U: { [key: string]: EasingFunction } = {
        begin: () => 0,
        end: () => 1,
        linear: (e) => e,
        quadratic: (e) => e * e,
        cubic: (e) => e * e * e,
        swing: (e) => -Math.cos(e * Math.PI) / 2 + 0.5,
        sqrt: (e) => Math.sqrt(e),
        outCubic: (e) => Math.pow(e - 1, 3) + 1,
        bounce: (e) => {
            let t;
            if (e <= 0.5083) t = 3;
            else if (e <= 0.8489) t = 9;
            else if (e <= 0.96208) t = 27;
            else if (e <= 0.99981) t = 91;
            else return 1;
            return 1 - Math.abs(3 * Math.cos(1.028 * e * t) / t);
        }
    };

    function n(r: any) {
        K();
        it = this;
        r = r || {};
        ut = r.constants || {};
        if (r.easing) {
            for (const n in r.easing) {
                U[n] = r.easing[n];
            }
        }
        yt = r.edgeStrategy || EdgeStrategy.Set;
        ct = { beforerender: r.beforerender, render: r.render, keyframe: r.keyframe };
        ft = r.forceHeight !== false;
        if (ft) Vt = r.scale || 1;
        mt = r.mobileDeceleration || 0.004;
        dt = r.smoothScrolling !== false;
        gt = r.smoothScrollingDuration || 200;
        vt = { targetTop: it.getScrollTop() };
        Gt = (r.mobileCheck || function () { return /Android|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent || navigator.vendor || e.opera); })();
        if (Gt) {
            st = t.getElementById("skrollr-body");
            if (st) at();
            X();
            Dt(o, ["skrollr", "skrollr-mobile"], ["no-skrollr"]);
        } else {
            Dt(o, ["skrollr", "skrollr-desktop"], ["no-skrollr"]);
        }
        it.refresh();
        St(e, "resize orientationchange", function () {
            const e = o.clientWidth;
            const t = o.clientHeight;
            if (t !== $t || e !== Mt) {
                $t = t;
                Mt = e;
                _t = true;
            }
        });
        const i = Y();
        (function l() {
            Z();
            bt = i(l);
        })();
        return it;
    }

    const i = {
        get: function () { return it; },
        init: function (e: any) { return it || new n(e); },
        VERSION: "0.6.26"
    };

    const l = Object.prototype.hasOwnProperty;
    const s = e.Math;
    const c = e.getComputedStyle;
    const f = EventType.TouchStart;
    const u = EventType.TouchMove;
    const m = EventType.TouchCancel;
    const p = EventType.TouchEnd;
    const d = "skrollable";
    const g = d + "-before";
    const v = d + "-between";
    const h = d + "-after";
    const y = "skrollr";
    const T = "no-" + y;
    const b = y + "-desktop";
    const S = y + "-mobile";
    const k = "linear";
    const w = 1000;
    const x = 0.004;
    const E = 200;
    const A = Anchor.Start;
    const F = Anchor.End;
    const C = Anchor.Center;
    const D = Anchor.Bottom;
    const H = "___skrollable_id";
    const I = /^(?:input|textarea|button|select)$/i;
    const P = /^\s+|\s+$/g;
    const N = /^data(?:-(_\w+))?(?:-?(-?\d*\.?\d+p?))?(?:-?(start|end|top|center|bottom))?(?:-?(top|center|bottom))?$/;
    const O = /\s*(@?[\w\-\[\]]+)\s*:\s*(.+?)\s*(?:;|$)/gi;
    const V = /^(@?[a-z\-]+)\[(\w+)\]$/;
    const z = /-([a-z0-9_])/g;
    const q = (e: string, t: string) => t.toUpperCase();
    const L = /[\-+]?[\d]*\.?[\d]+/g;
    const M = /\{\?\}/g;
    const $ = /rgba?\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+/g;
    const _ = /[a-z\-]+-gradient/g;
    let B = "";
    let G = "";
    const K = () => {
        const e = /^(?:O|Moz|webkit|ms)|(?:-(?:o|moz|webkit|ms)-)/;
        if (c) {
            const t = c(a, null);
            for (const n in t) {
                if (B = n.match(e) || +n == n && t[n].match(e)) break;
            }
            if (!B) return B = G = "", r;
            B = B[0];
            if ("-" === B.slice(0, 1)) {
                G = B;
                B = { "-webkit-": "webkit", "-moz-": "Moz", "-ms-": "ms", "-o-": "O" }[B];
            } else {
                G = "-" + B.toLowerCase() + "-";
            }
        }
    };

    const Y = () => {
        const t = e.requestAnimationFrame || e[B.toLowerCase() + "RequestAnimationFrame"];
        const r = Pt();
        if (Gt || !t) {
            return (t: FrameRequestCallback) => {
                const n = Pt() - r;
                const o = s.max(0, 1000 / 60 - n);
                return e.setTimeout(() => { r = Pt(); t(); }, o);
            };
        }
        return t;
    };

    const R = () => {
        const t = e.cancelAnimationFrame || e[B.toLowerCase() + "CancelAnimationFrame"];
        if (Gt || !t) {
            return (t: number) => e.clearTimeout(t);
        }
        return t;
    };

    n.prototype.refresh = function (e?: HTMLElement | HTMLElement[]) {
        let n, o, a = false;
        if (e === undefined) {
            a = true;
            lt = [];
            Bt = 0;
            e = t.getElementsByTagName("*") as unknown as HTMLElement[];
        } else if (e.length === undefined) {
            e = [e];
        }
        for (n = 0, o = e.length; o > n; n++) {
            const i = e[n];
            let l = i;
            const s: Keyframe[] = [];
            let c = dt;
            let f = yt;
            let u = false;
            if (a && H in i) delete i[H];
            if (i.attributes) {
                for (let m = 0, p = i.attributes.length; p > m; m++) {
                    const g = i.attributes[m];
                    if ("data-anchor-target" !== g.name) {
                        if ("data-smooth-scrolling" !== g.name) {
                            if ("data-edge-strategy" !== g.name) {
                                if ("data-emit-events" !== g.name) {
                                    const v = g.name.match(N);
                                    if (v !== null) {
                                        const h = { props: g.value, element: i, eventType: g.name.replace(z, q) };
                                        s.push(h);
                                        const y = v[1];
                                        if (y) h.constant = y.substr(1);
                                        const T = v[2];
                                        if (/p$/.test(T)) {
                                            h.isPercentage = true;
                                            h.offset = (0 | T.slice(0, -1)) / 100;
                                        } else {
                                            h.offset = 0 | T;
                                        }
                                        const b = v[3];
                                        const S = v[4] || b;
                                        if (b && b !== A && b !== F) {
                                            h.mode = "relative";
                                            h.anchors = [b, S];
                                        } else {
                                            h.mode = "absolute";
                                            if (b === F) h.isEnd = true;
                                            if (!h.isPercentage) h.offset = h.offset * Vt;
                                        }
                                    }
                                } else {
                                    u = true;
                                }
                            } else {
                                f = g.value;
                            }
                        } else {
                            c = "off" !== g.value;
                        }
                    } else {
                        l = t.querySelector(g.value) as HTMLElement;
                        if (l === null) throw 'Unable to find anchor target "' + g.value + '"';
                    }
                }
                if (s.length) {
                    let k, w, x;
                    if (!a && H in i) {
                        x = i[H];
                        k = lt[x].styleAttr;
                        w = lt[x].classAttr;
                    } else {
                        x = i[H] = Bt++;
                        k = i.style.cssText;
                        w = Ct(i);
                    }
                    lt[x] = { element: i, styleAttr: k, classAttr: w, anchorTarget: l, keyFrames: s, smoothScrolling: c, edgeStrategy: f, emitEvents: u, lastFrameIndex: -1 };
                    Dt(i, [d], []);
                }
            }
        }
        Et();
        for (n = 0, o = e.length; o > n; n++) {
            const E = lt[e[n][H]];
            if (E !== undefined) {
                J(E);
                et(E);
            }
        }
        return it;
    };

    n.prototype.relativeToAbsolute = function (e: HTMLElement, t: Anchor, r: Anchor) {
        const n = o.clientHeight;
        const a = e.getBoundingClientRect();
        let i = a.top;
        const l = a.bottom - a.top;
        if (t === D) i -= n;
        if (t === C) i -= n / 2;
        if (r === D) i += l;
        if (r === C) i += l / 2;
        i += it.getScrollTop();
        return 0 | i + 0.5;
    };

    n.prototype.animateTo = function (e: number, t: any) {
        t = t || {};
        const n = Pt();
        const o = it.getScrollTop();
        pt = {
            startTop: o,
            topDiff: e - o,
            targetTop: e,
            duration: t.duration || w,
            startTime: n,
            endTime: n + (t.duration || w),
            easing: U[t.easing || k],
            done: t.done
        };
        if (!pt.topDiff) {
            if (pt.done) pt.done.call(it, false);
            pt = undefined;
        }
        return it;
    };

    n.prototype.stopAnimateTo = function () {
        if (pt && pt.done) pt.done.call(it, true);
        pt = undefined;
    };

    n.prototype.isAnimatingTo = function () {
        return !!pt;
    };

    n.prototype.isMobile = function () {
        return Gt;
    };

    n.prototype.setScrollTop = function (t: number, r: boolean) {
        ht = r === true;
        if (Gt) {
            Kt = s.min(s.max(t, 0), Ot);
        } else {
            e.scrollTo(0, t);
        }
        return it;
    };

    n.prototype.getScrollTop = function () {
        if (Gt) {
            return Kt;
        } else {
            return e.pageYOffset || o.scrollTop || a.scrollTop || 0;
        }
    };

    n.prototype.getMaxScrollTop = function () {
        return Ot;
    };

    n.prototype.on = function (e: string, t: Function) {
        ct[e] = t;
        return it;
    };

    n.prototype.off = function (e: string) {
        delete ct[e];
        return it;
    };

    n.prototype.destroy = function () {
        const e = R();
        e(bt);
        wt();
        Dt(o, [T], [y, b, S]);
        for (let t = 0, n = lt.length; n > t; t++) {
            ot(lt[t].element);
        }
        o.style.overflow = a.style.overflow = "";
        o.style.height = a.style.height = "";
        if (st) i.setStyle(st, "transform", "none");
        it = undefined;
        st = undefined;
        ct = undefined;
        ft = undefined;
        Ot = 0;
        Vt = 1;
        ut = undefined;
        mt = undefined;
        zt = Direction.Down;
        qt = -1;
        Mt = 0;
        $t = 0;
        _t = false;
        pt = undefined;
        dt = undefined;
        gt = undefined;
        vt = undefined;
        ht = undefined;
        Bt = 0;
        yt = undefined;
        Gt = false;
        Kt = 0;
        Tt = undefined;
    };

    const X = () => {
        let n, i, l, c, d, g, v, h, y, T, b, S;
        St(o, [f, u, m, p].join(" "), function (e) {
            const o = e.changedTouches[0];
            for (c = e.target; c.nodeType === 3;) c = c.parentNode as HTMLElement;
            switch (d = o.clientY, g = o.clientX, T = e.timeStamp, I.test(c.tagName) || e.preventDefault(), e.type) {
                case f:
                    if (n) n.blur();
                    it.stopAnimateTo();
                    n = c;
                    i = v = d;
                    l = g;
                    y = T;
                    break;
                case u:
                    if (I.test(c.tagName) && t.activeElement !== c) e.preventDefault();
                    h = d - v;
                    S = T - b;
                    it.setScrollTop(Kt - h, true);
                    v = d;
                    b = T;
                    break;
                default:
                case m:
                case p:
                    const a = i - d;
                    const k = l - g;
                    const w = k * k + a * a;
                    if (w < 49) {
                        if (!I.test(n.tagName)) {
                            n.focus();
                            const x = t.createEvent("MouseEvents");
                            x.initMouseEvent("click", true, true, e.view, 1, o.screenX, o.screenY, o.clientX, o.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
                            n.dispatchEvent(x);
                        }
                        return;
                    }
                    n = undefined;
                    const E = h / S;
                    const A = s.max(s.min(E, 3), -3);
                    const F = s.abs(E / mt);
                    const C = E * F + 0.5 * mt * F * F;
                    let D = it.getScrollTop() - C;
                    let H = 0;
                    if (D > Ot) {
                        H = (Ot - D) / C;
                        D = Ot;
                    } else if (D < 0) {
                        H = -D / C;
                        D = 0;
                    }
                A *= 1 - H;
                it.animateTo(0 | D + 0.5, { easing: "outCubic", duration: A });
            }
        });
        e.scrollTo(0, 0);
        o.style.overflow = a.style.overflow = "hidden";
    };

    const j = () => {
        let e, t, r, n, a, i, l, c, f, u, m, p = o.clientHeight, d = At();
        for (c = 0, f = lt.length; f > c; c++) {
            for (e = lt[c], t = e.element, r = e.anchorTarget, n = e.keyFrames, a = 0, i = n.length; i > a; a++) {
                l = n[a];
                u = l.offset;
                m = d[l.constant] || 0;
                l.frame = u;
                if (l.isPercentage) l.frame *= p;
                if (l.mode === "relative") {
                    ot(t);
                    l.frame = it.relativeToAbsolute(r, l.anchors[0], l.anchors[1]) - u;
                    ot(t, true);
                }
                l.frame += m;
                if (ft && !l.isEnd && l.frame > Ot) Ot = l.frame;
            }
        }
        Ot = s.max(Ot, Ft());
        for (c = 0, f = lt.length; f > c; c++) {
            for (e = lt[c], n = e.keyFrames, a = 0, i = n.length; i > a; a++) {
                l = n[a];
                m = d[l.constant] || 0;
                if (l.isEnd) l.frame = Ot - l.offset + m;
            }
            e.keyFrames.sort(Nt);
        }
    };

    const W = (e: number, t: number) => {
        for (let r = 0, n = lt.length; n > r; r++) {
            const o = lt[r];
            const a = o.element;
            const s = o.smoothScrolling ? e : t;
            const c = o.keyFrames;
            const f = c.length;
            const u = c[0];
            const m = c[c.length - 1];
            const p = u.frame > s;
            const d = s > m.frame;
            const g = p ? u : m;
            const v = o.emitEvents;
            const h = o.lastFrameIndex;
            if (p || d) {
                if ((p && o.edge === -1) || (d && o.edge === 1)) continue;
                if (p) {
                    Dt(a, [g], [h, v]);
                    if (v && h > -1) {
                        xt(a, u.eventType, zt);
                        o.lastFrameIndex = -1;
                    }
                } else {
                    Dt(a, [h], [g, v]);
                    if (v && f > h) {
                        xt(a, m.eventType, zt);
                        o.lastFrameIndex = f;
                    }
                }
                o.edge = p ? -1 : 1;
                switch (o.edgeStrategy) {
                    case EdgeStrategy.Reset:
                        ot(a);
                        continue;
                    case EdgeStrategy.Ease:
                        s = g.frame;
                        break;
                    default:
                    case EdgeStrategy.Set:
                        const x = g.props;
                        for (const k in x) {
                            if (l.call(x, k)) {
                                const w = nt(x[k].value);
                                if (k.indexOf("@") === 0) {
                                    a.setAttribute(k.substr(1), w);
                                } else {
                                    i.setStyle(a, k, w);
                                }
                            }
                        }
                        continue;
                }
            } else {
                if (o.edge !== 0) {
                    Dt(a, [d, v], [h, g]);
                    o.edge = 0;
                }
                for (let E = 0; f - 1 > E; E++) {
                    if (s >= c[E].frame && c[E + 1].frame >= s) {
                        const A = c[E];
                        const F = c[E + 1];
                        for (const C in A.props) {
                            if (l.call(A.props, C)) {
                                const D = (s - A.frame) / (F.frame - A.frame);
                                const H = A.props[C].easing(D);
                                const I = rt(A.props[C].value, F.props[C].value, H);
                                const P = nt(I);
                                if (C.indexOf("@") === 0) {
                                    a.setAttribute(C.substr(1), P);
                                } else {
                                    i.setStyle(a, C, P);
                                }
                            }
                        }
                        if (v && h !== E) {
                            if (zt === Direction.Down) {
                                xt(a, A.eventType, zt);
                            } else {
                                xt(a, F.eventType, zt);
                            }
                            o.lastFrameIndex = E;
                        }
                        break;
                    }
                }
            }
        }
    };

    const Z = () => {
        if (_t) {
            _t = false;
            Et();
        }
        const e = it.getScrollTop();
        const t = Pt();
        if (pt) {
            if (t >= pt.endTime) {
                e = pt.targetTop;
                const r = pt.done;
                pt = undefined;
                if (r) r.call(it, false);
            } else {
                const n = pt.easing((t - pt.startTime) / pt.duration);
                e = 0 | pt.startTop + n * pt.topDiff;
            }
            it.setScrollTop(e, true);
        } else if (!ht) {
            const o = vt.targetTop - e;
            if (o) {
                vt = {
                    startTop: qt,
                    topDiff: e - qt,
                    targetTop: e,
                    startTime: Lt,
                    endTime: Lt + gt
                };
            }
            if (vt.endTime >= t) {
                const a = U.sqrt((t - vt.startTime) / gt);
                e = 0 | vt.startTop + a * vt.topDiff;
            }
        }
        if (Gt && st) {
            i.setStyle(st, "transform", "translate(0, " + -Kt + "px) " + Tt);
        }
        if (ht || qt !== e) {
            zt = e > qt ? Direction.Down : qt > e ? Direction.Up : zt;
            ht = false;
            const l = { curTop: e, lastTop: qt, maxTop: Ot, direction: zt };
            const s = ct.beforerender && ct.beforerender.call(it, l);
            if (s !== false) {
                W(e, it.getScrollTop());
                qt = e;
                if (ct.render) ct.render.call(it, l);
            }
        }
        Lt = t;
    };

    const J = (e: Skrollable) => {
        for (let t = 0, r = e.keyFrames.length; r > t; t++) {
            const n = e.keyFrames[t];
            const o: KeyframeProps = {};
            let i;
            while ((i = O.exec(n.props)) !== null) {
                const a = i[1];
                const s = i[2];
                const l = a.match(V);
                const c = l ? l[1] : k;
                const f = l ? l[2] : k;
                const u = s.indexOf("!") ? Q(s) : [s.slice(1)];
                o[a] = { value: u, easing: U[f] };
            }
            n.props = o;
        }
    };

    const Q = (e: string) => {
        const t: number[] = [];
        $.lastIndex = 0;
        e = e.replace($, (e) => e.replace(L, (e) => 100 * (e / 255) + "%"));
        if (G) {
            _.lastIndex = 0;
            e = e.replace(_, (e) => G + e);
        }
        e = e.replace(L, (e) => {
            t.push(+e);
            return "{?}";
        });
        t.unshift(e);
        return t;
    };

    const et = (e: Skrollable) => {
        const t: { [key: string]: any } = {};
        for (let r = 0, n = e.keyFrames.length; n > r; r++) {
            tt(e.keyFrames[r], t);
        }
        const o: { [key: string]: any } = {};
        for (let r = e.keyFrames.length - 1; r >= 0; r--) {
            tt(e.keyFrames[r], o);
        }
    };

    const tt = (e: Keyframe, t: { [key: string]: any }) => {
        for (const r in t) {
            if (!l.call(e.props, r)) {
                e.props[r] = t[r];
            }
        }
        for (const r in e.props) {
            t[r] = e.props[r];
        }
    };

    const rt = (e: any[], t: any[], r: number) => {
        if (e.length !== t.length) throw "Can't interpolate between \"" + e[0] + '" and "' + t[0] + '"';
        const n = [e[0]];
        for (let o = 1, a = e.length; a > o; o++) {
            n[o] = e[o] + (t[o] - e[o]) * r;
        }
        return n;
    };

    const nt = (e: any[]) => {
        let t = 1;
        M.lastIndex = 0;
        return e[0].replace(M, () => e[t++]);
    };

    const ot = (e: HTMLElement, t?: boolean) => {
        const n = [].concat(e);
        for (let o = 0, a = n.length; a > o; o++) {
            const i = n[o];
            const l = lt[i[H]];
            if (l) {
                if (t) {
                    i.style.cssText = l.dirtyStyleAttr!;
                    Dt(i, l.dirtyClassAttr!);
                } else {
                    l.dirtyStyleAttr = i.style.cssText;
                    l.dirtyClassAttr = Ct(i);
                    i.style.cssText = l.styleAttr;
                    Dt(i, l.classAttr);
                }
            }
        }
    };

    const at = () => {
        Tt = "translateZ(0)";
        i.setStyle(st!, "transform", Tt);
        const e = c(st!);
        const t = e.getPropertyValue("transform");
        const r = e.getPropertyValue(G + "transform");
        const n = t && t !== "none" || r && r !== "none";
        if (!n) Tt = "";
    };

    i.setStyle = (e: HTMLElement, t: string, r: any) => {
        const n = e.style;
        t = t.replace(z, q).replace("-", "");
        if (t === "zIndex") {
            n[t] = isNaN(r) ? r : "" + (0 | r);
        } else if (t === "float") {
            n.styleFloat = n.cssFloat = r;
        } else {
            try {
                if (B) n[B + t.slice(0, 1).toUpperCase() + t.slice(1)] = r;
                n[t] = r;
            } catch (o) { }
        }
    };

    const St = i.addEvent = (t: EventTarget, r: string, n: EventListener) => {
        const o = (t: Event) => {
            t = t || e.event;
            if (!t.target) t.target = t.srcElement as EventTarget;
            if (!t.preventDefault) t.preventDefault = () => { t.returnValue = false; t.defaultPrevented = true; };
            n.call(this, t);
        };
        const a = r.split(" ");
        for (let i = 0, l = a.length; l > i; i++) {
            const s = a[i];
            if (t.addEventListener) {
                t.addEventListener(s, n, false);
            } else {
                t.attachEvent("on" + s, o);
            }
            Yt.push({ element: t, name: s, listener: n });
        }
    };

    const kt = i.removeEvent = (e: EventTarget, t: string, r: EventListener) => {
        const n = t.split(" ");
        for (let o = 0, a = n.length; a > o; o++) {
            const i = n[o];
            if (e.removeEventListener) {
                e.removeEventListener(i, r, false);
            } else {
                e.detachEvent("on" + i, r);
            }
        }
    };

    const wt = () => {
        for (let e = 0, t = Yt.length; t > e; e++) {
            const r = Yt[e];
            kt(r.element, r.name, r.listener);
        }
        Yt = [];
    };

    const xt = (e: HTMLElement, t: string, r: Direction) => {
        if (ct.keyframe) ct.keyframe.call(it, e, t, r);
    };

    const Et = () => {
        const e = it.getScrollTop();
        Ot = 0;
        if (ft && !Gt) a.style.height = "";
        j();
        if (ft && !Gt) a.style.height = Ot + o.clientHeight + "px";
        if (Gt) it.setScrollTop(s.min(it.getScrollTop(), Ot));
        else it.setScrollTop(e, true);
        ht = true;
    };

    const At = () => {
        const e = o.clientHeight;
        const t: { [key: string]: number } = {};
        for (const r in ut) {
            let n = ut[r];
            if (typeof n === "function") n = n.call(it);
            if (/p$/.test(n)) n = n.slice(0, -1) / 100 * e;
            t[r] = n;
        }
        return t;
    };

    const Ft = () => {
        const e = st && st.offsetHeight || 0;
        const t = s.max(e, a.scrollHeight, a.offsetHeight, o.scrollHeight, o.offsetHeight, o.clientHeight);
        return t - o.clientHeight;
    };

    const Ct = (t: HTMLElement) => {
        const r = "className";
        if (e.SVGElement && t instanceof e.SVGElement) {
            t = t[r];
            return t.baseVal;
        }
        return t[r];
    };

    const Dt = (t: HTMLElement, n: string[], o: string[]) => {
        const a = "className";
        if (e.SVGElement && t instanceof e.SVGElement) {
            t = t[a];
            return t.baseVal;
        }
        if (o === undefined) {
            t[a] = n.join(" ");
            return;
        }
        let i = t[a];
        for (let l = 0, s = o.length; s > l; l++) {
            i = It(i).replace(It(o[l]), " ");
        }
        i = Ht(i);
        for (let c = 0, f = n.length; f > c; c++) {
            if (It(i).indexOf(It(n[c])) === -1) i += " " + n[c];
        }
        t[a] = Ht(i);
    };

    const Ht = (e: string) => e.replace(P, "");

    const It = (e: string) => " " + e + " ";

    const Pt = Date.now || (() => +new Date());

    const Nt = (e: Keyframe, t: Keyframe) => e.frame - t.frame;

    if (typeof define === "function" && define.amd) {
        define([], () => i);
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = i;
    } else {
        (e as any).skrollr = i;
    }
})(window, document);
