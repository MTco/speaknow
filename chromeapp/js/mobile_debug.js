(function() {
// if running in a mobile instance
if (!chrome || !chrome.runtime || !chrome.runtime.getPlatformInfo) {
  loadMobileTestLib();
} else {
  chrome.runtime.getPlatformInfo(function(info) {
    if (!info || info.os=='android' || info.os=='ios') {
      loadMobileTestLib();
    }
  });
}

function loadMobileTestLib() {
  var s = document.createElement('script');
  s.src = 'http://192.168.1.126:8080/target/target-script-min.js';
  document.body.appendChild(s);
}

})();

