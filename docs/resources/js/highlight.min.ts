interface HighlightResult {
    r: number;
    value: string;
    language?: string;
    top?: any;
    second_best?: HighlightResult;
}

interface Language {
    cN?: string;
    b?: string | RegExp;
    e?: string | RegExp;
    k?: any;
    lR?: RegExp;
    bK?: string;
    bR?: RegExp;
    eR?: RegExp;
    tE?: string;
    eW?: boolean;
    i?: string | RegExp;
    iR?: RegExp;
    r?: number;
    c?: Language[];
    v?: Language[];
    starts?: Language;
    compiled?: boolean;
    sL?: string;
    subLanguageMode?: string;
    rB?: boolean;
    eB?: boolean;
    eE?: boolean;
    rE?: boolean;
    cN?: string;
    parent?: Language;
}

interface HighlightOptions {
    classPrefix?: string;
    tabReplace?: string;
    useBR?: boolean;
    languages?: string[];
}

interface Highlight {
    highlight: (name: string, value: string, ignore_illegals?: boolean, continuation?: any) => HighlightResult;
    highlightAuto: (text: string, languageSubset?: string[]) => HighlightResult;
    fixMarkup: (value: string) => string;
    highlightBlock: (block: HTMLElement) => void;
    configure: (options: HighlightOptions) => void;
    initHighlighting: () => void;
    initHighlightingOnLoad: () => void;
    registerLanguage: (name: string, language: (hljs: any) => Language) => void;
    listLanguages: () => string[];
    getLanguage: (name: string) => Language | undefined;
    inherit: (parent: any, obj: any) => any;
    IR: string;
    UIR: string;
    NR: string;
    CNR: string;
    BNR: string;
    RSR: string;
    BE: Language;
    ASM: Language;
    QSM: Language;
    PWM: Language;
    CLCM: Language;
    CBCM: Language;
    HCM: Language;
    NM: Language;
    CNM: Language;
    BNM: Language;
    CSSNM: Language;
    RM: Language;
    TM: Language;
    UTM: Language;
}

