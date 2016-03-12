(function(){

  var app = {};

  app.init = function () { 
    var url = "http://dummyimage.com/250/ffffff/000000";
    var image = document.createElement('img');
    image.setAttribute('src', url);
    image.addEventListener('click', function (el) {
      app.v.lightbox(app.v.image(url));
    });
    document.body.appendChild(image);
  };

  app.v = {};

  app.v.lightbox = function (imageHTML) {
    var shadowbox = document.createElement('div');
    var div = document.createElement('div');
    
    shadowbox.classList.add('shadowbox');
    shadowbox.addEventListener('click', function (el) {
      shadowbox.parentNode.removeChild(div);
      shadowbox.parentNode.removeChild(shadowbox);
    });
    
    document.body.appendChild(shadowbox);

    div.classList.add('lightbox');
    div.innerHTML = imageHTML;
    var close = document.createElement('div');
    close.innerHTML = 'close';
    div.appendChild(close);
    close.addEventListener('click', function (el) {
      console.log('close clicked');
      div.parentNode.removeChild(shadowbox);
      div.parentNode.removeChild(div);
    }); 
    document.body.appendChild(div);

  };

  app.v.image = function (url) {
    return '<img src="' + url + '" />';
  };

  window.app = app;

})()
