  // steady stream of sentences:
  // - show sentence
  // - wait for pronounciation
  // - check for errors
  // - if ok, continue
  // - if errors, mark wrong words and accept clicks on wrong parts
  // - when click in wrong words, TTS them

function TellMe($scope) {

  document.querySelector('.ptt').addEventListener('touchstart', function() { return true; });

  $scope.state = 'idle';
  $scope.talkOrRetry = 'talk';
  $scope.resultGaugeStyle = {
    "background": "gray"
  };
  $scope.model = {
    expected: [],
    recognized: [],
    history: {
      currentSentence: 0,
      commonMistakes: [],
      correctWords: 0,
      totalWords: 0,
      percent: ''
    }
  };
  $scope.recognizing = false;
  
  $scope.init = function() {
    $scope.updateSentence();

    if (window.NativeSpeechRecognition) {
      $scope.recognition = NativeSpeechRecognition;
      $scope.recognition.init();
    } else {
      $scope.recognition = new webkitSpeechRecognition();
    }
    if (chrome && chrome.tts && chrome.tts.startup) {
      chrome.tts.startup();
      chrome.tts.speed(50);
    }
    $scope.recognition.continuous = true;
    $scope.recognition.interimResults = true;
    $scope.recognition.onerror = $scope.onerror;
    $scope.recognition.onend = $scope.onend;
    $scope.recognition.onresult = $scope.onresult;

  }

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

  $scope.getPercent = function() {
  }

  $scope.onerror = function(event) {
    $scope.$apply(function(scope) {
      console.log("on error", event);
      scope.state = 'error';
      scope.error = event.error;
    });
  };


  $scope.onend = function(event) {
    $scope.$apply(function(scope) {
      console.log("on end", event);
      scope.recognizing = false;
      scope.updateScore(scope);
      scope.state = 'idle';
      scope.talkOrRetry = 'retry';
    });
  };

  $scope.onresult = function(event) {
    var transcript = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    var sentence = linebreak(capitalize(transcript));
    $scope.setRecognizedSentence(sentence);
    console.log("got ["+sentence+'] sentence, transcript=['+transcript+']', event);
  };

  $scope.updateScore = function(scope) {
    if (scope.model.recognized.length==0) {
      return;
    }
    var wordsCorrect=0;
    scope.model.expected.forEach(function(m, i) {
      if (scope.model.recognized.length>i && scope.model.recognized[i] == m.word) {
        wordsCorrect++;
      }
    });
    scope.model.history.correctWords += wordsCorrect
    scope.model.history.totalWords += scope.model.expected.length;
    var wrong = scope.model.history.totalWords-scope.model.history.correctWords;
    scope.model.history.percent='('+(scope.model.history.correctWords/scope.model.history.totalWords*100)+'%)';
    var percentWrong = (wrong/scope.model.history.totalWords*100).toFixed();
    console.log("percentWrong="+percentWrong);
    scope.resultGaugeStyle = {
        "background": "-webkit-gradient("+
        "linear, left top, right top, "+
        "color-stop(0%,#ff3232), color-stop("+percentWrong+"%,#ff3030), "+
        "color-stop("+percentWrong+"%,rgba(29, 146, 0, 1)), "+
        "color-stop(100%,rgba(29, 146, 0, 1)))"
    };
  }

  $scope.setRecognizedSentence = function(sentence) {
    $scope.$apply(function(scope) {
      sentence = sentence.replace(/[^a-zA-Z0-9']/g, ' ');
      sentence = sentence.replace(/^ +/, '');
      sentence = sentence.replace(/ +$/, '');

      scope.model.recognized = sentence.split(/ +/);
      var isAllCorrect = true;
      scope.model.expected.forEach(function(m, i) {
        if (scope.model.recognized.length>i && scope.model.recognized[i] == m.word) {
	  m.state = 'correct';
        } else {
	  m.state = 'wrong';
          isAllCorrect = false;
	}
      });
      if (isAllCorrect) {
        scope.recognition.stop();
      }
    });
  }

  $scope.simulate = function() {
    window.setTimeout(function() {
      var transcript = 'This is the fast app I have ever seen';
      var sentence = linebreak(capitalize(transcript));
      $scope.setRecognizedSentence(sentence);
      console.log("got "+sentence+' transcript='+transcript, event);
    }, 0);
  }

  $scope.reset = function() {
    $scope.recognition.stop();
    $scope.recognizing = false;
    $scope.state = 'idle';
  }

  $scope.start = function() {
    $scope.updateSentence();
    if ($scope.recognizing) {
      $scope.reset();
    } else {
      $scope.state = 'speaking';
      $scope.recognition.lang = 'en_US';
      $scope.recognizing = true;
      $scope.recognition.start();
    }
  }

  $scope.play = function() {
    var sentence='';
    $scope.model.expected.forEach(function(m) {
      sentence += m.word+' ';
    });
    chrome.tts.getVoices(function(voices) {
      var options = {};
      if (voices) {
        voices.forEach(function(v) {
	   console.log("testing voice "+v.voiceName);
	   if (v.lang=='en-US' && /lois/i.test(v.voiceName)) {
	     options = { voiceName: v.voiceName };
	     console.log("using voice "+v.voiceName);
	   }
	});
      }
      chrome.tts.speak(sentence, options);
    });
  }

  $scope.next = function() {
    $scope.reset();
    $scope.model.history.currentSentence++;
    if ($scope.model.history.currentSentence >= sentenceList.length) {
      $scope.model.history.currentSentence = 0;
    }
    $scope.talkOrRetry = 'talk';
    $scope.updateSentence();
  }

  $scope.updateSentence = function() {
    $scope.model.expected = convertSentenceToArray(
      sentenceList[$scope.model.history.currentSentence]);
    $scope.model.recognized = [];
  }

  $scope.init();

}
