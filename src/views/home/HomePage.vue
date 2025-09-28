<template>
  <div class="homePage">
    <div class="maskDiv">
      <div class="maskDiv-top">
        <div class="maskDiv-top-left" @dblclick="maxWindow">
          <img
            src="../../../build/icons/64x64.png"
            style="width: 38px; height: 38px"
          />
          <div style="margin-left: 10px; height: 100%">
            <div class="maskDiv-top-left-top-title">WCS系统</div>
            <div class="maskDiv-top-left-top-title2">wcs</div>
          </div>
        </div>
        <div class="maskDiv-top-mid">
          <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
          >
            <el-menu-item index="1">首页</el-menu-item>
            <el-menu-item index="2">业务处理</el-menu-item>
            <el-menu-item index="5">关于</el-menu-item>
          </el-menu>
        </div>
        <div class="version-view">
          <div
            class="el-divider el-divider--vertical"
            style="margin-right: 15px"
          ></div>
          <div class="version-container">
            <div class="version-number">
              <!-- <i class="el-icon-caret-bottom"></i> -->
              V1.1.0
            </div>
          </div>
          <el-dropdown
            trigger="click"
            style="line-height: 0"
            @command="setCommand"
          >
            <i
              class="el-icon-setting"
              style="font-size: 18px; margin-right: 14px"
            ></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-full-screen" command="full_screen"
                >全屏/取消全屏&nbsp;&nbsp;Ctrl+F11</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
          <el-dropdown
            trigger="click"
            @command="handelCommand"
            style="line-height: 0"
          >
            <el-avatar
              :src="require('./img/header.png')"
              size="small"
              style="margin-right: 10px"
            ></el-avatar>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-close" style="color: #f04134"
                >注销用户</el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-key" command="updatePassword"
                >修改密码</el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-upload2" command="logout"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
          <div class="el-divider el-divider--vertical"></div>
        </div>
        <div class="maskDiv-top-min" @click="minWindow">
          <i
            class="el-icon-minus"
            style="font-size: 18px; font-weight: 600"
          ></i>
        </div>
        <div class="maskDiv-top-max" @click="maxWindow">
          <i
            :class="
              windowSize === 'unmax-window'
                ? 'el-icon-full-screen'
                : 'el-icon-copy-document'
            "
            style="font-size: 18px; font-weight: 600"
          ></i>
        </div>
        <div class="maskDiv-top-close" @click="closewindow">
          <i
            class="el-icon-close"
            style="font-size: 18px; font-weight: 600"
          ></i>
        </div>
      </div>
      <div class="maskDiv-down">
        <StatusMonitor></StatusMonitor>
        <keep-alive>
          <router-view />
        </keep-alive>
      </div>
    </div>
    <el-dialog
      title="修改密码"
      :visible.sync="dialogFormVisible"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-form :model="updatePasswordForm">
        <el-form-item label="请输入新密码" label-width="120px">
          <el-input
            v-model="updatePasswordForm.newPassword"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="确定密码" label-width="120px">
          <el-input
            v-model="updatePasswordForm.newPasswordAgain"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelUpdatePassword">取 消</el-button>
        <el-button type="primary" @click="updatePasswordMethod"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import StatusMonitor from '@/components/StatusMonitoring.vue';
