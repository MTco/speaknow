  // steady stream of sentences:
  // - show sentence
  // - wait for pronounciation
  // - check for errors
  // - if ok, continue
  // - if errors, mark wrong words and accept clicks on wrong parts
  // - when click in wrong words, TTS them

function TellMe($scope) {
  var ignore_onend = false;
  var start_timestamp;
  var final_transcript = null;
  var currentSentence = 0;
  var maxSentenceIndex = sentenceList.length-1;

  $scope.info = 'Speak now';
  $scope.recognizing = false;
  $scope.model = {
    expected: convertSentenceToArray(sentenceList[currentSentence]),
    recognized: []
  };
  $scope.score = 0;
  $scope.wordsDetected = 0;
  $scope.correctWords = 0;

  if (window.NativeSpeechRecognition) {
    $scope.recognition = NativeSpeechRecognition;
    $scope.recognition.init();
  } else {
    $scope.recognition = new webkitSpeechRecognition();
  }
  $scope.recognition.continuous = true;
  $scope.recognition.interimResults = true;

  var first_char = /\S/;
  function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
  }
  var two_line = /\n\n/g;
  var one_line = /\n/g;
  function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');

  }

  function convertSentenceToArray(sentence) {
    var result = [];
    sentence.split(' ').forEach(function(w) {
      result.push({word: w, state: 'unknown'});
    });
    return result;
  }


  $scope.recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      start_img.src = 'mic.gif';
      $scope.info='info_no_speech';
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      start_img.src = 'mic.gif';
      $scope.info='info_no_microphone';
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        $scope.info='info_blocked';
      } else {
        $scope.info='info_denied';
      }
      ignore_onend = true;
    }
  };


  $scope.recognition.onend = function(event) {
    $scope.recognizing = false;
    if (ignore_onend) {
      return;
    }
    $scope.info = '';
  };

  $scope.recognition.onresult = function(event) {
    var transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        transcript += event.results[i][0].transcript;
      } else {
        transcript += event.results[i][0].transcript;
      }
    }
    var sentence = linebreak(capitalize(transcript));
    $scope.setRecognizedSentence(sentence);
    console.log("got "+sentence+' transcript='+transcript, event);
  };

  $scope.setRecognizedSentence = function(sentence) {
    $scope.$apply(function(scope) {
      sentence = sentence.replace(/[^a-zA-Z0-9]/g, ' ');
      sentence = sentence.replace(/^ +/, '');
      sentence = sentence.replace(/ +$/, '');

      var wordsCorrect = 0;
      var tempSentence = sentence.split(/ +/);
      for (var i=0; i<scope.model.expected.length; i++) {
        if (i >= tempSentence.length) break;
        if (scope.model.expected[i].word == tempSentence[i]) {
          scope.model.expected[i].state = "correct";
          wordsCorrect++;
        }
        else 
          scope.model.expected[i].state = "wrong";
      }
      scope.model.recognized = tempSentence;
      scope.wordsDetected = tempSentence.length;
      scope.correctWords = wordsCorrect;

      // update the score 
      scope.score = (wordsCorrect/scope.model.expected.length) * 100.0;
    });
  }

  $scope.start = function() {
    if ($scope.recognizing) {
      $scope.recognition.stop();
      $scope.recognizing = false;
      return;
    }
    $scope.model.expected = convertSentenceToArray(sentenceList[currentSentence]);
    final_transcript = '';
    $scope.recognition.lang = 'en_US';
    $scope.recognition.start();
    ignore_onend = false;

    $scope.model.recognized = [];
    $scope.info = 'info_allow';
    start_timestamp = Date.now();
  }

  $scope.next = function() {
    currentSentence++;
    if (currentSentence > maxSentenceIndex)
      currentSentence = 0;
    $scope.model.expected = convertSentenceToArray(sentenceList[currentSentence]);    
    $scope.model.recognized = [];
    $scope.score = 0;
    $scope.wordsDetected = 0;
    $scope.correctWords = 0;
  }
}
