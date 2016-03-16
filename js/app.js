(function(){

  var creds = {
    appID: '1541c5a2-b78d-48d0-9b41-1be7072d7c1b',
    jsKey: '6b0ef299-e3ce-479e-bc1d-e1b62df2c5ba'
  };

  var app = {images:[], v: {}, t: {}};

  app.getImages = function (pixelsWide) {
    var url = 'http://104.131.154.14:3000/' + (pixelsWide || 500);
    
    var callback = function (e) {
      var images = e.target.response.images; 
      for (var i = 0; i < images.length; i++) {
        var image = new Image(images[i]);
        app.images.push(image);
        app.v.addImage(image);
      }
    };

    get(url, callback);
  };

  app.v.addImage = function (image) {
    var imageNode = app.t.image(image.src);
    imageNode.addEventListener('click', function () {
      app.v.lightbox(app.t.image(image.src, image.id), image.title);
    });

    append(
      document.getElementsByClassName('image-cell-section')[0],
      app.t.imageCell(imageNode, image.title)
    );
  };

  app.init = function () { 
    app.v.layout();
    app.getImages();
    app.getImages();
    app.getImages();
  };

  app.v.layout = function () {
    append(document.body, app.t.header(), app.t.imageCellSection());
  };

  app.t.imageCell = function (imageNode, imageTitle) {
    var cell = el('div', 'image-cell');
    cell.appendChild(imageNode);

    var title = el('p', 'image-title');
    title.textContent = imageTitle || 'Lightbox Demo Title';
    cell.appendChild(title);
    return cell;
  };

  app.t.getImageButton = function () {
    var button = el('span', 'header-plus');
    button.textContent = '+';
    button.addEventListener('click', app.getImages);
    return button;
  };

  app.t.header = function () {
    var header = el('div', 'header');
    header.textContent = 'Lightbox Demo';
    header.appendChild(app.t.getImageButton());
    return header;
  };

  app.t.imageCellSection = function () {
    return el('div', 'image-cell-section');
  };

  app.t.image = function (src, id) {
    var img = el('img');
    img.setAttribute('id', id);
    img.setAttribute('src', src);
    return img;
  };

  app.t.lightboxElement = function(className, textContent, callback) {
    var button = el('div', className);
    button.textContent = textContent;
    button.addEventListener('click', callback);
    return button;
  };

  app.t.lightboxTitle = function (imageTitle) {
    var title = el('p');
    title.textContent = imageTitle || 'Lightbox Demo Title';
    return title;
  };

  app.v.lightbox = function (imageNode, imageTitle, imageCollection) {
    if (!imageCollection) imageCollection = app.images;
        
    window.addEventListener('keydown', navigateOnKeyDown);

    var shadowbox = app.t.lightboxElement('shadowbox', '', closeLightbox); 
    var lightbox = el('div', 'lightbox');
    
    var backButton = app.t.lightboxElement('lightbox-back-button', '<', regress);
    var forwardButton = app.t.lightboxElement('lightbox-forward-button', '>', progress);
    var title = app.t.lightboxTitle(imageTitle);
    var close = app.t.lightboxElement('lightbox-close', 'X', closeLightbox);
   
    append(lightbox, close, imageNode, title);
    append(document.body, shadowbox, backButton, forwardButton, lightbox);
  
    position();
    window.onresize = position;

    function position () {
      var lightboxWidth = getWidth(lightbox);
      var windowWidth = getWidth(document.body);
      var backButtonWidth = getWidth(backButton);
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
            app.v.lightbox(
                app.t.image(image.src, image.id),
                image.title,
                imageCollection
            );
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
            app.v.lightbox(app.t.image(image.src, image.id), image.title, imageCollection);
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

  // utility functions

  function uuid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    }); 
  };

  function get (url, callback) {
    var req = new XMLHttpRequest();
    req.onload = callback; 
    req.open('GET', url, true);
    req.responseType = 'json';
    req.setRequestHeader(
      'Authorization',
      'Basic ' + btoa(creds.appID + ':' + creds.jsKey)
    );
    req.send();    
  };

  function getWidth (node) {
    return parseInt(window.getComputedStyle(node).width, 10);
  };

  function sample (arrayOrString) {
    return arrayOrString[Math.floor(Math.random() * arrayOrString.length)];
  };

  function fakeTitle () {
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

  function Image (src) {
    this.src = src;
    this.id = uuid();
    this.title = fakeTitle();
  };

   function el (tag) {
    var el = document.createElement(tag || 'div');
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        el.classList.add(arguments[i]);
      }
    }
    return el;
  };

  function append (target) {
    for (var i = 1; i < arguments.length; i++) {
      target.appendChild(arguments[i]);
    }
  };

  function remove () {
    if (!arguments.length) return;
    for (var i = 0; i < arguments.length; i++) {
      var node = arguments[i];
      node.parentNode.removeChild(node);
    }
  };

  
  window.app = app;

})()