import HttpUtil from '@/utils/HttpUtil';
const remote = require('electron').remote;
export default {
  name: 'HomePage',
  components: {
    StatusMonitor
  },
  props: {},
  data() {
    return {
      activeIndex: '1',
      windowSize: 'max-window',
      showLogout: true,
      dialogFormVisible: false,
      updatePasswordForm: {
        newPassword: '',
        newPasswordAgain: ''
      }
    };
  },
  watch: {},
  computed: {},
  methods: {
    handleSelect(key, keyPath) {
      switch (key) {
        // welcomPage
        case '1':
          this.$nextTick(() => {
            if (this.$route.path !== '/homePage/welcomPage') {
              this.$router.replace({
                path: '/homePage/welcomPage'
              });
            }
          });
          break;
        case '2':
          this.$nextTick(() => {
            if (this.$route.path !== '/homePage/MainPage') {
              this.$router.replace({
                path: '/homePage/MainPage'
              });
            }
          });
          break;
        case '5':
          this.$nextTick(() => {
            if (this.$route.path !== '/homePage/aboutPage') {
              this.$router.replace({
                path: '/homePage/aboutPage'
              });
            }
          });
          break;
        default:
          break;
      }
    },
    closewindow() {
      ipcRenderer.send('close-window');
    },
    minWindow() {
      ipcRenderer.send('min-window');
    },
    maxWindow() {
      this.windowSize =
        this.windowSize === 'unmax-window' ? 'max-window' : 'unmax-window';
      ipcRenderer.send('max-window', this.windowSize);
    },
    fullScreen() {
      ipcRenderer.send('full_screen');
    },
    logoutMethod() {
      this.$nextTick(() => {
        this.$router.replace({
          path: '/'
        });
      });
      this.$nextTick(() => {
        ipcRenderer.send('logStatus', 'logout');
      });
    },
    handelCommand(command) {
      switch (command) {
        case 'logout':
          this.$notify({
            title: '已退出登录！',
            message: '退出登录！',
            type: 'success',
            duration: 2000
          });
          this.logoutMethod();
          break;
        case 'updatePassword':
          this.$prompt('请输入注册账号时保存的姓名：', '敏感操作！验证用户！', {
            confirmButtonText: '验证',
            cancelButtonText: '取消'
          })
            .then(({ value }) => {
              // 验证姓名是否正确
              const param = {
                userName: value,
                userCode: remote.getGlobal('sharedObject').userInfo.userCode
              };
              HttpUtil.post('/userInfo/verifyName', param)
                .then((res) => {
                  if (res.data) {
                    this.$message.success('验证通过！');
                    // 打开修改密码的弹窗，可以修改密码
                    this.dialogFormVisible = true;
                  } else {
                    this.$message.error('验证未通过！');
                  }
                })
                .catch((err) => {
                  this.$message.error('验证未通过！请重试！');
                });
            })
            .catch(() => {
              this.$message({
                type: 'info',
                message: '取消验证！'
              });
            });
          break;
        default:
          break;
      }
    },
    setCommand(command) {
      console.log(command);
      switch (command) {
        case 'full_screen':
          this.fullScreen();
          break;
        default:
          break;
      }
    },
    changeIcon() {
      ipcRenderer.on('mainWin-max', (e, status) => {
        this.windowSize = status;
      });
    },
    cancelUpdatePassword() {
      this.dialogFormVisible = false;
      this.updatePasswordForm.newPassword = '';
      this.updatePasswordForm.newPasswordAgain = '';
    },
    updatePasswordMethod() {
      if (this.updatePasswordForm.newPassword == '') {
        this.$message.error('密码不可为空，请输入！');
        return false;
      }
      if (
        this.updatePasswordForm.newPassword !==
        this.updatePasswordForm.newPasswordAgain
      ) {
        this.$message.error('密码输入不一致，请重新输入！');
        return false;
      }
      const param = {
        userPassword: this.updatePasswordForm.newPassword,
        userCode: remote.getGlobal('sharedObject').userInfo.userCode
      };
      HttpUtil.post('/userInfo/updatePassword', param)
        .then((res) => {
          if (res.data > 0) {
            this.$notify({
              title: '修改成功！',
              message: '修改成功！请重新登陆！',
              type: 'success',
              duration: 2000
            });
            // 打开修改密码的弹窗，可以修改密码
            this.dialogFormVisible = false;
            this.logoutMethod();
          } else {
            this.$message.error('修改失败！');
          }
        })
        .catch((err) => {
          this.$message.error('修改失败！');
        });
    }
  },
  created() {
    // 给主进程发送消息，更改窗口大小，设置最小大小，默认全屏
    ipcRenderer.send('logStatus', 'login');
    this.changeIcon();
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.homePage {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e3e9f3 0%, #eef2f7 50%, #f5f7fa 100%);
  .maskDiv {
    width: 100%;
    height: 100%;
    opacity: 1;
    background: transparent;
    &-top {
      height: 55px;
      width: 100%;
      display: flex;
      align-items: center;
      border-radius: 0px 0px 10px 10px;
      background: rgba(255, 255, 255, 1);
      &-left {
        flex: 1;
        height: 100%;
        -webkit-app-region: drag;
        text-align: left;
        display: flex;
        align-items: center;
        padding-left: 10px;
        &-top-title {
          font-size: 16px;
          font-weight: 550;
          letter-spacing: 0px;
          color: rgba(28, 28, 40, 1);
          text-align: left;
          vertical-align: top;
          height: 30px;
          display: flex;
          align-items: flex-end;
        }
        &-top-title2 {
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 1.2px;
          color: rgba(70, 91, 101, 1);
          text-align: left;
          vertical-align: top;
          height: 20px;
          display: flex;
          align-items: flex-start;
        }
      }
      &-min,
      &-close,
      &-max {
        height: 45px;
        width: 45px;
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
      .version-view {
        height: 100%;
        display: inline-flex;
        align-items: center;
        vertical-align: text-bottom;
        cursor: pointer;
        .version-container {
          height: 20px;
          margin-right: 11px;
          display: inline-flex;
          align-items: center;
          font-size: 13px;
          border-radius: 25px;
          background-color: rgba(47, 84, 235, 0.050980392156862744);
          .version-number {
            height: 20px;
            line-height: 20px;
            padding: 0 10px;
            color: #2f54eb;
            font-weight: 600;
            letter-spacing: 1px;
          }
        }
        .el-divider--vertical {
          display: inline-block;
          width: 1px;
          height: 1.5rem;
          margin: 0 8px;
          vertical-align: middle;
          position: relative;
        }
      }
      ::v-deep .el-menu--horizontal > .el-menu-item {
        margin-right: 30px;
        color: #000000;
        font-size: 13px;
        font-weight: 500;
        height: 55px;
        line-height: 60px;
      }
      ::v-deep .el-menu--horizontal > .el-menu-item.is-active {
        border-bottom: 2px solid #3e7bfa;
      }
    }
    &-down {
      width: 100%;
      height: calc(100% - 55px);
    }
  }
  ::v-deep {
    .el-drawer__wrapper {
      height: calc(100% - 57px);
      top: 57px;
      bottom: auto;
    }
    .v-modal {
      top: auto;
    }
  }
}
</style>
