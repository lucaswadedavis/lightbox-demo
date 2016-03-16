(function(){

  var uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }); 
  };

  var get = function (url, callback) {
    var oReq = new XMLHttpRequest();
    var images;
    oReq.onload = callback; 
    oReq.open('GET', url, true);
    oReq.responseType = 'json';
    oReq.send();    
  };

  var getWidth = function (node) {
    return parseInt(window.getComputedStyle(node).width, 10);
  };

  var sample = function (arrayOrString) {
    return arrayOrString[Math.floor(Math.random() * arrayOrString.length)];
  };

  var fakeTitle = function () {
    var consonants = 'bcdfghjklmnpqrstvwxyz';
    var vowels = 'aeiou';
    var patterns = 'CVC VC CV CVVCV CVCV VCVVC CVCCVC';
    
    var n = 1 + Math.floor(Math.random() * 3);
    var words = [];
    for (var i = 0; i < n; i++) {
      words.push(sample(patterns.split(' ')));
    }

    return words.join(' ').replace(/[CV]/g, function(x) {
      var c = sample(consonants);
      var v = sample(vowels);
      return x === 'C' ? c : v;
    });
  };

  var creds = {
    appID: '1541c5a2-b78d-48d0-9b41-1be7072d7c1b',
    jsKey: '6b0ef299-e3ce-479e-bc1d-e1b62df2c5ba'
  };

  // convienient aliases
  var el = function (tag) {
    var el = document.createElement(tag || 'div');
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        el.classList.add(arguments[i]);
      }
    }
    return el;
  };

  var remove = function () {
    if (!arguments.length) return;
    for (var i = 0; i < arguments.length; i++) {
      var node = arguments[i];
      node.parentNode.removeChild(node);
    }
  };
  //
  var app = {images:[], v: {}, t: {}};

  app.getBase64Images = function (pixelsWide) {
    var url = 'http://104.131.154.14:3000/' + pixelsWide || 500;

    var callback = function (e) {
      var images = e.target.response.base64Images; 
      for (var i = 0; i < images.length; i++) {
        app.addBase64Image(images[i]);
      }
    };

    get(url, callback);
  };

  app.addBase64Image = function (base64Image) {
    var id = uuid();
    var title = fakeTitle();
    app.images.push({base64Image: base64Image, id: id, title: title});
    var image = app.t.image(base64Image);
    image.addEventListener('click', function (el) {
      app.v.lightbox(app.t.image(base64Image, id), title);
    });

    app.render(
      document.getElementsByClassName('image-cell-section')[0],
      app.t.imageCell(image, title)
    );
  };

  app.render = function (target, node) {
    target.appendChild(node);
  };

  app.init = function () { 
    app.v.layout();
    app.getBase64Images();
    app.getBase64Images();
    app.getBase64Images();
  };

  app.v.layout = function () {
    app.render(document.body, app.t.header());
    app.render(document.body, app.t.imageCellSection());
  };

  app.t.imageCell = function (imageNode, imageTitle) {
    var cell = el('div', 'image-cell');
    cell.appendChild(imageNode);

    var title = el('p', 'image-title');
    title.textContent = imageTitle || 'Lightbox Demo Title';
    cell.appendChild(title);
    return cell;
  };

  app.t.header = function () {
    var h = el('div', 'header');
    h.textContent = 'Lightbox Demo';
    var plus = el('span', 'header-plus');
    plus.textContent = '+';
    plus.addEventListener('click', function () {
      app.getBase64Images();
    });
    h.appendChild(plus);
    return h;
  };

  app.t.imageCellSection = function () {
    return el('div', 'image-cell-section');
  };

  app.t.image = function (url, id) {
    var img = el('img');
    img.setAttribute('id', id);
    img.setAttribute('src', url);
    return img;
  };

  app.v.lightbox = function (imageNode, imageTitle, imageCollection) {
    if (!imageCollection) imageCollection = app.images;
        
    window.addEventListener('keydown', navigateOnKeyDown);

    var shadowbox = el('div', 'shadowbox');
    shadowbox.addEventListener('click', closeLightbox);
    
    var lightbox = el('div', 'lightbox');
    
    var backButton = el('div', 'lightbox-back-button');
    backButton.textContent = '<';
    backButton.addEventListener('click', regress);

    var forwardButton = el('div', 'lightbox-forward-button');
    forwardButton.textContent = '>';
    forwardButton.addEventListener('click', progress);

    var title = el('p');
    title.textContent = imageTitle || 'Lightbox Demo Title';

    var close = el('div', 'lightbox-close');
    close.textContent = 'X';
    close.addEventListener('click', closeLightbox);
    
    lightbox.appendChild(close);
    lightbox.appendChild(imageNode);
    lightbox.appendChild(title);

    app.render(document.body, shadowbox);
    app.render(document.body, backButton);
    app.render(document.body, forwardButton);
    app.render(document.body, lightbox);
  
    position();
    window.onresize = position;

    function position () {
      var lightboxWidth = parseInt(window.getComputedStyle(lightbox).width, 10);
      var windowWidth = parseInt(window.getComputedStyle(document.body).width, 10);
      var backButtonWidth = parseInt(window.getComputedStyle(backButton).width, 10);
      var forwardButtonWidth = getWidth(forwardButton);
      var margin = 20;

      var lightboxLeft = (windowWidth - lightboxWidth) / 2;
      lightbox.style.left = lightboxLeft;
      backButton.style.left = lightboxLeft - backButtonWidth - 3 * margin;
      forwardButton.style.left = lightboxLeft + lightboxWidth + margin;
    };

    function navigateOnKeyDown (ev) {
      var keys = {rightArrow: 39, leftArrow: 37};
      if (ev.which === keys.rightArrow) {
        progress();
      } else if (ev.which === keys.leftArrow) {
        regress();
      }
    };
    
    function progress  () {
      for (var i = 0; i < imageCollection.length; i++) {
        if (imageNode.id === imageCollection[i].id && i < imageCollection.length - 1) {
            closeLightbox();
            var image = imageCollection[i + 1];
            app.v.lightbox(app.t.image(image.base64Image, image.id), image.title, imageCollection);
            return;
        }
      }

      closeLightbox();
    };

    function regress () {
      for (var i = 0; i < imageCollection.length; i++) {
        if (imageNode.id === imageCollection[i].id && i > 0) {
            closeLightbox();
            var image = imageCollection[i - 1];
            app.v.lightbox(app.t.image(image.base64Image, image.id), image.title, imageCollection);
            return;
        }
      }

      closeLightbox();
    };

    function closeLightbox () {
      window.removeEventListener('keydown', navigateOnKeyDown);
      remove(lightbox, backButton, forwardButton, shadowbox);
    };
  };

  window.app = app;

})()
