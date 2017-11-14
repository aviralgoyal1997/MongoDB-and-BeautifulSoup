
$(document).ready(function () {
    $("a").each(function () {
        var $a = $(this);
        var href = this.href; 
        var host = window.location.host.replace(/^(([^\/]+?\.)*)([^\.]{4,})((\.[a-z]{1,4})*)$/, '$3$4');
        var replaceHost = '/^https?\:\/\/(www.)' + host + '\.com\//i';
        if (this.href != null && !$a.is(".exempt")) {
            if ((this.href.match(/^http/)) && (!this.href.match(host)) && (!this.href.match(/^javascript/))) {
                $a.attr('onclick', 'javascript: pageTracker._trackPageview("/outgoing/' + ReplaceURLPrefixes(href) + '")');
            }
        }
    });
});

function ReplaceURLPrefixes(string) {
    var text = string.toLowerCase();
    text = text.replace('http://', '');
    text = text.replace('https://', '');
    return text;
}