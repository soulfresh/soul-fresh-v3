export function browserDetect() {
  // Opera 8.0+
  var isOpera =
    (!!window.opr && !!opr.addons) ||
    !!window.opera ||
    navigator.userAgent.indexOf(" OPR/") >= 0;

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== "undefined";

  // Safari 3.0+ "[object HTMLElementConstructor]"
  var isSafari =
    /constructor/i.test(window.HTMLElement) ||
    (function (p) {
      return p.toString() === "[object SafariRemoteNotification]";
    })(
      !window["safari"] ||
        (typeof safari !== "undefined" && safari.pushNotification),
    );

  // Internet Explorer 6-11
  var isIE = /*@cc_on!@*/ false || !!document.documentMode;

  // Edge 20+
  var isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1 - 71
  var isChrome =
    !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

  // Blink engine detection
  var isBlink = (isChrome || isOpera) && !!window.CSS;

  return {
    opera: isOpera,
    firefox: isFirefox,
    safari: isSafari,
    ie: isIE,
    edge: isEdge,
    chrome: isChrome,
    blink: isBlink,
    which: () => {
      if (isChrome) {
        return "chrome";
      } else if (isFirefox) {
        return "firefox";
      } else if (isIE) {
        return "ie";
      } else if (isEdge) {
        return "edge";
      } else if (isSafari) {
        return "safari";
      } else if (isOpera) {
        return "opera";
      } else if (isBlink) {
        return "blink";
      } else {
        return "";
      }
    },
  };
}
