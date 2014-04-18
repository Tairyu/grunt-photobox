<html>
<head>
  <meta charset="UTF-8">
  <title>photobox</title>
  <link rel="stylesheet" href="css/canvas.css"/>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
  <script>
      if(!window.JQuery){
          var head = document.getElementsByTagName('head'),
              script = document.createElement('script');

          script.setAttribute('src', '/js/jquery.2.1.0.min.js');
          head.item(0).appendChild(script);
      }
  </script>
</head>
<body>
  <h1><i></i>Photobox</h1>
  <main class="">
    <% _.each( _.keys( templateData ), function( url ) { %>
      <% var name  = url.replace( /(http:\/\/|https:\/\/)/, '' ).replace( /:[0-9]*/g, '').replace( /\//g, '-' ).replace(/\?/g, '!'); %>
      <div class="name"><a href="<%= url %>" data-name="<%= name %>" target="_blank"><%= name %></a></div>

      <% _.each( templateData[ url ], function( size ) {%>
        <div class="row">
          <div class="size"><%= size %></div>
          <div class="colContainer hide">
            <div class="col">
              <h2>Old screens</h2>
              <a href="img/last/<%= name %>-<%= size %>.png?<%= now %>">
                <img src="" class="last" data-src="img/last/<%= name %>-<%= size %>.png?<%= now %>" data-size="<%= size %>">
              </a>
              <p><%= timestamps.last %></p>
            </div><div class="col">
              <h2>Difference</h2>
              <h3 class="processing">
                <div id="semi_border"></div>
                we are checking for different pixels..</h3>
              <canvas class='hide'>canvas is not supported</canvas>
            </div><div class="col">
              <h2>New Screens</h2>
              <a href="img/current/<%= name %>-<%= size %>.png?<%= now %>">
                <img src="" class="current" data-src="img/current/<%= name %>-<%= size %>.png?<%= now %>" data-size="<%= size %>">
              </a>
              <p><%= timestamps.current %></p>
            </div>
          </div>
        </div>
      <% } );%>
    <% } );%>
  </main>

  <script type="text/javascript">
  ( function() {
    'use strict';
    var imagesList       = document.querySelectorAll( 'img' ),
        images           = Array.prototype.slice.call( imagesList, 0 ),
        lastImages,
        currentImages,
        canvasList,
        processing;

    images.forEach( function( image ) {
      image.src     = image.dataset.src;
      image.onerror = function() {
        event.target.dataset.status = '404';
      }
    } );


    /**
     * prepareDiff inits the canvas for the DIFF and
     * sends image data to the worker
     *
     * @param  {Object} imgA a imgDOM element
     * @param  {Object} imgB a img DOM element
     * @param  {Object} cnvs a canvas DOM element
     */
    function prepareDiff( imgA, imgB, cnvs, processing ) {
      'use strict';

      // get the real image dimensions
      var dummyImage = new Image();
      dummyImage.src = imgA.src;
      cnvs.width     = dummyImage.width;
      cnvs.height    = dummyImage.height;

      var ctx = cnvs.getContext( '2d' );

      // draw first image and get pixel data
      ctx.drawImage( imgA , 0, 0 );
      var pixelsA = ctx.getImageData( 0, 0, dummyImage.width, dummyImage.height );

      ctx.globalAlpha = 0.5;

      // draw second image and get pixel data
      ctx.drawImage( imgB, 0, 0 );
      var pixelsB = ctx.getImageData( 0, 0, dummyImage.width, dummyImage.height );

      var data = {
        a     : pixelsA,
        b     : pixelsB,
        config: {
          higlightColor : '<%= ( options.template.options && options.template.options.highlightColor ) || "#0000ff" %>',
          threshold     : 10,
          diffFilter    : '<%= ( options.template.options && options.template.options.diffFilter ) || "default" %>',
        }
      };

      var worker = new Worker( 'scripts/worker.js' );

      worker.postMessage( data );
      worker.addEventListener( 'message', function( e ) {
        ctx.putImageData( e.data.imageData, 0, 0 );
        processing.style.display = 'none';
        console.warn( 'Found ', e.data.amount, 'different pixels' );
      }, false);

    }

    window.addEventListener( 'load' , function() {
      lastImages    = document.querySelectorAll('.last');
      currentImages = document.querySelectorAll('.current');
      canvasList    = document.querySelectorAll('canvas');
      processing    = document.querySelectorAll('.processing');

      for (var i = lastImages.length - 1; i >= 0; i--) {
        if (
          lastImages[ i ].dataset.status !== '404' &&
          currentImages[ i ].dataset.status !== '404'
        ) {
          prepareDiff(
            lastImages[ i ],
            currentImages[ i ],
            canvasList[ i ],
            processing[ i ]
          );
          $(canvasList[i]).removeClass('hide');
        } else {
          processing[ i ].innerHTML = 'Nothing to process here.<br>' +
                                      'Only one image is available. :(';
        }
      }
    }, false );
  } )();
  </script>
  <script>
      $('body').on('click', '.size', function(evt){
          var $colContainer = $(evt.currentTarget).parent().find('.colContainer');
          if($colContainer.hasClass('hide')) {
              $colContainer.removeClass('hide');
          }
          else {
              $colContainer.addClass('hide');
          }
      }).on('click', 'canvas', function(evt){
          var img = new Image();
          img.src = evt.currentTarget.toDataURL('image/png');
          img.onload = function() {
              location.href = img.src;
          };
      })

  </script>
</body>
</html>
