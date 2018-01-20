var notAllowed = ['is', 'isn%27t', 'be', 'being', 'been', 'am', 'are', 'aren%27t', 'was', 'wasn%27t', 'were', 'weren%27t', 'I%27m', 'you%27re', 'we%27re', 'they%27re', 'he%27s', 'she%27s', 'it%27s', 'there%27s', 'here%27s', 'where%27s', 'what%27s', 'who%27s', 'that%27s', 'ain%27t', 'whatcha', 'hain%27t', 'yer'];

var ignore = ['style', 'script', 'code', 'canvas'];
var pElm;

function textNodesUnder(elm){
  var n;
  var a = [];
  var walk = document.createTreeWalker(elm, NodeFilter.SHOW_TEXT, null, false);

  while(n = walk.nextNode()) {
    a.push(n);
  }
  return a;
}

function clean(word) {
  return word.replace('’', '\'')
          .replace(/^'*(.*?)'*$/,'$1')
          .replace('_', '');
}

function replaceMarkers(elm) {
  if (elm) {
    elm.innerHTML = elm.innerHTML.replace(/##@(.*?)@##/g, '<span class="misspelled">$1</span>');
  }
}

function toggleSpellCheck() {
  document.body.classList.toggle('ext-spell-check');
}

chrome.runtime.onMessage.addListener(function(message, sender) {
  if (message.command === 'toggle-spell-check') {
    toggleSpellCheck();
  }
});

textNodesUnder(document.body).forEach(function(n) {
  var text = n.nodeValue;
  var words = text.match(/[’'\w]+/g);
  var elm = n.parentElement;
  var elmName = elm.tagName;
  var unmarked;

  if (!words || ignore.indexOf(elmName)) { return; }

  words.forEach(function(word) {
    if ( !notAllowed.indexOf(clean(word)) && !/^\d+$/.test(word)) {
      unmarked = new RegExp('\\b' + word + '(?!@##)\\b', 'g');
      text = text.replace(unmarked, '##@$&@##');
    }
  });

  n.nodeValue = text;

  if (!pElm) {
    pElm = elm;
  } else if (!pElm.contains(elm)) {
    replaceMarkers(pElm);
    pElm = elm;
  }
});

replaceMarkers(pElm);
document.body.classList.add('ext-spell-check');
