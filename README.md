# hexo-thumbnails

![nodei.co](https://nodei.co/npm/hexo-thumbnails.png?downloads=true&downloadRank=true&stars=true)

![npm](https://img.shields.io/npm/v/hexo-thumbnails.svg)

[Hexo](https://hexo.io/) plugin to generate thumbnails for images.

 * can use any [gm](https://www.npmjs.com/package/gm) / imagemagick manipulation
   functions
 * writes thumbnails source directory along side original image
 * makes thumbnail url available as frontmatter variable

## Deprecated

Please open an issue if you would like to take ownership.

## Install

__plugin__

```
  npm i --save hexo-thumbnails
```

__imagemagick__

You'll need an imagemagick instance to handle the thumbnail creation.

debian:
```
  sudo apt-get install imagemagick
```

On windows you can try installing
[an imagemagick binary](http://www.imagemagick.org/script/binary-releases.php)
but I've not tested this plugin on windows so let me know how it goes.

## Usage

Thumbnails will be added to your source folder when you `hexo generate`. They
will be placed in the same folder as the original image.

A url for post cover images is added to posts as they're processed. So in the
configuration example below, where `post.cover` contains the url for a cover
image, `post.largeThumb_cover` and `post.smallThumb_cover` will contain urls
for the thumbnails.

## Configuration


__example__

```yaml
thumbnails:
  masks:
    - \.jpg$
  profiles:
    largeThumb:
      resize:
        - 400
        - 400
      blur:
        - 10
    smallThumb:
      resize:
        - 400
        - 400
```

__masks__

default: all jpg, jpeg, gif, png files

Be careful with this. You can list the masks (rules?) you want to use to check
which files to create thumbnails for. All profiles will be run for all matches.
If one file matches multiple masks it will be processed multiple times.

You can use express style or regex style masks. See
[Hexo Patterns](https://github.com/hexojs/hexo-util#patternrule) for additional
information.

you can just write a regex like `\.tiff$` (although that's not mentioned in the
linked doc.)

If you specify any mask, the default will be overwritten. So if you specify a
a single mask like `\.tiff$`, then `jpg`s will not be processed unless you add
a mask for them.

__profiles__

default: resize to 200x200

an image will be generated for each profile. So in the example above,
`images/original.jpg` would generate two thumbnails:

 * `images/largeThumb-original.jpg`, and
 * `images/smallThumb-original.jpg`

I haven't tested them all, but in theory you can use any of the myriad
manipulation methods listed in [gm](https://www.npmjs.com/package/gm), this
plugin simply applies all the methods listed in a profile to the gm instance.

## Api

See the [fancy annotated code](http://leviwheatcroft.github.io/hexo-thumbnails/docs/index.js.html)

## Author

Levi Wheatcroft <levi@wht.cr>

## Contributing

Contributions welcome; Please submit all pull requests against the master
branch.

## License

 - **MIT** : http://opensource.org/licenses/MIT
