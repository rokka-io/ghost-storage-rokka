'use strict'

const BaseAdapter = require('ghost-storage-base')
const logging = require('@tryghost/logging');
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
    logging.debug(`Rokka configuration: ${JSON.stringify(outputOptions)}`);
    this.org = options.organization
    this.defaultStack = options.defaultStack || 'dynamic/o-af-1'
    this.sourceFileStack = options.sourceFileStack || 'source_file'
    this.rawFileExtensions = options.rawFileExtensions?.split(',') || ['mp3']
    this.rokka = rokka({apiKey: config.key || ''})
    this.addFaceDetection = options.addFaceDetection || false
    logging.info('Rokka Storage Adapter loaded');
  }

  exists(filename) {
     // TBD: Not sure it's actually needed.
  }

  urlToPath() {
    //Rokka stores element flat.
    return '/';
  }

  _defineStackToUse(fileName) {
    if (!fileName) {
        return this.defaultStack;
    }

    const extension = fileName.split('.').pop();
    return this.rawFileExtensions.includes(extension) ? this.sourceFileStack : this.defaultStack;
  } 

  async save(file, noFace) {
    const stream = fs.createReadStream(file.path)
    return new Promise((resolve, reject) => {
      const meta = {
        meta_user: {'tool': 'ghost'}
      }
      if (this.addFaceDetection && !noFace) {
        meta["meta_dynamic"] = {'detection_face': {}}
      }
      
      const fileName = file.originalname ?? file.name

      this.rokka.sourceimages.create(this.org, fileName, stream, meta).then(res => {
        const rokkaImage = res.body.items[0]
        const stackToUse = this.defineStackToUse(fileName);
        const link = 'https://' + this.org + '.rokka.io/' + stackToUse + '/' + rokkaImage.short_hash + '/' + encodeURIComponent(
          rokkaImage.name.replace(/\.[a-zA-Z]{3,4}$/,"").
          replace(/[.\-]/g,"_")
        ) + '.' + rokkaImage.format
        logging.info(`File Uploaded and accessible at: ${link}`);
        resolve(link)

      }).catch(err => {
        logging.debug(`Error: ${JSON.stringify(err)}`)
        // try without face, maybe there's an error there
        if (this.addFaceDetection && !noFace) {
          this.save(file, true)
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