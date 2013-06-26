(function() {
// if running in a mobile instance
if (!chrome || !chrome.runtime || !chrome.runtime.getPlatformInfo) {
  if (navigator.userAgent.match(/(android|ipod|ipad|iphone)/i)) {
    loadMobileTestLib();
  }
} else {
  chrome.runtime.getPlatformInfo(function(info) {
    if (!info || info.os=='android' || info.os=='ios') {
      loadMobileTestLib();
    }
  });
}

function loadMobileTestLib() {
  return;
  window.addEventListener('DOMContentLoaded', function() {
    var s = document.createElement('script');
    s.src = "http://debug.phonegap.com/target/target-script-min.js#__speaknow";
    document.body.appendChild(s);
  });
}

})();

