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
    <button class="button is-success"  v-show="path != ''" v-on:click="toPath('')">
      回首页
    </button>
  </p>
  <input type="file" id="file" v-on:change="change" v-show="false"/>
  <input type="file" id="files" v-on:change="change" v-show="false"  webkitdirectory />
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
      prePath: '',
      navigation: [],
      selectId: 'file',
      selectFiles: null
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
      console.log(this.navigation)
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
      this.postByQiniu(this.selectFiles.path)
    },
    uploadToken: function (ext) {
      var time = new Date().getTime() / 1000 + 3600
      time = Math.round(time)
      var policy = {
        scope: localStorage.getItem('bucket') + ':' + this.path + time + Math.random() * 1000 + '.' + ext,
        deadline: time
//        returnBody: '{"name": $(fname),"size": $(fsize),"hash": $(etag)}'
      }
      policy = JSON.stringify(policy)
      var encodedPutPolicy = Buffer(policy).toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
      var sign = crypto.createHmac('sha1', localStorage.getItem('SecretKey')).update(encodedPutPolicy + '\n').digest().toString('base64').replace(/\//g, '_').replace(/\+/g, '-')
      var uploadToken = localStorage.getItem('AccessKey') + ':' + sign + ':' + encodedPutPolicy
      console.log(uploadToken)
      return uploadToken
    },
    postFile: function (filepath) {
      var ext = filepath.split('.')[filepath.split('.').length - 1]
      var fs = require('fs')
      var file = fs.createReadStream(filepath)
      var token = this.uploadToken(ext)
      var formData = new FormData()
      formData.append('file', file)
      formData.append('token', token)
      var options = {
        'method': 'POST',
        'hostname': 'upload.qiniu.com',
        'data': formData,
        'port': null,
        'headers': {
          'authorization': 'UpToken ' + token,
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': Buffer.byteLength(formData)
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
          console.log(body)
          console.log(JSON.parse(body.toString()))
        })
      })
      req.end()
    },
    change: function (evt) {
      var files = evt.target.files
      this.selectFiles = files[0]
    }
  }
}
</script>
