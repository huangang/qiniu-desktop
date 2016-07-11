<template>
  <div class="tile is-ancestor">

    <div class="tile is-parent">
      <article class="tile is-child box">
        <p class="title">
          <span class="icon is-large">
          <i class="fa fa-file-o "></i>
          </span>
        </p>
        <p class="subtitle">file</p>
      </article>
    </div>

    <div class="tile is-parent">
      <article class="tile is-child box">
           <p class="title" v-on:click="init()">
          <span class="icon is-large">
          <i class="fa  fa-file-image-o"></i>
          </span>
        </p>
        <p class="subtitle">img</p>
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
      t: 1
    }
  },
  ready: function () {
    var postData = querystring.stringify({
      bucket: localStorage.getItem('bucket'),
      limit: 1000,
      prefix: 'icon/',
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
    console.log(options)

    var req = http.request(options, function (res) {
      var chunks = []

      res.on('data', function (chunk) {
        chunks.push(chunk)
      })

      res.on('end', function () {
        var body = Buffer.concat(chunks)
        console.log(body.toString())
      })
    })

    req.end()
  },
  methods: {
    getToken: function (str) {
      var Sign = crypto.createHmac('sha1', localStorage.getItem('SecretKey')).update(str + '\n').digest().toString('base64')
      return localStorage.getItem('AccessKey') + ':' + Sign
    }
  }
}
</script>
