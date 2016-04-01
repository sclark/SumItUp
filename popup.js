function common_toks(xs, ys) {
  common = [];
  for (var i = 0; i < xs.length; i++) {
    if (ys.indexOf(xs[i]) > -1) {
      common.push(xs[i]);
    }
  }
  return common;
}

function max_index(xs) {
  i = -1
  v = 0
  for (var j = 0; j < xs.length; j++) {
    if (xs[j] >= v) {
      v = xs[j];
      i = j;
    }
  }
  return i;
}

function summarize(text) {
  sents = text.replace(/\n/g, ".").split(".");
  sents = sents.filter(function(e) {
    return e.trim() != "" && e.trim().indexOf(" ") > -1
  });

  rows = new Array(sents.length);

  for (var i = 0; i < sents.length; i++) {
    sum = 0;
    i_toks = sents[i].split(" ");
    for (var j = 0; j < sents.length; j++) {
      j_toks = sents[j].split(" ");
      if (i != j && i_toks.length > 0 && j_toks.length > 0) {
        sum = sum + common_toks(i_toks, j_toks).length / ((i_toks.length + j_toks.length) / 2);
      }
    }
    rows[i] = sum;
  }

  summ = [];

  while ((summ.join(". ") + ".").length < 500) {
    i = max_index(rows);
    summ.push(sents[i]);
    rows.splice(i, 1);
  }

  summ = summ.sort(function(x, y) {
    return sents.indexOf(x) - sents.indexOf(y);
  });
  return summ.join(". ") + ".";
}

var articles = [];

document.addEventListener('DOMContentLoaded', function() {

  /* trash button */
  document.getElementById('trash').addEventListener('click', function() {
    var title = document.getElementById('title').innerText;
    for (var i = 0; i < articles.length; i++) {
      if (articles[i].title == title) {
        articles.splice(i, 1);
      }
    }
    chrome.storage.local.set({'sumitup': articles}, renderArticles);
  });

  /* renderArticles from global var articles */
  function renderArticles() {
    var list = document.getElementById("list");
    while (list.firstChild) {
      list.removeChild(list.firstChild);
    }
    if (articles.length == 0) {
      articles.push({
        title: "No Summaries",
        summary: "Relaunch this extension on a news article to get a summary!"
      });
    }
    for (var i = 0; i < articles.length; i++) {
      var a = document.createElement('a');
      a.href = "#";
      a.setAttribute('data-title', articles[i].title);
      a.setAttribute('data-summary', articles[i].summary);
      a.onclick = function() {
        var as = document.body.getElementsByTagName("a");
        for (var i = 0; i < as.length; i++) {
          as[i].classList.remove('active');
        }
        this.classList.add('active');
        document.getElementById('content').innerText = this.getAttribute('data-summary');
        document.getElementById('title').innerText = this.getAttribute('data-title');
      };
      a.innerText = articles[i].title;
      if (i == articles.length - 1) {
        a.classList.add('active');
        document.getElementById('title').innerText = articles[i].title;
        document.getElementById('content').innerText = articles[i].summary;
      }
      document.getElementById('list').appendChild(a);
    }
  }

  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(tab.id, {action: "getDOM"}, function(response) {
      chrome.storage.local.get({'sumitup': []}, function(doc) {

        articles = doc.sumitup;
        if (response) {
          var updated = false;
          for (var i = 0; i < articles.length; i++) {
            if (articles[i].title == response.title) {
              articles[i].summary = summarize(response.text);
              updated = true;
            }
          }
          if (!response.title) response.title = "No Title";
          if (!updated) articles.push({title: response.title, summary: summarize(response.text)});
          chrome.storage.local.set({'sumitup': articles}, renderArticles);
        }
        else renderArticles();

      });
    });
  });

}, false);
