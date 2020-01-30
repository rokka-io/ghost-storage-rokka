'use strict'

const BaseAdapter = require('ghost-storage-base')
const debug = require('ghost-ignition').debug('ghost-storage-rokka')
const rokka = require('rokka')
const fs = require("fs")
const request = require('request').defaults({encoding: null})


class RokkaAdapter extends BaseAdapter {
  constructor(options) {
    super(options)
    const config = options || {}

    // clone options and overwrite key for not leaking that to logs
    const outputOptions = Object.assign({}, options)
    outputOptions.key = "******"
    debug("Config Options:",outputOptions)
    this.org = options.organization
    this.defaultStack = options.defaultStack || 'dynamic/o-af-1'
    this.rokka = rokka({apiKey: config.key || ''})
    this.addFaceDetection = options.addFaceDetection || false
  }

  exists(filename) {
     // TBD: Not sure it's actually needed.
  }

  async save(image, noFace) {
    const stream = fs.createReadStream(image.path)
    return new Promise((resolve, reject) => {
      const meta = {
        meta_user: {'tool': 'ghost'}
      }
      if (this.addFaceDetection && !noFace) {
        meta["meta_dynamic"] = {'detection_face': {}}
      }
      this.rokka.sourceimages.create(this.org, image.originalname, stream, meta).then(res => {
        const rokkaImage = res.body.items[0]
        const link = 'https://' + this.org + '.rokka.io/' + this.defaultStack + '/' + rokkaImage.short_hash + '/' + rokkaImage.name
        debug('Uploaded:', link)
        resolve(link)

      }).catch(err => {
        debug("error", err)
        // try without face, maybe there's an error there
        if (this.addFaceDetection && !noFace) {
          this.save(image, true)
        } else {
          reject(err)
        }
      })
    })
  }

  serve() {
    return (req, res, next) => {
      next()
    }
  }

  delete(filename) {
    // TBD: Not sure it's actually implemented on ghost side yet.

  }

  read(options) {
    const opts = options || {}
    return new Promise((resolve, reject) => request.get(opts.path, (err, res) => {
      if (err) {
        return reject({
          err: err,
          message: `Could not read image ${opts.path}`
        })
      }
      return resolve(res.body)
    }))
  }
}

module.exports = RokkaAdapter