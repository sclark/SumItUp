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
