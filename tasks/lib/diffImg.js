// 差分キャプチャ取得用phantomJS script.

var fs = require('fs');
var system = require('system');
var indexPath = system.args[1];
var settings = fs.read(indexPath + 'options.json');
var page = require('webpage').create();

if (settings !== '{}') {
  try {
    system.stderr.writeLine('Read settings: ' + settings);
    page.settings = JSON.parse(settings);
  }
  catch (err) {
    console.warn('CONSOLE: Error parsing settings | ' + err);
    phantom.exit(1);
  }
}

var picture = system.args[2];
var split = picture.split('-');
var width = +split[1];

// server
var server = require('webserver').create();
server.listen(99124, function (req, res) {
  res.statusCode = 200;
  if (url === 'current.img') {
    res.write(fs.read(indexPath + 'img/current' + picture) + '.png');
  }
  else if (url === 'last.img') {
    res.write(fs.read(indexPath + 'img/last' + picture) + '.png');
  }
  else {
    res.write('<html><body><img id="current" src="current.img"><canvas id="diff"></canvas><img id="last" src="last.img"></body></html>');
  }

  res.close();
});

// webpage
page.onError = function (msg) {
  system.stderr.writeLine('ERROR:' + msg);
};

page.onConsoleMessage = function (msg, lineNum, sourceId) {
  system.stderr.writeLine('CONSOLE: ' + msg, lineNum, sourceId);
};
page.viewportSize = {
  height: 1000,
  width: width
};

page.open('127.0.0.1:99124', function (status) {
  window.setTimeout(function () {

    // diffレンダリング
    page.evaluate(function () {
      var currentImg = document.querySelector('#current');
      var lastImg = document.querySelector('#last');
      var canvas = document.querySelector('canvas');

      canvas.width = currentImg.width;
      canvas.height = currentImg.height;

      var ctx = canvas.getContext('2d');

      ctx.drawImage(currentImg, 0, 0);
      var pxlsCur = ctx.getImageData(0, 0, currentImg.width, currentImg.height);

      ctx.globalAlpha = 0.5;

      ctx.drawImage(lastImg, 0, 0);
      var pxlsLast = ctx.getImageData(0, 0, lastImg.width, lastImg.height);

      var pxlsDiff = pxlsCur;
      var diffAmount = 0;
      var adjustment = 150;

      // TODO settingsの反映をどうするか
      var threshold = 10;
      var color = {red: 250, green: 0, blue: 0};
      var filter = 'grayscale';

      for (var i = 0, len = pxlsCur.data.length; i < len; i += 4) {
        if (Math.abs(pxlsCur.data[i] - pxlsLast.data[i]) > threshold ||
            Math.abs(pxlsCur.data[i + 1] - pxlsLast.data[i + 1]) > threshold ||
            Math.abs(pxlsCur.data[i + 2] - pxlsLast.data[i + 2]) > threshold) {

          pxlsDiff.data[i] = color.red;
          pxlsDiff.data[i + 1] = color.green;
          pxlsDiff.data[i + 2] = color.blue;
          diffAmount++;
        }
        else {
          if (filter === 'brighter') {
            pxlsDiff.data[i] += adjustment;
            pxlsDiff.data[i + 1] += adjustment;
            pxlsDiff.data[i + 2] += adjustment;
          }
          else if (filter === 'darker') {
            pxlsDiff.data[i] -= adjustment;
            pxlsDiff.data[i + 1] -= adjustment;
            pxlsDiff.data[i + 2] -= adjustment;
          }
          else if (filter === 'grayscale') {
            var y = 0.2126 * pxlsDiff.data[i] +
                0.7152 * pxlsDiff.data[i + 1] +
                0.0722 * pxlsDiff.data[i + 2];

            pxlsDiff.data[i] = pxlsDiff.data[i + 1] = pxlsDiff[i + 2] = y;
          }
        }
      }

      ctx.putImageData(pxlsDiff, 0, 0);

      lastImg.style.display = 'none';
      currentImg.style.display = 'none';
    });

    page.render(indexPath + 'img/diff/' + picture + '.png');
    phantom.exit(0);

  }, 1000);
});
