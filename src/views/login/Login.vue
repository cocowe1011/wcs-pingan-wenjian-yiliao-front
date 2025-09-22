<template>
  <div class="login">
    <div class="login-left">
      <img src="./img/imgs_register.png" alt="免费注册" />
    </div>
    <div class="login-right">
      <div class="login-right-top">
        <div class="login-right-top-left"></div>
        <div class="login-right-top-min" style="z-index: 12" @click="minWindow">
          <i
            class="el-icon-minus"
            style="font-size: 18px; font-weight: 600"
          ></i>
        </div>
        <div
          class="login-right-top-close"
          style="z-index: 12"
          @click="closewindow"
        >
          <i
            class="el-icon-close"
            style="font-size: 18px; font-weight: 600"
          ></i>
        </div>
      </div>
      <div class="login-right-down" v-if="pageMark == 'login'">
        <p class="title">WCS系统</p>
        <p class="intro">
          欢迎使用WCS系统。简洁、易用的操作页面，全自动化管理全力帮助您提高效率。
        </p>
        <div class="login-form">
          <el-input
            placeholder="请输入用户名"
            class="user-code"
            v-model="userCode"
          ></el-input>
          <el-input
            placeholder="请输入密码"
            class="user-password"
            type="password"
            v-model="userPassword"
            autocomplete="off"
            show-password
          ></el-input>
          <p class="tips">
            没有帐户？<span id="look-help" @click="registerPage">立即注册</span
            ><span style="margin-left: 185px">忘记密码?</span>
          </p>
          <el-button
            class="user-login-button"
            type="primary"
            @click="login"
            :loading="loadingStatus"
            >立即登录</el-button
          >
        </div>
      </div>
      <div class="login-right-down" v-else-if="pageMark == 'register'">
        <p class="title" style="text-align: center">创建账户</p>
        <p class="intro" style="width: 100%; text-align: center">
          已有帐户？<span id="look-help" @click="loginPage">登录</span>
        </p>
        <div class="login-form">
          <el-input
            placeholder="请输入姓名"
            ref="userNameRegRef"
            class="user-code-register"
            v-model="userNameReg"
            @blur="showUserNameTips = false"
            @focus="showUserNameTips = true"
          ></el-input>
          <p
            class="tips"
            style="margin-bottom: 0; line-height: 3px"
            v-show="showUserNameTips"
          >
            登录人姓名，用于记录订单操作人。
          </p>
          <el-input
            placeholder="请输入注册账号"
            ref="userCodeRegRef"
            class="user-code-register"
            v-model="userCodeReg"
            style="margin-top: 15px"
            @blur="showUserCodeTips = false"
            @focus="showUserCodeTips = true"
            @input="restrictInput"
          ></el-input>
          <p
            class="tips"
            style="margin-bottom: 0; line-height: 3px"
            v-show="showUserCodeTips"
          >
            注册账号为数字字母下划线，用于登录系统
          </p>
          <el-input
            placeholder="请输入密码"
            class="user-password-register"
            type="password"
            v-model="userPasswordReg"
            autocomplete="off"
            style="margin-top: 15px"
            show-password
          ></el-input>
          <el-input
            placeholder="确认密码"
            ref="userPasswordAgainRef"
            class="user-password-register"
            type="password"
            v-model="userPasswordAgain"
            autocomplete="off"
            style="margin-top: 15px"
            show-password
          ></el-input>
          <el-button
            class="user-login-button"
            type="primary"
            @click="registerUser"
            :loading="registerStatus"
            style="margin-top: 15px"
            >立即注册</el-button
          >
        </div>
      </div>
      <div class="login-right-down" v-else></div>
    </div>
    <transition name="fade">
      <div class="zz-spin" v-show="!javaAppStarted">
        <div id="loader" class="loadloding">
          <div></div>
        </div>
        <div id="lodtext">系统正在启动中...&nbsp;请稍后...</div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import HttpUtil from '@/utils/HttpUtil';
