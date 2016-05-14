'use strict'
// require all the things
const _         = require('lodash')
const gm        = require('gm').subClass({imageMagick: true})
const path      = require('path')
const vow       = require('vow')
const debug     = require('debug')
const util      = require('util')

/**
 * ## debugging
 * For debuging output to stdout, set debug environment variable a la:
 * `DEBUG=superagent-throttle:* node myapp.js`
 */
const dbg = {
  fn:     debug('hexo-thumbnails:fn'),
  config: debug('hexo-thumbnails:config')
}



/**
 * profiles
 * the profiles structure for hexo-thumbnails can contain one or more profiles
 * this default structure is for example more than anything else, it is expected
 * that users would specify their own `thumbnail` profile, which would over
 * write everything here. The plugin makes no attempt to merge options.
 */
let options = _.extend(
  {
    // default mask to match common image types
    masks: [
      /\.(gif|jpg|jpeg|png)$/i
    ],
    // default profile
    profiles: {
      thumb: {
        resize: [ 200, 200 ]
      }
    }
  },
  hexo.config.thumbnails
)

/**
 * ## processor
 * a hexo processor is called for each file in `source_dir` which matches the
 * mask for that processor.
 * in this case, a processor is created for each mask listed in options, so for
 * each file matching any of those masks we create a thumbnail for each profile
 *
 * see:
 * https://hexo.io/api/processor.html
 * https://hexo.io/api/box.html
 *
 * @param {File} file hexo File instance
 * @return Promise
 */
let processor = function(file) {

  // avoid generated thumbnails being processed
  let isThumbnail = _.some(options.profiles, function(profile, profileName) {
    return new RegExp('^' + profileName + '-').test(path.basename(file.path))
  })
  if (isThumbnail) {
    return vow.resolve()
  }

  return vow.all(
    // apply all options.profiles to each file
    _.map(options.profiles, function(profile, profileName) {
      let writeOp = vow.defer()
      let sourcePath = path.join(
        hexo.source_dir,
        file.path
      )

      // notice the destination is still the source folder
      // it's best to have hexo transfer the file to public otherwise bad things
      // will happen
      let destPath = path.join(
        hexo.source_dir,
        path.dirname(file.path),
        profileName + '-' + path.basename(file.path)
      )
      // create gm instance
      let image = gm(sourcePath)

      // apply methods listed in the profile to gm instance
      _.each(profile, function(args, method) {
        image[method].apply(image, args)
      })

      // write created image
      image.write(destPath, function(err) {
        if (err) {
          console.log(err)
          throw err
        }
        // getting a little hacky here, `hexo.source` is an instance of
        // Box https://git.io/vww9o _processFile is a private method, so it's
        // probably a little naughty to use this in a plugin
        hexo.source._processFile(hexo.source.File.TYPE_CREATE, destPath)
        .then(function() {
          writeOp.resolve()
        })
      })
      return writeOp
    })
  )
}
/**
 * ## register processors
 * registers a processor for each mask
 * @param {String|Regex} mask
 */
_.each(options.masks, function(mask) {
  hexo.extend.processor.register(mask, processor)
})

/**
 * ## register filter
 * this filter creates frontmatter variables for cover thumbnails
 */
hexo.extend.filter.register('before_generate', function() {
  // some naughty direct database access
  let posts = hexo.model('Post').toArray()
  return vow.all(_.map(posts, function(post) {
    if (!post.cover) {
      return
    }
    return vow.all(_.map(options.profiles, function(profile, profileName) {
      post[profileName + 'Cover'] = [
        path.dirname(post.cover),
        '/',
        profileName + '-' + path.basename(post.cover)
      ].join('')
      return post.save()
    }))
  }))

})


