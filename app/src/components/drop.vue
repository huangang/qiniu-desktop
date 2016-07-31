<template>
  <nav class="nav has-shadow">
    <div class="container">
      <div class="nav-left">
        <a class="nav-item is-tab" v-bind:class="[{ 'is-active': navigation.length <= 1 }]"  v-on:click="toPath('')">首页</a>
        <a v-show="navigation.length > 1 && (navigation.length - 1) > $index" v-for="nav in navigation" class="nav-item is-tab" v-bind:class="[{ 'is-active': navigation.length - 2 == $index }]"  v-on:click="toPath(getNavPath([$index + 1]))">
          {{ nav }}
        </a>
      </div>
    </div>
  </nav>

  <div class="tile is-ancestor" >
    <div class="tile is-parent">
      <table class="table">
        <thead>
        <tr>
          <th>文件名</th>
          <th>最后更新</th>
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
            <a>
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
    <button class="button is-success" v-on:click="selectFile('file')">
      选择文件
    </button>
    <button class="button is-success" v-on:click="selectFile('files')">
      选择文件夹
    </button>
    <button class="button is-success" v-on:click="uploadFile()">
      上传
    </button>
    <input class="input is-primary" type="text" placeholder="上传前缀" v-model="prefix">
  </p>
  <input type="file" id="file" v-on:change="change" v-show="false"/>
  <input type="file" id="files" v-on:change="change" v-show="false"  webkitdirectory />
</template>
<script>
import http from 'http'
import querystring from 'querystring'
import crypto from 'crypto'
import Uploader from 'qiniu-web-uploader'
export default {
  data () {
    return {
      list: {},
      path: '',
      navigation: [],
      selectId: 'file',
      selectFiles: null,
      prefix: ''
    }
  },
  created: function () {
    this.getList(this)
  },
  watch: {},
  methods: {
    getToken: function (str) {
      var Sign = crypto.createHmac('sha1', localStorage.getItem('SecretKey')).update(str + '\n')
              .digest().toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
      return localStorage.getItem('AccessKey') + ':' + Sign
    },
    getList: function (that, prefix = '') {
      this.navigation = prefix.split('/')
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
        case 'image/x-icon':
          type = 'fa-file-image-o'
          break
        case 'text/plain':
          type = 'fa-file-text-o'
          break
        case 'text/html':
        case 'text/css':
        case 'application/javascript':
        case 'text/javascript':
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
        case 'image/x-icon':
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
        case 'text/javascript':
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
        case 'application/octet-stream':
          name = '流文件'
          break
        case 'application/x-navimap':
          name = 'map'
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
    },
    getNavPath: function (index) {
      index = index[0]
      var i = 0
      var path = ''
      this.navigation.forEach(function (nav) {
        if (i < index) {
          path = path + '/' + nav
        }
        i++
      })
      return path.substring(1, path.length) + '/'
    },
    selectFile: function (id) {
      this.selectId = id
      var file = document.getElementById(this.selectId)
      file.click()
    },
    uploadFile: function () {
      console.log(this.selectFiles)
      var qntoken = require('../libs/qiniu-token-direct/index')
//      var time = new Date().getTime() / 1000 + 3600
//      time = Math.round(time)
//      var ext = this.selectFiles.path.split('.')[this.selectFiles.path.split('.').length - 1]
      var path = this.path + this.prefix + this.selectFiles.name
      console.log(path)
      path = encodeURI(path)
      qntoken.config = {
        access_key: localStorage.getItem('AccessKey'),
        secret_key: localStorage.getItem('SecretKey'),
        bucketname: localStorage.getItem('bucket'),
        path: path
      }
      console.log(qntoken.config)
      var uptoken = {
        uptoken: qntoken.getToken(), // 七牛上传凭证
        key: Buffer(path).toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
      }
      let uploader = new Uploader(this.selectFiles, uptoken, 1024 * 1024 * 4, 1024 * 128, 'http://upload.qiniu.com/')
      console.log(uploader)
      uploader.upload()
      uploader.on('progress', () => {
        console.log(uploader.percent) // 加载进度
        console.log(uploader.offset) // 字节
        console.log(uploader.file) // 文件
      })
    },
    change: function (evt) {
      var files = evt.target.files
      this.selectFiles = files[0]
    }
  }
}
</script>