import axios from 'axios';
const remote = require('electron').remote;
export default {
  name: 'Login',
  components: {},
  props: {},
  data() {
    return {
      userCode: '',
      userPassword: '',
      loadingStatus: false,
      pageMark: 'login',
      showUserNameTips: false,
      showUserCodeTips: false,
      userNameReg: '',
      userCodeReg: '',
      userPasswordReg: '',
      userPasswordAgain: '',
      registerStatus: false,
      regex: /^[a-zA-Z0-9_]*$/,
      javaAppStarted: false,
      javaAppUrl: process.env.VUE_APP_BASE_URL + '/status/check',
      maxRetries: 30,
      retryInterval: 1000
    };
  },
  watch: {},
  computed: {},
  methods: {
    registerUser() {
      this.registerStatus = true;
      // 判断非空项
      if (this.userNameReg == '') {
        this.$refs.userNameRegRef.focus();
        this.$message.error('姓名不可为空，请输入！');
        this.registerStatus = false;
        return false;
      }
      if (this.userCodeReg == '') {
        this.$refs.userCodeRegRef.focus();
        this.$message.error('注册账号不可为空，请输入！');
        this.registerStatus = false;
        return false;
      }
      if (this.userPasswordReg == '') {
        this.$refs.userPasswordAgainRef.focus();
        this.$message.error('密码不可为空，请输入！');
        this.registerStatus = false;
        return false;
      }
      if (this.userPasswordReg !== this.userPasswordAgain) {
        this.$refs.userPasswordAgainRef.focus();
        this.$message.error('密码输入不一致，请重新输入！');
        this.registerStatus = false;
        return false;
      }
      const param = {
        userName: this.userNameReg,
        userCode: this.userCodeReg,
        userPassword: this.userPasswordReg
      };
      HttpUtil.post('/userInfo/save', param)
        .then((res) => {
          if (res.data == 1) {
            // 注册成功，跳转登录页面进行登录
            this.$notify({
              title: '注册成功！',
              message: '请输入账号密码进行登录！',
              type: 'success',
              duration: 2000
            });
            this.pageMark = 'login';
          } else {
            console.log(res);
            // 注册失败，请重试
            if (res.code == '0001') {
              this.$refs.userCodeRegRef.focus();
              this.$message.error(
                '注册失败！' + this.userCodeReg + res.message
              );
            } else {
              this.$message.error('注册失败！' + res.message);
            }
          }
          this.registerStatus = false;
        })
        .catch((err) => {
          // 注册失败，请重试
          this.$message.error('注册失败！' + err);
          this.registerStatus = false;
        });
    },
    loginPage() {
      this.pageMark = 'login';
    },
    registerPage() {
      this.userNameReg = '';
      this.userCodeReg = '';
      this.userPasswordReg = '';
      this.userPasswordAgain = '';
      this.pageMark = 'register';
    },
    login() {
      this.loadingStatus = true;
      // 将账号密码传递后台，判断密码是否正确
      // const param = {
      //   userCode: this.userCode,
      //   userPassword: this.userPassword
      // };
      // HttpUtil.post('/login/login', param)
      //   .then((res) => {
      //     if (res.data) {
      //       remote.getGlobal('sharedObject').userInfo = res.data;
      //       setTimeout(() => {
      //         this.loadingStatus = false;
      //         // 跳转主页
      //         this.$nextTick(() => {
      //           this.$router.replace({
      //             path: '/homePage/welcomPage'
      //           });
      //         });
      //       }, 2000);
      //     } else {
      //       this.$message.error(res.message);
      //       this.loadingStatus = false;
      //     }
      //   })
      //   .catch((err) => {
      //     this.$message.error(err);
      //     this.loadingStatus = false;
      //   });
      // 本地测试时，注释掉上面代码，使用下面代码
      remote.getGlobal('sharedObject').userInfo = {
        userCode: this.userCode,
        userPassword: this.userPassword,
        userName: '测试'
      };
      setTimeout(() => {
        this.loadingStatus = false;
        // 跳转主页
        this.$nextTick(() => {
          this.$router.replace({
            path: '/homePage/welcomPage'
          });
        });
      }, 2000);
    },
    closewindow() {
      ipcRenderer.send('close-window');
    },
    minWindow() {
      ipcRenderer.send('min-window');
    },
    restrictInput() {
      // 匹配只包含数字、字母和下划线的正则表达式
      if (!this.regex.test(this.userCodeReg)) {
        // 如果输入的值不符合要求，移除非法字符
        this.userCodeReg = this.userCodeReg.replace(/[^a-zA-Z0-9_]/g, '');
        this.$message.error('登录账户只能设置为数字，字母及下划线！');
      }
    },
    checkJavaAppStatus(retries = 0) {
      axios
        .get(this.javaAppUrl)
        .then((response) => {
          console.log(response);
          if (response.data === 'OK') {
            this.javaAppStarted = true;
            this.$message.success('已启动！');
            // 给主进程发消息，启动PLC连接
            ipcRenderer.send('conPLC');
          } else {
            if (retries < this.maxRetries) {
              setTimeout(
                () => this.checkJavaAppStatus(retries + 1),
                this.retryInterval
              );
            } else {
              console.error('Java应用程序启动超时');
            }
          }
        })
        .catch((error) => {
          if (retries < this.maxRetries) {
            setTimeout(
              () => this.checkJavaAppStatus(retries + 1),
              this.retryInterval
            );
          } else {
            console.error('检查Java应用程序状态时发生错误', error);
          }
        });
    }
  },
  created() {
    // ipcRenderer.send('logStatus','logout');
  },
  mounted() {
    if (!this.javaAppStarted) {
      this.checkJavaAppStatus();
    }
  }
};
</script>
<style lang="less" scoped>
.login {
  width: 100%;
  height: 100%;
  display: flex;
  &-left {
    pointer-events: none;
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fbfcfd;
    img {
      width: 690px;
      height: 546px;
    }
  }
  &-right {
    width: calc(100% - 690px);
    height: 100%;
    padding-left: 28px;
    &-top {
      height: 45px;
      width: 100%;
      display: flex;
      &-left {
        flex: 1;
        height: 100%;
        -webkit-app-region: drag;
        line-height: 45px;
        text-align: left;
        padding-left: 10px;
        font-size: 13px;
        font-weight: 600;
      }
      &-min,
      &-close,
      &-max {
        height: 100%;
        width: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        -webkit-app-region: no-drag;
      }
      &-min:hover,
      &-max:hover {
        background-color: #eeeeee;
      }
      &-close:hover {
        background-color: #f8635f;
        color: #fff;
      }
    }
    &-down {
      width: 100%;
      margin-top: 75px;
      .title {
        font-weight: 400;
        font-size: 32px;
        line-height: 25px;
        color: #262626;
      }
      .intro {
        width: 332px;
        font-weight: 400;
        font-size: 12px;
        line-height: 18px;
        color: #8c8c8c;
        margin-top: -15px;
        span {
          color: #4385ff;
          cursor: pointer;
        }
      }
      .login-form {
        padding: 20px 30px 20px 0px;
        ::v-deep .user-code {
          .el-input__inner {
            height: 45px;
            margin-bottom: 30px;
            font-size: 14px !important;
            color: #000;
          }
        }
        ::v-deep .user-password {
          .el-input__inner {
            height: 45px;
            font-size: 14px !important;
            color: #000;
            margin-bottom: 2px;
          }
        }
        .user-login-button {
          height: 43px;
          border-radius: 2px;
          font-size: 16px;
          width: 100%;
        }
        .tips {
          font-weight: 400;
          font-size: 12px;
          line-height: 18px;
          color: #8c8c8c;
          margin-bottom: 36px;
          span {
            color: #4385ff;
            cursor: pointer;
          }
        }
      }
    }
  }
  .loadloding {
    position: fixed;
    top: 45%;
    left: 50%;
    margin-top: -25px;
    margin-left: -25px;
    width: 50px;
    height: 50px;
    display: block;
    color: #1890ff;
    z-index: 11;
  }
  .loadloding > div {
    display: inline-block;
    float: none;
    background-color: currentColor;
    border: 0 solid currentColor;
  }
  #lodtext {
    font-size: 18px;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-top: 40px;
    margin-left: -100px;
    width: 220px;
    height: 30px;
    z-index: 11;
    font-weight: 600;
  }
  .loadloding > div {
    width: 100%;
    height: 100%;
    border-radius: 0;
    animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
  }
  @keyframes square-spin {
    0% {
      transform: perspective(100px) rotateX(0) rotateY(0);
    }
    25% {
      transform: perspective(100px) rotateX(180deg) rotateY(0);
    }
    50% {
      transform: perspective(100px) rotateX(180deg) rotateY(180deg);
    }
    75% {
      transform: perspective(100px) rotateX(0) rotateY(180deg);
    }
    100% {
      transform: perspective(100px) rotateX(0) rotateY(360deg);
    }
  }
  .zz-spin {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 4;
    width: 100%;
    height: 100%;
    opacity: 0.9;
    pointer-events: auto;
    background: #fff;
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
