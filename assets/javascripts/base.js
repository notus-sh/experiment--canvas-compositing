;(function () {
  var layersSet = ['primary', 'secondary'];
  var selectsSet = {};
  var imagesSet = {};
  var colorsSet = {};

  var canvas = document.getElementById('canvas');
  var w = canvas.width;
  var h = canvas.height;
  var c = canvas.getContext('2d');

  layersSet.forEach(function (layer, i) {
    colorsSet[layer] = (i % 2 == 0) ? '#ffffff' : '#000000';

    var l = layer;
    var img = new Image(w, h);
    img.onload = function () {
      imagesSet[l] = img;

      if (Object.keys(imagesSet).length == layersSet.length) {
        bindUI();
        draw();
      }
    };

    img.src = canvas.getAttribute('data-' + layer + '-image');
  });

  function bindUI () {
    layersSet.forEach(function (layer, i) {
      selectsSet[layer] = document.getElementById(layer + '_color');
      selectsSet[layer].addEventListener('change', function (e) {
        colorsSet[layer] = e.target.value;
        draw();
      });
    });
  }

  function draw () {
    c.clearRect(0, 0, w, h);
    layersSet.forEach(function (layer, i) {
      drawLayer(imagesSet[layer], colorsSet[layer]);
    });
  }

  function drawLayer(image, color) {
    var layer = createLayer();
    layer.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, w, h);

    // Convert image to grayscale
    var map = layer.getImageData(0, 0, w, h);
    var data = map.data;

    var r, g, b;
    for(var p = 0, len = data.length; p < len; p += 4) {
        r = data[p]
        g = data[p + 1];
        b = data[p + 2];

        data[p] = data[p + 1] = data[p + 2] = Math.floor((r + g + b) / 3);
    }
    layer.putImageData(map, 0, 0);

    // overlay filled rectangle using lighter composition
    layer.globalCompositeOperation = "multiply";
    layer.fillStyle = color;
    layer.fillRect(0, 0, w, h);

    // Crop to shape
    layer.globalCompositeOperation = 'destination-in';
    layer.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, w, h);

    // Copy composed image to main canvas
    c.drawImage(layer.canvas, 0, 0, w, h);
  }

  function createLayer() {
    var vCanvas = document.createElement('canvas');
    vCanvas.width = w;
    vCanvas.height = h;
    return vCanvas.getContext('2d');
  }
})();
