<template>
    <section class="hero is-fullheight">
      <div class="hero-body">
        <div class="container">
            <h4 class="subtitle">七牛配置信息</h4>
            <p class="control has-icon">
              <input class="input is-primary" type="text" placeholder="AccessKey" v-model="AccessKey" required>
              <i class="fa fa-key"></i>
            </p>
            <p class="control has-icon">
              <input class="input is-primary" type="text" placeholder="SecretKey" v-model="SecretKey" required>
              <i class="fa fa-key"></i>
            </p>
            <p class="control has-icon">
              <input class="input is-primary" type="text" placeholder="bucket" v-model="bucket" required>
              <i class="fa fa-pencil-square-o"></i>
            </p>
            <p class="control has-icon">
              <input class="input is-primary" type="text" placeholder="域名" v-model="link" >
              <i class="fa fa-link"></i>
            </p>
            <p class="control">
              <button class="button is-success" v-on:click="save()">
                保存
              </button>
              <button class="button is-success" v-on:click="back()">
                返回
              </button>
            </p>
        </div>
      </div>
    </section>
</template>
<script>
export default {
  data () {
    return {
      AccessKey: localStorage.getItem('AccessKey') ? localStorage.getItem('AccessKey') : '',
      SecretKey: localStorage.getItem('SecretKey') ? localStorage.getItem('SecretKey') : '',
      bucket: localStorage.getItem('bucket') ? localStorage.getItem('bucket') : '',
      link: localStorage.getItem('link') ? localStorage.getItem('link') : ''
    }
  },
  methods: {
    save: function () {
      localStorage.setItem('AccessKey', this.AccessKey)
      localStorage.setItem('SecretKey', this.SecretKey)
      localStorage.setItem('bucket', this.bucket)
      localStorage.setItem('link', this.link)
    },
    back: function () {
      this.$route.router.go({name: 'drop'})
    }
  }
}

</script>
