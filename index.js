/* eslint-disable no-promise-executor-return */
/* eslint-disable max-lines */
'use strict'

const BaseAdapter = require('ghost-storage-base')
const logging = require('@tryghost/logging')
const rokka = require('rokka')
const fs = require('fs')
const request = require('request').defaults({encoding: null})

class RokkaAdapter extends BaseAdapter {
  constructor(options) {
    super(options)
    const config = options || {}

    // clone options and overwrite key for not leaking that to logs
    const outputOptions = Object.assign({}, options)
    outputOptions.key = '******'
    logging.debug(`Rokka configuration: ${JSON.stringify(outputOptions)}`)
    this.org = options.organization
    this.defaultStack = options.defaultStack || 'dynamic/o-af-1'
    this.sourceFileStack = options.sourceFileStack || 'source_file'
    this.rawFileExtensions = options.rawFileExtensions?.split(',') || ['mp3', 'wav', 'ogg', 'm4a', 'mp4', 'webm', 'ogv']
    this.rokka = rokka({apiKey: config.key || ''})
    this.addFaceDetection = options.addFaceDetection || false
    logging.info('Rokka Storage Adapter loaded')
  }

  exists() {
    //Rokka handles this already.
    return Promise.resolve(false)
  }

  urlToPath() {
    //Rokka stores element flat.
    return '/'
  }

  _isRawFile(fileName) {
    if (!fileName) {
      return false
    }

    const extension = fileName.split('.').pop()
    return this.rawFileExtensions.includes(extension)
  }

  async save(file) {
    const stream = fs.createReadStream(file.path)
    return new Promise((resolve, reject) => {
      const fileName = file.originalname ?? file.name
      const isRawFile = this._isRawFile(fileName)
      const meta = {
        meta_user: {tool: 'ghost'}
      }
      if (!isRawFile && this.addFaceDetection) {
        logging.debug(`Face detection requested for file ${fileName}. It is not a raw file, and 'addFaceDetection' setting is active`)
        meta.meta_dynamic = {detection_face: {}}
      }

      this.rokka.sourceimages.create(this.org, fileName, stream, meta).then((res) => {
        const rokkaImage = res.body.items[0]
        const stackToUse = isRawFile ? this.sourceFileStack : this.defaultStack
        const link = 'https://' + this.org + '.rokka.io/' + stackToUse + '/' + rokkaImage.short_hash + '/' + encodeURIComponent(
          rokkaImage.name.replace(/\.[a-zA-Z]{3,4}$/,'')
            .replace(/[.-]/g,'_')
        ) + '.' + rokkaImage.format
        logging.info(`File uploaded and accessible at: ${link}`)
        resolve(link)
      }).catch((err) => {
        logging.error(`Error while uploading. Reason: ${JSON.stringify(err)}`)
        reject(err)
      })
    })
  }

  serve() {
    return (_req, _res, next) => {
      next()
    }
  }

  delete() {
    // Let Ghost believe that the file has been delete. Rokka manages it
    return Promise.resolve(true)
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
