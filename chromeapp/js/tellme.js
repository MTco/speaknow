
// steady stream of sentences:
  // - show sentence
  // - wait for pronounciation
  // - check for errors
  // - if ok, continue
  // - if errors, mark wrong words and accept clicks on wrong parts
  // - when click in wrong words, TTS them

//

function TellMe($scope) {
  $scope.info = 'Are you ready?';
  $scope.recognizing = false;
  $scope.model = {
    expected: convertSentenceToArray('This is the best app I have ever seen'),
    recognized: []
  };

  var ignore_onend = false;
  var start_timestamp;
  var final_transcript = null;

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
      words = sentence.split(/ +/);
      scope.model.expected.forEach(function(m, i) {
        if (words.length>i && words[i] == m.word) {
	  m.state = 'correct';
	} else {
	  m.state = 'wrong';
	}
      });

      scope.model.recognized = words;
    });
  }

  $scope.simulate = function() {
    window.setTimeout(function() {
      var transcript = 'This is the fast app I have ever seen';
      var sentence = linebreak(capitalize(transcript));
      $scope.setRecognizedSentence(sentence);
      console.log("got "+sentence+' transcript='+transcript, event);
      $scope.recognizing = false;
      $scope.info = '';
    }, 0);
  }

  $scope.start = function() {
    if ($scope.recognizing) {
      $scope.recognition.stop();
      $scope.recognizing = false;
      return;
    }
    final_transcript = '';
    $scope.recognition.lang = 'en_US';
    $scope.recognition.start();
    ignore_onend = false;

    $scope.model.recognized = [];
    $scope.info = 'Speak now';
    start_timestamp = Date.now();
  }


}
