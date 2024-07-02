// Returns a random number between min and max (inclusive)
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// BEGIN GOOGLE ANALYTICS
(function(i: any, s: any, o: any, g: any, r: any, a?: any, m?: any) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function() {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-86578-20', 'papaparse.com');
ga('send', 'pageview');
// END GOOGLE ANALYTICS
