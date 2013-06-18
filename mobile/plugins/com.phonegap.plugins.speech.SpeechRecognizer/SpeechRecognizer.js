/**
 *  SpeechRecognizer.js
 *  Speech Recognizer cordova plugin (Android)
 *
 *  @author Renato Mangini
 *  Based on generic SpeechRecognizer plugin by Colin Turner
 *
 *  MIT Licensed
 */

var exec = cordova.require('cordova/exec');

exports.init = function() {
  this.continuous = true;
  this.interimResults = true;
  this.onerror = null;
  this.onend = null;
  this.onresult = null;
  this.lang = 'en_US';
  exec(null, null, "SpeechRecognizer", "init", []);
}
/**
 * c'tor
 */
//NativeSpeechRecognition.prototype.init = function() {
//}

exports.internalonresult = function(resultStr) {
  if (!exports.onresult) return;
  var matches = JSON.parse(resultStr);
  var converted = {resultIndex: 0, results: []};
  if (matches && matches["speechMatches"] && matches["speechMatches"]["speechMatch"]) {
    converted.results.push( {isFinal: true, 0: {transcript: matches["speechMatches"]["speechMatch"][0]} } );
  }
  exports.onresult(converted);
}
 
/**
 * Recognize speech and return a list of matches
 *
 * @param successCallback
 * @param errorCallback
 * @param reqCode User-defined integer request code which will be returned when recognition is complete
 * @param maxMatches The maximum number of matches to return. 0 means the service decides how many to return.
 * @param promptString An optional string to prompt the user during recognition
 */
exports.start = function() {
    return exec(exports.internalonresult, exports.onerror, "SpeechRecognizer", "startRecognize", []);
};

exports.stop = function() {
};

/**
 * Get the list of the supported languages in IETF BCP 47 format
 * 
 * @param successCallback
 * @param errorCallback
 *
 * Returns an array of codes in the success callback
 */
exports.getSupportedLanguages = function(successCallback, errorCallback) {
    return exec(successCallback, errorCallback, "SpeechRecognizer", "getSupportedLanguages", []);
};
