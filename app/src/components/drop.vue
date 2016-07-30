<template>
  <p class="control">
    <button class="button is-success" v-on:click="toSet()">
      设置
    </button>
    <button class="button is-success"  v-show="path != ''" v-on:click="toPath(prePath)">
      上一页
    </button>
    <button class="button is-success"  v-show="path != ''" v-on:click="toPath('')">
      回首页
    </button>
  </p>

  <div class="tile is-ancestor" >
    <div class="tile is-parent">
      <table class="table">
        <thead>
        <tr>
          <th>名字</th>
          <th>更新时间</th>
          <th>类型</th>
          <th></th>
        </tr>
        </thead>
        <tfoot>
        <tr>
          <th>名字</th>
          <th>更新时间</th>
          <th>类型</th>
          <th></th>
        </tr>
        </tfoot>
        <tbody>

        <tr v-for="item in list.commonPrefixes">
          <td><a v-on:click="toPath(item)">{{ item.substring(0, item.length - 1) }}</a></td>
          <td></td>
          <td>文件夹</td>
          <td class="is-icon">
            <a href="#">
              <i class="fa fa-folder-o"></i>
            </a>
          </td>

        </tr>

        <tr v-for="item in list.items">
          <td>{{ item.key }}</td>
          <td>{{getPutTime(item.putTime)}}</td>
          <td>{{getFileName(item.mimeType)}}</td>
          <td class="is-icon">
            <a href="#">
              <i class="fa {{getFileType(item.mimeType)}}"></i>
            </a>
          </td>
        </tr>

        </tbody>
      </table>
  </div>

  </div>

  <p class="control">
    <button class="button is-success" v-on:click="toSet()">
      设置
    </button>
    <button class="button is-success" v-show="path != ''" v-on:click="toPath(prePath)">
      上一页
    </button>
    <button class="button is-success"  v-show="path != ''" v-on:click="toPath('')">
      回首页
    </button>
  </p>

</template>
<script>
import http from 'http'
import querystring from 'querystring'
import crypto from 'crypto'
export default {
  data () {
    return {
      list: {},
      path: '',
      prePath: ''
    }
  },
  created: function () {
    this.getList(this)
  },
  methods: {
    getToken: function (str) {
      var Sign = crypto.createHmac('sha1', localStorage.getItem('SecretKey')).update(str + '\n')
              .digest().toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
      return localStorage.getItem('AccessKey') + ':' + Sign
    },
    getList: function (that, prefix = '') {
      this.prePath = this.path
      this.path = prefix
      var postData = querystring.stringify({
        bucket: localStorage.getItem('bucket'),
        marker: '',
        limit: 1000,
        delimiter: '/',
        prefix: prefix
      })
      var path = '/list?' + postData
      var options = {
        'method': 'POST',
        'hostname': 'rsf.qbox.me',
        'port': null,
        'path': path,
        'headers': {
          'authorization': 'QBox ' + this.getToken(path),
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
    },
    getFileName: function (mimeType) {
      var name = ''
      switch (mimeType) {
        case 'image/png':
        case 'image/jpeg':
        case 'image/gif':
          name = '图片'
          break
        case 'text/plain':
          name = '文本'
          break
        case 'text/html':
          name = 'html'
          break
        case 'text/css':
          name = 'css'
          break
        case 'application/javascript':
          name = 'js'
          break
        case 'audio/mp3':
          name = 'mp3'
          break
        case 'application/x-compressed':
          name = '压缩包'
          break
        case 'application/vnd.android.package-archive':
          name = 'apk'
          break
        default:
          name = '未知类型'
      }
      return name
    },
    getPutTime: function (time) {
      var date = new Date(time / 10000)
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var hour = date.getHours()
      var min = date.getMinutes()
      var second = date.getSeconds()
      return year + '年' + month + '月' + day + '日 ' + hour + ':' + min + ':' + second
    },
    toPath: function (path) {
      this.getList(this, path)
    },
    toSet: function () {
      this.$route.router.go({name: 'index'})
    }
  }
}
</script>
