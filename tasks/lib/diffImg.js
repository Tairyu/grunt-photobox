// 差分キャプチャ取得用phantomJS script.

var fs = require('fs');
var system = require('system');
var indexPath = system.args[2];
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

var picture = system.args[1];
var split = picture.split('#');
var imgName = split[0];
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
      var pixelsCur = ctx.getImageData(0, 0, currentImg.width, currentImg.height);

      ctx.globalAlpha = 0.5;

      ctx.drawImage(lastImg, 0, 0);
      var pixelsLast = ctx.getImageData(0, 0, lastImg.width, lastImg.height);

      var pixelsDiff = pixelsCur;
      var diffAmount = 0;
      var adjustment = 150;

      // TODO settingsの反映をどうするか
      var threshold = 10;
      var color = {red: 250, green: 0, blue: 0};
      var filter = 'grayscale';

      for (var i = 0, len = pixelsCur.data.length; i < len; i += 4) {
        if (Math.abs(pixelsCur.data[i] - pixelsLast.data[i]) > threshold ||
            Math.abs(pixelsCur.data[i + 1] - pixelsLast.data[i + 1]) > threshold ||
            Math.abs(pixelsCur.data[i + 2] - pixelsLast.data[i + 2]) > threshold) {

          pixelsDiff.data[i] = color.red;
          pixelsDiff.data[i + 1] = color.green;
          pixelsDiff.data[i + 2] = color.blue;
          diffAmount++;
        }
        else {
          if (filter === 'brighter') {
            pixelsDiff.data[i] += adjustment;
            pixelsDiff.data[i + 1] += adjustment;
            pixelsDiff.data[i + 2] += adjustment;
          }
          else if (filter === 'darker') {
            pixelsDiff.data[i] -= adjustment;
            pixelsDiff.data[i + 1] -= adjustment;
            pixelsDiff.data[i + 2] -= adjustment;
          }
          else if (filter === 'grayscale') {
            var y = 0.2126 * pixelsDiff.data[i] +
                0.7152 * pixelsDiff.data[i + 1] +
                0.0722 * pixelsDiff.data[i + 2];

            pixelsDiff.data[i] = pixelsDiff.data[i + 1] = pixelsDiff[i + 2] = y;
          }
        }
      }

      ctx.putImageData(pixelsDiff, 0, 0);

      lastImg.style.display = 'none';
      currentImg.style.display = 'none';
    });

    page.render(indexPath + 'img/diff/' + picture + '.png');
    phantom.exit(0);

  }, 1000);
});