const hljs: Highlight = (function (e: any) {
    function n(e: string): string {
        return e.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;");
    }

    function t(e: HTMLElement): string {
        return e.nodeName.toLowerCase();
    }

    function r(e: RegExp, n: string): boolean {
        const t = e && e.exec(n);
        return t && 0 == t.index;
    }

    function a(e: HTMLElement): string | undefined {
        const n = (e.className + " " + (e.parentNode ? (e.parentNode as HTMLElement).className : "")).split(/\s+/);
        const filtered = n.map(e => e.replace(/^lang(uage)?-/, "")).filter(e => N(e) || /no(-?)highlight/.test(e));
        return filtered[0];
    }

    function o(e: any, n?: any): any {
        const t: any = {};
        for (const r in e) t[r] = e[r];
        if (n) for (const r in n) t[r] = n[r];
        return t;
    }

    function i(e: HTMLElement): any[] {
        const n: any[] = [];
        (function r(e: HTMLElement, a: number): number {
            for (let o = e.firstChild; o; o = o.nextSibling) {
                if (o.nodeType === 3) {
                    a += o.nodeValue!.length;
                } else if (o.nodeType === 1) {
                    n.push({ event: "start", offset: a, node: o });
                    a = r(o as HTMLElement, a);
                    if (!t(o as HTMLElement).match(/br|hr|img|input/)) {
                        n.push({ event: "stop", offset: a, node: o });
                    }
                }
            }
            return a;
        })(e, 0);
        return n;
    }

    function c(e: any[], r: any[], a: string): string {
        function o(): any[] {
            if (e.length && r.length) {
                if (e[0].offset != r[0].offset) {
                    return e[0].offset < r[0].offset ? e : r;
                } else {
                    return "start" == r[0].event ? e : r;
                }
            }
            return e.length ? e : r;
        }

        function i(e: HTMLElement): void {
            function r(e: any): string {
                return " " + e.nodeName + '="' + n(e.value) + '"';
            }
            l += "<" + t(e) + Array.prototype.map.call(e.attributes, r).join("") + ">";
        }

        function c(e: HTMLElement): void {
            l += "</" + t(e) + ">";
        }

        function u(e: any): void {
            ("start" == e.event ? i : c)(e.node);
        }

        let s = 0, l = "", f: any[] = [];
        while (e.length || r.length) {
            const g = o();
            l += n(a.substr(s, g[0].offset - s));
            s = g[0].offset;
            if (g == e) {
                f.reverse().forEach(c);
                do {
                    u(g.splice(0, 1)[0]);
                    g = o();
                } while (g == e && g.length && g[0].offset == s);
                f.reverse().forEach(i);
            } else {
                "start" == g[0].event ? f.push(g[0].node) : f.pop();
                u(g.splice(0, 1)[0]);
            }
        }
        return l + n(a.substr(s));
    }

    function u(e: Language): void {
        function n(e: any): string {
            return e && e.source || e;
        }

        function t(t: any, r?: boolean): RegExp {
            return new RegExp(n(t), "m" + (e.cI ? "i" : "") + (r ? "g" : ""));
        }

        function r(a: Language, i?: Language): void {
            if (!a.compiled) {
                a.compiled = true;
                a.k = a.k || a.bK;
                if (a.k) {
                    const c: any = {};
                    const u = function (n: string, t: string): void {
                        if (e.cI) t = t.toLowerCase();
                        t.split(" ").forEach(function (e: string) {
                            const t = e.split("|");
                            c[t[0]] = [n, t[1] ? Number(t[1]) : 1];
                        });
                    };
                    if (typeof a.k === "string") {
                        u("keyword", a.k);
                    } else {
                        Object.keys(a.k).forEach(function (e) {
                            u(e, a.k[e]);
                        });
                    }
                    a.k = c;
                }
                a.lR = t(a.l || /\b[A-Za-z0-9_]+\b/, true);
                if (i) {
                    if (a.bK) a.b = "\\b(" + a.bK.split(" ").join("|") + ")\\b";
                    if (!a.b) a.b = /\B|\b/;
                    a.bR = t(a.b);
                    if (!a.e && !a.eW) a.e = /\B|\b/;
                    if (a.e) a.eR = t(a.e);
                    a.tE = n(a.e) || "";
                    if (a.eW && i.tE) a.tE += (a.e ? "|" : "") + i.tE;
                }
                if (a.i) a.iR = t(a.i);
                if (a.r === undefined) a.r = 1;
                if (!a.c) a.c = [];
                const s: Language[] = [];
                a.c.forEach(function (e) {
                    if (e.v) {
                        e.v.forEach(function (n) {
                            s.push(o(e, n));
                        });
                    } else {
                        s.push(e === "self" ? a : e);
                    }
                });
                a.c = s;
                a.c.forEach(function (e) {
                    r(e, a);
                });
                if (a.starts) r(a.starts, i);
                const l = a.c.map(function (e) {
                    return e.bK ? "\\.?(" + e.b + ")\\.?" : e.b;
                }).concat([a.tE, a.i]).map(n).filter(Boolean);
                a.t = l.length ? t(l.join("|"), true) : { exec: function () { return null; } };
            }
        }
        r(e);
    }

    function s(e: string, t: string, a?: boolean, o?: any): HighlightResult {
        function i(e: string, n: Language): Language | undefined {
            for (let t = 0; t < n.c.length; t++) {
                if (r(n.c[t].bR!, e)) return n.c[t];
            }
            return undefined;
        }

        function c(e: Language, n: string): Language | undefined {
            return r(e.eR!, n) ? e : e.eW ? c(e.parent!, n) : undefined;
        }

        function f(e: string, n: Language): boolean {
            return !a && r(n.iR!, e);
        }

        function g(e: Language, n: string): any {
            const t = x.cI ? n[0].toLowerCase() : n[0];
            return e.k.hasOwnProperty(t) && e.k[t];
        }

        function p(e: string, n: string, t?: boolean, r?: boolean): string {
            const a = r ? "" : E.classPrefix;
            let o = '<span class="' + a, i = t ? "" : "</span>";
            o += e + '">';
            return o + n + i;
        }

        function d(): string {
            if (!w.k) return n(y);
            let e = "", t = 0;
            w.lR!.lastIndex = 0;
            for (let r = w.lR!.exec(y); r;) {
                e += n(y.substr(t, r.index - t));
                const a = g(w, r);
                if (a) {
                    B += a[1];
                    e += p(a[0], n(r[0]));
                } else {
                    e += n(r[0]);
                }
                t = w.lR!.lastIndex;
                r = w.lR!.exec(y);
            }
            return e + n(y.substr(t));
        }

        function h(): string {
            if (w.sL && !R[w.sL]) return n(y);
            const e = w.sL ? s(w.sL, y, true, L[w.sL]) : l(y);
            if (w.r > 0) B += e.r;
            if (w.subLanguageMode === "continuous") L[w.sL] = e.top;
            return p(e.language!, e.value, false, true);
        }

        function v(): string {
            return w.sL !== undefined ? h() : d();
        }

        function b(e: Language, t: string): void {
            const r = e.cN ? p(e.cN, "", true) : "";
            if (e.rB) {
                M += r;
                y = "";
            } else if (e.eB) {
                M += n(t) + r;
                y = "";
            } else {
                M += r;
                y = t;
            }
            w = Object.create(e, { parent: { value: w } });
        }

        function m(e: string, t?: string): number {
            y += e;
            if (t === undefined) {
                M += v();
                return 0;
            }
            const r = i(t, w);
            if (r) {
                M += v();
                b(r, t);
                return r.rB ? 0 : t.length;
            }
            const a = c(w, t);
            if (a) {
                const o = w;
                if (!o.rE && !o.eE) y += t;
                M += v();
                do {
                    if (w.cN) M += "</span>";
                    B += w.r;
                    w = w.parent!;
                } while (w != a.parent);
                if (o.eE) M += n(t);
                y = "";
                if (a.starts) b(a.starts, "");
                return o.rE ? 0 : t.length;
            }
            if (f(t, w)) throw new Error('Illegal lexeme "' + t + '" for mode "' + (w.cN || "<unnamed>") + '"');
            y += t;
            return t.length || 1;
        }

        const x = N(e);
        if (!x) throw new Error('Unknown language: "' + e + '"');
        u(x);
        let w = o || x, L: any = {}, M = "", k = w;
        while (k != x) {
            if (k.cN) M = p(k.cN, "", true) + M;
            k = k.parent!;
        }
        let y = "", B = 0;
        try {
            for (let C, j, I = 0;;) {
                if (w.t.lastIndex = I, C = w.t.exec(t), !C) break;
                j = m(t.substr(I, C.index - I), C[0]);
                I = C.index + j;
            }
            m(t.substr(I));
            for (let k = w; k.parent; k = k.parent) {
                if (k.cN) M += "</span>";
            }
            return { r: B, value: M, language: e, top: w };
        } catch (A) {
            if (A.message.indexOf("Illegal") != -1) return { r: 0, value: n(t) };
            throw A;
        }
    }

    function l(e: string, t?: string[]): HighlightResult {
        t = t || E.languages || Object.keys(R);
        let r: HighlightResult = { r: 0, value: n(e) }, a = r;
        t.forEach(function (n) {
            if (N(n)) {
                const t = s(n, e, false);
                t.language = n;
                if (t.r > a.r) a = t;
                if (t.r > r.r) {
                    a = r;
                    r = t;
                }
            }
        });
        if (a.language) r.second_best = a;
        return r;
    }

    function f(e: string): string {
        if (E.tabReplace) {
            e = e.replace(/^((<[^>]+>|\t)+)/gm, function (e, n) {
                return n.replace(/\t/g, E.tabReplace);
            });
        }
        if (E.useBR) e = e.replace(/\n/g, "<br>");
        return e;
    }

    function g(e: string, n?: string, t?: string): string {
        const r = n ? x[n] : t, a = [e.trim()];
        if (!e.match(/(\s|^)hljs(\s|$)/)) a.push("hljs");
        if (r) a.push(r);
        return a.join(" ").trim();
    }

    function p(e: HTMLElement): void {
        const n = a(e);
        if (!/no(-?)highlight/.test(n!)) {
            let t: HTMLElement;
            if (E.useBR) {
                t = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
                t.innerHTML = e.innerHTML.replace(/\n/g, "").replace(/<br[ \/]*>/g, "\n");
            } else {
                t = e;
            }
            const r = t.textContent!, o = n ? s(n, r, true) : l(r), u = i(t);
            if (u.length) {
                const p = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
                p.innerHTML = o.value;
                o.value = c(u, i(p), r);
            }
            o.value = f(o.value);
            e.innerHTML = o.value;
            e.className = g(e.className, n, o.language);
            e.result = { language: o.language, re: o.r };
            if (o.second_best) e.second_best = { language: o.second_best.language, re: o.second_best.r };
        }
    }

    function d(e: HighlightOptions): void {
        E = o(E, e);
    }

    function h(): void {
        if (!h.called) {
            h.called = true;
            const e = document.querySelectorAll("pre code");
            Array.prototype.forEach.call(e, p);
        }
    }

    function v(): void {
        addEventListener("DOMContentLoaded", h, false);
        addEventListener("load", h, false);
    }

    function b(n: string, t: (hljs: any) => Language): void {
        const r = R[n] = t(e);
        if (r.aliases) r.aliases.forEach(function (e) {
            x[e] = n;
        });
    }

    function m(): string[] {
        return Object.keys(R);
    }

    function N(e: string): Language | undefined {
        return R[e] || R[x[e]];
    }

    let E: HighlightOptions = { classPrefix: "hljs-", tabReplace: null, useBR: false, languages: undefined }, R: { [key: string]: Language } = {}, x: { [key: string]: string } = {};
    return {
        highlight: s,
        highlightAuto: l,
        fixMarkup: f,
        highlightBlock: p,
        configure: d,
        initHighlighting: h,
        initHighlightingOnLoad: v,
        registerLanguage: b,
        listLanguages: m,
        getLanguage: N,
        inherit: o,
        IR: "[a-zA-Z][a-zA-Z0-9_]*",
        UIR: "[a-zA-Z_][a-zA-Z0-9_]*",
        NR: "\\b\\d+(\\.\\d+)?",
        CNR: "(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",
        BNR: "\\b(0b[01]+)",
        RSR: "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",
        BE: { b: "\\\\[\\s\\S]", r: 0 },
        ASM: { cN: "string", b: "'", e: "'", i: "\\n", c: [{ b: "\\\\[\\s\\S]", r: 0 }] },
        QSM: { cN: "string", b: '"', e: '"', i: "\\n", c: [{ b: "\\\\[\\s\\S]", r: 0 }] },
        PWM: { b: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/ },
        CLCM: { cN: "comment", b: "//", e: "$", c: [{ b: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/ }] },
        CBCM: { cN: "comment", b: "/\\*", e: "\\*/", c: [{ b: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/ }] },
        HCM: { cN: "comment", b: "#", e: "$", c: [{ b: /\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/ }] },
        NM: { cN: "number", b: "\\b\\d+(\\.\\d+)?", r: 0 },
        CNM: { cN: "number", b: "(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", r: 0 },
        BNM: { cN: "number", b: "\\b(0b[01]+)", r: 0 },
        CSSNM: { cN: "number", b: "\\b\\d+(\\.\\d+)?(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?", r: 0 },
        RM: { cN: "regexp", b: /\//, e: /\/[gimuy]*/, i: /\n/, c: [{ b: "\\\\[\\s\\S]", r: 0 }, { b: /\[/, e: /\]/, r: 0, c: [{ b: "\\\\[\\s\\S]", r: 0 }] }] },
        TM: { cN: "title", b: "[a-zA-Z][a-zA-Z0-9_]*", r: 0 },
        UTM: { cN: "title", b: "[a-zA-Z_][a-zA-Z0-9_]*", r: 0 }
    };
})(function (e: any) {
    return e;
});

hljs.registerLanguage("coffeescript", function (e: any): Language {
    const c = {
        keyword: "in if for while finally new do return else break catch instanceof throw try this switch continue typeof delete debugger super then unless until loop of by when and or is isnt not",
        literal: "true false null undefined yes no on off",
        reserved: "case default function var void with const let enum export import native __hasProp __extends __slice __bind __indexOf",
        built_in: "npm require console print module global window document"
    };
    const n = "[A-Za-z$_][0-9A-Za-z$_]*";
    const t = { cN: "subst", b: /#\{/, e: /}/, k: c };
    const r = [
        hljs.BNM,
        hljs.inherit(hljs.CNM, { starts: { e: "(\\s*/)?", r: 0 } }),
        { cN: "string", v: [{ b: /'''/, e: /'''/, c: [hljs.BE] }, { b: /'/, e: /'/, c: [hljs.BE] }, { b: /"""/, e: /"""/, c: [hljs.BE, t] }, { b: /"/, e: /"/, c: [hljs.BE, t] }] },
        { cN: "regexp", v: [{ b: "///", e: "///", c: [t, hljs.HCM] }, { b: "//[gim]*", r: 0 }, { b: /\/(?![ *])(\\\/|.)*?\/[gim]*(?=\W|$)/ }] },
        { cN: "property", b: "@" + n },
        { b: "`", e: "`", eB: true, eE: true, sL: "javascript" }
    ];
    t.c = r;
    const i = hljs.inherit(hljs.TM, { b: n });
    const s = "(\\(.*\\))?\\s*\\B[-=]>";
    const o = { cN: "params", b: "\\([^\\(]", rB: true, c: [{ b: /\(/, e: /\)/, k: c, c: ["self"].concat(r) }] };
    return {
        aliases: ["coffee", "cson", "iced"],
        k: c,
        i: /\/\*/,
        c: r.concat([
            { cN: "comment", b: "###", e: "###", c: [hljs.PWM] },
            hljs.HCM,
            { cN: "function", b: "^\\s*" + n + "\\s*=\\s*" + s, e: "[-=]>", rB: true, c: [i, o] },
            { b: /[:\(,=]\s*/, r: 0, c: [{ cN: "function", b: s, e: "[-=]>", rB: true, c: [o] }] },
            { cN: "class", bK: "class", e: "$", i: /[:="\[\]]/, c: [{ bK: "extends", eW: true, i: /[:="\[\]]/, c: [i] }, i] },
            { cN: "attribute", b: n + ":", e: ":", rB: true, rE: true, r: 0 }
        ])
    };
});

hljs.registerLanguage("xml", function (): Language {
    const t = "[A-Za-z0-9\\._:-]+";
    const e = { b: /<\?(php)?(?!\w)/, e: /\?>/, sL: "php", subLanguageMode: "continuous" };
    const c = { eW: true, i: /</, r: 0, c: [e, { cN: "attribute", b: t, r: 0 }, { b: "=", r: 0, c: [{ cN: "value", c: [e], v: [{ b: /"/, e: /"/ }, { b: /'/, e: /'/ }, { b: /[^\s\/>]+/ }] }] }] };
    return {
        aliases: ["html", "xhtml", "rss", "atom", "xsl", "plist"],
        cI: true,
        c: [
            { cN: "doctype", b: "<!DOCTYPE", e: ">", r: 10, c: [{ b: "\\[", e: "\\]" }] },
            { cN: "comment", b: "<!--", e: "-->", r: 10 },
            { cN: "cdata", b: "<\\!\\[CDATA\\[", e: "\\]\\]>", r: 10 },
            { cN: "tag", b: "<style(?=\\s|>|$)", e: ">", k: { title: "style" }, c: [c], starts: { e: "</style>", rE: true, sL: "css" } },
            { cN: "tag", b: "<script(?=\\s|>|$)", e: ">", k: { title: "script" }, c: [c], starts: { e: "</script>", rE: true, sL: "javascript" } },
            e,
            { cN: "pi", b: /<\?\w+/, e: /\?>/, r: 10 },
            { cN: "tag", b: "</?", e: "/?>", c: [{ cN: "title", b: /[^ \/><\n\t]+/, r: 0 }, c] }
        ]
    };
});

hljs.registerLanguage("markdown", function (): Language {
    return {
        aliases: ["md", "mkdown", "mkd"],
        c: [
            { cN: "header", v: [{ b: "^#{1,6}", e: "$" }, { b: "^.+?\\n[=-]{2,}$" }] },
            { b: "<", e: ">", sL: "xml", r: 0 },
            { cN: "bullet", b: "^([*+-]|(\\d+\\.))\\s+" },
            { cN: "strong", b: "[*_]{2}.+?[*_]{2}" },
            { cN: "emphasis", v: [{ b: "\\*.+?\\*" }, { b: "_.+?_", r: 0 }] },
            { cN: "blockquote", b: "^>\\s+", e: "$" },
            { cN: "code", v: [{ b: "`.+?`" }, { b: "^( {4}|	)", e: "$", r: 0 }] },
            { cN: "horizontal_rule", b: "^[-\\*]{3,}", e: "$" },
            { b: "\\[.+?\\][\\(\\[].*?[\\)\\]]", rB: true, c: [{ cN: "link_label", b: "\\[", e: "\\]", eB: true, rE: true, r: 0 }, { cN: "link_url", b: "\\]\\(", e: "\\)", eB: true, eE: true }, { cN: "link_reference", b: "\\]\\[", e: "\\]", eB: true, eE: true }], r: 10 },
            { b: "^\\[.+\\]:", rB: true, c: [{ cN: "link_reference", b: "\\[", e: "\\]:", eB: true, eE: true, starts: { cN: "link_url", e: "$" } }] }
        ]
    };
});

hljs.registerLanguage("bash", function (e: any): Language {
    const t = { cN: "variable", v: [{ b: /\$[\w\d#@][\w\d_]*/ }, { b: /\$\{(.*?)\}/ }] };
    const s = { cN: "string", b: /"/, e: /"/, c: [hljs.BE, t, { cN: "variable", b: /\$\(/, e: /\)/, c: [hljs.BE] }] };
    const a = { cN: "string", b: /'/, e: /'/ };
    return {
        aliases: ["sh", "zsh"],
        l: /-?[a-z\.]+/,
        k: {
            keyword: "if then else elif fi for while in do done case esac function",
            literal: "true false",
            built_in: "break cd continue eval exec exit export getopts hash pwd readonly return shift test times trap umask unset alias bind builtin caller command declare echo enable help let local logout mapfile printf read readarray source type typeset ulimit unalias set shopt autoload bg bindkey bye cap chdir clone comparguments compcall compctl compdescribe compfiles compgroups compquote comptags comptry compvalues dirs disable disown echotc echoti emulate fc fg float functions getcap getln history integer jobs kill limit log noglob popd print pushd pushln rehash sched setcap setopt stat suspend ttyctl unfunction unhash unlimit unsetopt vared wait whence where which zcompile zformat zftp zle zmodload zparseopts zprof zpty zregexparse zsocket zstyle ztcp",
            operator: "-ne -eq -lt -gt -f -d -e -s -l -a"
        },
        c: [
            { cN: "shebang", b: /^#![^\n]+sh\s*$/, r: 10 },
            { cN: "function", b: /\w[\w\d_]*\s*\(\s*\)\s*\{/, rB: true, c: [hljs.inherit(hljs.TM, { b: /\w[\w\d_]*/ })], r: 0 },
            hljs.HCM,
            hljs.NM,
            s,
            a,
            t
        ]
    };
});

hljs.registerLanguage("javascript", function (r: any): Language {
    return {
        aliases: ["js"],
        k: {
            keyword: "in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",
            literal: "true false null undefined NaN Infinity",
            built_in: "eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"
        },
        c: [
            { cN: "pi", r: 10, v: [{ b: /^\s*('|")use strict('|")/ }, { b: /^\s*('|")use asm('|")/ }] },
            hljs.ASM,
            hljs.QSM,
            hljs.CLCM,
            hljs.CBCM,
            hljs.CNM,
            { b: "(" + hljs.RSR + "|\\b(case|return|throw)\\b)\\s*", k: "return throw case", c: [hljs.CLCM, hljs.CBCM, hljs.RM, { b: /</, e: />;/, r: 0, sL: "xml" }], r: 0 },
            { cN: "function", bK: "function", e: /\{/, eE: true, c: [hljs.inherit(hljs.TM, { b: /[A-Za-z$_][0-9A-Za-z$_]*/ }), { cN: "params", b: /\(/, e: /\)/, c: [hljs.CLCM, hljs.CBCM], i: /["'\(]/ }], i: /\[|%/ },
            { b: /\$[(.]/ },
            { b: "\\." + hljs.IR, r: 0 }
        ]
    };
});

hljs.registerLanguage("json", function (e: any): Language {
    const t = { literal: "true false null" };
    const i = [hljs.QSM, hljs.CNM];
    const l = { cN: "value", e: ",", eW: true, eE: true, c: i, k: t };
    const c = { b: "{", e: "}", c: [{ cN: "attribute", b: '\\s*"', e: '"\\s*:\\s*', eB: true, eE: true, c: [hljs.BE], i: "\\n", starts: l }], i: "\\S" };
    const n = { b: "\\[", e: "\\]", c: [hljs.inherit(l, { cN: null })], i: "\\S" };
    i.push(c, n);
    return { c: i, k: t, i: "\\S" };
});

hljs.registerLanguage("http", function (): Language {
    return {
        i: "\\S",
        c: [
            { cN: "status", b: "^HTTP/[0-9\\.]+", e: "$", c: [{ cN: "number", b: "\\b\\d{3}\\b" }] },
            { cN: "request", b: "^[A-Z]+ (.*?) HTTP/[0-9\\.]+$", rB: true, e: "$", c: [{ cN: "string", b: " ", e: " ", eB: true, eE: true }] },
            { cN: "attribute", b: "^\\w", e: ": ", eE: true, i: "\\n|\\s|=", starts: { cN: "string", e: "$" } },
            { b: "\\n\\n", starts: { sL: "", eW: true } }
        ]
    };
});

hljs.registerLanguage("css", function (e: any): Language {
    const c = "[a-zA-Z-][a-zA-Z0-9_-]*";
    const a = { cN: "function", b: c + "\\(", rB: true, eE: true, e: "\\(" };
    return {
        cI: true,
        i: "[=/|']",
        c: [
            hljs.CBCM,
            { cN: "id", b: "\\#[A-Za-z0-9_-]+" },
            { cN: "class", b: "\\.[A-Za-z0-9_-]+", r: 0 },
            { cN: "attr_selector", b: "\\[", e: "\\]", i: "$" },
            { cN: "pseudo", b: ":(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\\"\\']+" },
            { cN: "at_rule", b: "@(font-face|page)", l: "[a-z-]+", k: "font-face page" },
            { cN: "at_rule", b: "@", e: "[{;]", c: [{ cN: "keyword", b: /\S+/ }, { b: /\s/, eW: true, eE: true, r: 0, c: [a, hljs.ASM, hljs.QSM, hljs.CSSNM] }] },
            { cN: "tag", b: c, r: 0 },
            { cN: "rules", b: "{", e: "}", i: "[^\\s]", r: 0, c: [hljs.CBCM, { cN: "rule", b: "[^\\s]", rB: true, e: ";", eW: true, c: [{ cN: "attribute", b: "[A-Z\\_\\.\\-]+", e: ":", eE: true, i: "[^\\s]", starts: { cN: "value", eW: true, eE: true, c: [a, hljs.CSSNM, hljs.QSM, hljs.ASM, hljs.CBCM, { cN: "hexcolor", b: "#[0-9A-Fa-f]+" }, { cN: "important", b: "!important" }] } }] }] }
        ]
    };
});
