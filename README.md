# grunt-photobox
このプラグインは[grunt-photobox](https://github.com/stefanjudis/grunt-photobox)を元に、独自に改修したものです.

## The "photobox" task

### Overview
In your project's Gruntfile, add a section named `photobox` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  photobox: {
  	task : {
      options: {
      	// Task-specific options go here.
      }
    }
  },
})
```

Photobox helps you to not deploy any broken layout to production. It takes screenshots of you current site.

**Additionally you got the feature, to keep the last photosession and to overlay old and new screenshots, to see even better if something is broken or not. BE ALWAYS SURE, THAT YOU HAVEN'T BROKEN LAYOUT THE EASY WAY.**

#### ImageMagick and Canvas representation (generated diff):

![image](https://raw.github.com/Tairyu/grunt-photobox/master/tasks/assets/img/imageMagick.png)

### Options


#### options.indexPath

Type: `String`

Default value: `photobox/`

A string value that is used to set the path to the generated images and **index.html**.

Per default a ```photobox``` folder will be generated and inside of that folder an index.html is located to check for broken layout.


#### options.screenSizes

Type: `Array`

Default value: `[ '800' ]`

**[NOTE: Values like '800x600' are deprecated since version 0.5.0.]**

An array containing strings, that represents the wished width in pixels of the taken pictures. The height will be calculated automatically depending on the given site.

E.g. **'800'** -> width: 800px;


#### options.urls

Type: `Array`

Default value: `[ 'http://google.com' ]`

An array containing strings, that represents the wished urls for the photosession.


#### options.userName

Type: `String`

Default value: ``

A string representing the username in case of HTTP-Authentification.


#### options.password

Type: `String`

Default value: ``

A string representing the password in case of HTTP-Authentification.


#### options.template

Type: `String|Object`

Default value: `canvas`

A string value that is used to set the template to display your screenshots.
Possible values:

- `canvas`  -> uses Canvas to show differences in screenshots.
- `magic`   -> uses ImageMagick to show the difference of old and new screenshots.

If you want to use ImageMagick by setting `options.template` to `magic` **make sure ImageMagick and included commands are installed on your system:**

Check the following commands in your environment:

```
$ which covert
/opt/local/bin/convert
```
```
$ which composite
/opt/local/bin/composite
```

If you want to pimp your via canvas generated diff images there is the option available to pass in an object as `template` instead of a string.

```
options : {
  ...
  template       : {
    name    : 'canvas',
    options : {
      highlightColor : '#0000ff',  //
      diffFilter     : 'darker' //  default == no filter | 'darker' | 'brighter'
    }
  }
  ...
}
```
##### options.template.name

Type: `String`

Currently only supported set to `canvas`.

##### options.template.options.highlightColor

Type: `String`

Default value: '#ff0000'

A string representing a given color for highlighted different areas.

##### options.template.options.diffFilter

Type: `String`

Default value: `default`

3 modes for diff image processing are available:

- `default` - image information in diff image will not be changed
- `darker` - image information in diff image will be changed to a darker image
- `brighter` - image information in diff image will be change to a brighter image

### Usage Examples

#### Default Options

In this example, the default options are used to do just show what is possible. Run ```grunt photobox``` without any custom options and you will get a new file at ```photobox/index.html```.

It will consist of a screenshot for the default url ( http://google.com ) in the default width 800px.

```js
grunt.initConfig( {
  photobox: {
    task: {
      options: {}
    }
  }
});
```

#### Options

Now let's customize everything for your needs.

```js
grunt.initConfig( {
  photobox: {
    task: {
      options: {
        screenSizes : [ '600', '1000', '1200' ],
        urls        : [ 'http://yoursite.com', 'http://yoursite.com/blog', 'http://yoursite.com/catalog' ]
      }
    }
  }
} );
```
This will generate you 9 screenshots - each url in each size.


#### Canvas default usage

```js
grunt.initConfig( {
  photobox : {
    waisenkinder : {
      options : {
        indexPath      : 'photobox/',
        highlightColor : '#0000ff',
        screenSizes    : [ '960', '350', '1200' ],
        template       : 'canvas',
        urls           : [ 'http://4waisenkinder.de' ]
      }
    }
  }
} );
```

#### Canvas configured usage

```
grunt.initConfig( {
  photobox : {
    waisenkinder : {
      indexPath      : 'photobox/',
      screenSizes    : [ '960', '350', '1200' ],
      template       : {
        name    : 'canvas',
        options : {
          highlightColor : '#0000ff',  // template.options.hightlightColor || highlightcolor || default
          diffFilter     : 'darker' //  'default' == no filter | 'darker' | 'brighter'
        }
      },
      urls           : [ 'http://4waisenkinder.de' ]
    }
  }
} );
```

#### ImageMagick usage

```js
grunt.initConfig( {
  photobox : {
    waisenkinder : {
      options : {
        indexPath      : 'photobox/',
        screenSizes    : [ '960', '350', '1200' ],
        template       : 'magic',
        urls           : [ 'http://4waisenkinder.de' ]
      }
    }
  }
} );
```
