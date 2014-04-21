<html>
<head>
  <meta charset="UTF-8">
  <title>photobox</title>
  <link rel="stylesheet" href="css/canvas.css"/>
  <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.0/jquery.min.js"></script>
  <script>
      if(!window.$){
          var head = document.getElementsByTagName('head'),
              script = document.createElement('script');

          script.setAttribute('src', 'scripts/jquery.2.1.0.min.js');
          head.item(0).appendChild(script);
      }
  </script>
</head>
<body>
  <h1><i></i>Photobox</h1>
  <main class="">
    <% _.each( _.keys( templateData ), function( url ) { %>
      <div class="name"><a href="<%= url %>" data-name="<%= url %>" target="_blank"><%= url %></a></div>

      <% _.each( templateData[ url ], function( data ) {%>
        <div class="row">
          <div class="size"><%= data.size %></div>
          <div class="colContainer hide">
            <div class="col">
              <h2>Old screens</h2>
              <a href="img/last/<%= data.img %>.png?<%= now %>">
                <img src="" class="last" data-src="img/last/<%= data.img %>.png?<%= now %>" data-size="<%= data.size %>">
              </a>
              <p><%= timestamps.last %></p>
            </div><div class="col">
              <h2>Difference</h2>
                <a href="img/diff/<%= data.img %>.png?<%= now %>">
                  <img src="" class="last" data-src="img/diff/<%= data.img %>.png?<%= now %>" data-size="<%= data.size %>">
                </a>
            </div><div class="col">
              <h2>New Screens</h2>
              <a href="img/current/<%= data.img %>.png?<%= now %>">
                <img src="" class="current" data-src="img/current/<%= data.img %>.png?<%= now %>" data-size="<%= data.size %>">
              </a>
              <p><%= timestamps.current %></p>
            </div>
          </div>
        </div>
      <% } );%>
    <% } );%>
  </main>

  <script type="text/javascript">
      (function(){
          'use strict';
          var imagesList      = document.querySelectorAll( 'img' ),
                  images          = Array.prototype.slice.call( imagesList, 0 );

          images.forEach( function( image ) {
              image.src = image.dataset.src;
          } );


      })();
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
      });
  </script>
</body>
</html>
