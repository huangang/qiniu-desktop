<template>
  <div class="tile is-ancestor">

    <div class="tile is-parent" v-for="item in list.items">
      <article class="tile is-child box">
        <p class="title">
          <span class="icon is-large">
          <i class="fa {{getFileType(item.mimeType)}}"></i>
          </span>
        </p>
        <p class="subtitle">{{ item.key }}</p>
      </article>
    </div>
  </div>
</template>
<script>
import http from 'http'
import querystring from 'querystring'
import crypto from 'crypto'
export default {
  data () {
    return {
      list: {},
      a: 1
    }
  },
  created: function () {
    this.getList(this)
  },
  methods: {
    getToken: function (str) {
      var Sign = crypto.createHmac('sha1', localStorage.getItem('SecretKey')).update(str + '\n').digest().toString('base64')
      return localStorage.getItem('AccessKey') + ':' + Sign
    },
    getList: function (that) {
      var postData = querystring.stringify({
        bucket: localStorage.getItem('bucket'),
        limit: 1000,
        prefix: '',
        delimiter: '/',
        marker: ''
      })
      var path = '/list?'
      var options = {
        'method': 'POST',
        'hostname': 'rsf.qbox.me',
        'port': null,
        'path': path + postData,
        'headers': {
          'authorization': 'QBox ' + this.getToken(path + postData),
          'content-type': 'application/x-www-form-urlencoded'
        }
      }
      var req = http.request(options, function (res) {
        var chunks = []

        res.on('data', function (chunk) {
          chunks.push(chunk)
        })

        res.on('end', function () {
          var body = Buffer.concat(chunks)
          that.list = JSON.parse(body.toString()) // json字符串转对象
          console.log(JSON.parse(body.toString()))
        })
      })
      req.end()
    },
    getFileType: function (mimeType) {
      var type = ''
      switch (mimeType) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/gif':
          type = 'fa-file-image-o'
          break
        case 'text/plain':
          type = 'fa-file-text-o'
          break
        case 'text/html':
        case 'text/css':
        case 'application/javascript':
          type = 'fa-file-code-o'
          break
        case 'audio/mp3':
          type = 'fa-file-audio-o'
          break
        case 'application/x-compressed':
          type = 'fa-file-archive-o'
          break
        case 'application/vnd.android.package-archive':
          type = 'fa-android'
          break
        default:
          type = 'fa-file-o'
      }
      return type
    }
  }
}
</script>
