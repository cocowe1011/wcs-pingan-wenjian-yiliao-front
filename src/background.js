import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  dialog,
  Tray,
  screen
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import nodes7 from 'nodes7';
import HttpUtil from '@/utils/HttpUtil';
import logger from 'electron-log';
// 设置日志文件的保存路径
logger.transports.file.file = app.getPath('userData') + '/app.log';

// 初始化日志记录器
logger.transports.file.level = 'info';
logger.transports.console.level = 'info';
// 日期样式
logger.transports.file.format =
  '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}';
console.log(app.getPath('userData'));
logger.transports.file.file = app.getPath('userData') + '/app.log';

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
var appTray = null;
let closeStatus = false;
var conn = new nodes7();

// 记录日志的辅助函数
function logToFile(message) {
  const timestamp = new Date().toLocaleString();
  const logPath =
    'D://wcs_temp_data/log/' +
    new Date().toLocaleDateString().replaceAll('/', '-') +
    'runlog.txt';
  fs.appendFile(logPath, `[${timestamp}] ${message}\n`, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
}

// 日志缓冲相关变量
let logBuffer = [];
let logBufferTimer = null;
const LOG_BUFFER_SIZE = 10; // 缓冲区大小
const LOG_FLUSH_INTERVAL = 5000; // 5秒刷新一次

// 优化的日志写入函数
function writeLogToLocalOptimized(logData) {
  // 添加时间戳
  const timestamp = new Date().toLocaleString();
  const logEntry = `[${timestamp}] ${logData}\n`;

  // 添加到缓冲区
  logBuffer.push(logEntry);

  // 如果缓冲区满了，立即刷新
  if (logBuffer.length >= LOG_BUFFER_SIZE) {
    flushLogBuffer();
  } else if (!logBufferTimer) {
    // 设置定时器，定期刷新缓冲区
    logBufferTimer = setTimeout(() => {
      flushLogBuffer();
    }, LOG_FLUSH_INTERVAL);
  }
}

// 刷新日志缓冲区
function flushLogBuffer() {
  if (logBuffer.length === 0) return;

  const logPath =
    'D://wcs_temp_data/log/' +
    (new Date().toLocaleDateString() + '.txt').replaceAll('/', '-');

  // 确保日志目录存在
  const logDir = 'D://wcs_temp_data/log';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // 检查日志文件大小，如果超过10MB则进行轮转
  try {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 10) {
        // 创建备份文件
        const backupPath = logPath.replace('.txt', `_${Date.now()}.txt`);
        fs.renameSync(logPath, backupPath);
        console.log(`日志文件过大，已轮转到: ${backupPath}`);
      }
    }
  } catch (error) {
    console.error('检查日志文件大小时出错:', error);
  }

  // 批量写入日志
  const logContent = logBuffer.join('');
  fs.appendFile(logPath, logContent, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  // 清空缓冲区
  logBuffer = [];

  // 清除定时器
  if (logBufferTimer) {
    clearTimeout(logBufferTimer);
    logBufferTimer = null;
  }
}
// electron 开启热更新
try {
  require('electron-reloader')(module, {});
} catch (_) {
  // 忽略热更新错误
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 应用退出时确保所有日志都被写入
app.on('before-quit', () => {
  flushLogBuffer();
});

// 单实例锁，防止应用被多开 - 必须在app.ready之前检查
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  // 直接退出，不创建任何窗口，避免白色背景框
  console.log('检测到已有程序运行，直接退出');
  // 使用 process.exit 确保立即退出，避免任何延迟
  process.exit(0);
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });
}

global.sharedObject = {
  userInfo: {}
};
let mainWindow = null;
app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    icon: './build/icons/icon.ico'
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html');
    // mainWindow.webContents.openDevTools();
  }
  ipcMain.on('logStatus', (event, arg) => {
    console.log(arg);
    if (arg === 'login') {
      mainWindow.setResizable(true);
      mainWindow.setBounds({
        x: 0,
        y: 0,
        width: screen.getPrimaryDisplay().workAreaSize.width,
        height: screen.getPrimaryDisplay().workAreaSize.height
      });
    } else {
      // 太几把坑了，windows系统setSize center方法失效 必须先mainWindow.unmaximize()
      mainWindow.unmaximize();
      mainWindow.setSize(1100, 600);
      mainWindow.center();
      global.sharedObject.userInfo = {};
      // mainWindow.setResizable(false)
    }
  });
  // 定义自定义事件
  ipcMain.on('close-window', function () {
    mainWindow.close();
  });
  // 定义自定义事件
  ipcMain.on('min-window', (event, arg) => {
    mainWindow.minimize();
  });
  // writeValuesToPLC
  ipcMain.on('writeValuesToPLC', (event, arg1, arg2) => {
    writeValuesToPLC(arg1, arg2);
  });
  // writeSingleValueToPLC - 单独给PLC某个变量写值，通过批量写入数组实现
  ipcMain.on('writeSingleValueToPLC', (event, arg1, arg2) => {
    writeSingleValueToPLC(arg1, arg2);
  });
  // cancelWriteToPLC - 取消PLC某个变量的写入
  ipcMain.on('cancelWriteToPLC', (event, arg1) => {
    cancelWriteToPLC(arg1);
  });
  // 定义自定义事件
  ipcMain.on('max-window', (event, arg) => {
    if (arg === 'max-window') {
      return mainWindow.maximize();
    }
    mainWindow.unmaximize();
    mainWindow.setBounds({
      x: 10,
      y: 10,
      width: screen.getPrimaryDisplay().workAreaSize.width - 20,
      height: screen.getPrimaryDisplay().workAreaSize.height - 20
    });
  });
  // 启动plc conPLC
  ipcMain.on('conPLC', (event, arg1, arg2) => {
    if (process.env.NODE_ENV === 'production') {
      conPLC();
    }
    // setInterval(() => {
    //   console.log(writeStrArr.toString());
    // }, 50);
    // sendHeartToPLC()
  });
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('mainWin-max', 'max-window');
  });
  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('mainWin-max', 'unmax-window');
  });
  mainWindow.on('close', (e) => {
    closeStatus = true;
    e.preventDefault(); //先阻止一下默认行为，不然直接关了，提示框只会闪一下
    dialog
      .showMessageBox({
        type: 'warning',
        title: '提醒！',
        message: '确认关闭程序吗？',
        buttons: ['关闭程序', '放入托盘', '取消'], //选择按钮，点击确认则下面的idx为0，取消为1
        cancelId: 2 //这个的值是如果直接把提示框×掉返回的值，这里设置成和"取消"按钮一样的值，下面的idx也会是1
      })
      .then((idx) => {
        if (idx.response == 2) {
          e.preventDefault();
        } else if (idx.response == 0) {
          mainWindow = null;
          app.exit();
        } else {
          mainWindow.setSkipTaskbar(true);
          mainWindow.hide();
        }
      });
  });
  if (process.env.NODE_ENV === 'development') {
    let revert = false;
    setInterval(() => {
      if (mainWindow) {
        if (revert) {
          mainWindow.webContents.send(
            'receivedMsg',
            {
              DBW0: 0,
              DBW6: 0,
              DBW8: 35580,
              DBW10: 512,
              DBW12: -1793,
              DBW14: 0,
              DBW16: 0,
              DBW28: 0,
              DBW30: 0,
              DBW34: 0,
              DBW36: 0,
              DBW38: 0,
              DBW40: 0,
              DBW42: 0,
              DBW44: 0,
              DBW46: 0,
              DBW48: 0,
              DBW50: 0,
              DBW64: 0,
              DBW66: 0,
              DBW70: 0,
              DBW74: 0,
              DBW78: 0,
              DBW82: 0,
              DBW84: 0,
              DBW86: 0,
              DBW394: 0, // DBW394调试值：0
              DBB160: 'HF800SR-1-H                   ',
              DBB190: '83048880004868800784          ',
              DBB220: 'HF800SR-1-H                   ',
              DBB250: '83048880004868800784          ',
              DBB280: 'HF800SR-1-H                   '
            },
            writeStrArr.toString()
          );
        } else {
          mainWindow.webContents.send(
            'receivedMsg',
            {
              DBW0: 1,
              DBW6: 0,
              DBW8: 35580,
              DBW10: 512,
              DBW12: -1793,
              DBW14: 0,
              DBW16: 0,
              DBW28: 0,
              DBW30: 0,
              DBW34: 0,
              DBW36: 0,
              DBW38: 0,
              DBW40: 0,
              DBW42: 0,
              DBW44: 0,
              DBW46: 0,
              DBW48: 0,
              DBW50: 0,
              DBW64: 0,
              DBW66: 0,
              DBW70: 0,
              DBW74: 0,
              DBW78: 0,
              DBW82: 0,
              DBW84: 0,
              DBW86: 0,
              DBW394: 32, // DBW394调试值：0x0020 (32)
              DBB160: 'HF800SR-1-H                   ',
              DBB190: '83048880004868800784          ',
              DBB220: 'HF800SR-1-H                   ',
              DBB250: '83048880004868800784          ',
              DBB280: 'HF800SR-1-H                   '
            },
            writeStrArr.toString()
          );
        }
        revert = !revert;
      }
    }, 500);
  }
  setAppTray();
  if (process.env.NODE_ENV === 'production') {
    try {
      const javaPath = path.join(
        __static,
        './jre',
        'jre1.8.0_251',
        'bin',
        'java'
      );
      const jarPath = path.join(
        __static,
        './jarlib',
        'ccs-disinfection-changzhou-middle.jar'
      );

      // 优化的Java启动参数
      const javaOpts = [
        // 内存设置
        '-Xmx4096m', // 最大堆内存
        '-Xms4096m', // 初始堆内存
        '-XX:MaxMetaspaceSize=512m', // 最大元空间大小
        '-XX:MetaspaceSize=256m', // 初始元空间大小

        // GC设置
        '-XX:+UseG1GC', // 使用G1垃圾收集器
        '-XX:MaxGCPauseMillis=200', // 最大GC停顿时间
        '-XX:+HeapDumpOnOutOfMemoryError', // 内存溢出时导出堆转储
        '-XX:HeapDumpPath=D://wcs_temp_data/dump', // 堆转储文件路径

        // 性能优化
        '-XX:+DisableExplicitGC', // 禁止显式GC调用
        '-XX:+UseStringDeduplication', // 开启字符串去重
        '-XX:+OptimizeStringConcat', // 优化字符串连接

        // 监控和调试
        '-XX:+PrintGCDetails', // 打印GC详细信息
        '-XX:+PrintGCDateStamps', // 打印GC时间戳
        '-Xloggc:D://wcs_temp_data/log/gc.log', // GC日志文件
        '-XX:+HeapDumpBeforeFullGC', // Full GC前生成堆转储
        '-XX:+PrintGCApplicationStoppedTime', // 打印应用暂停时间

        // 错误处理
        '-XX:+ExitOnOutOfMemoryError', // 发生OOM时退出
        '-XX:ErrorFile=D://wcs_temp_data/log/hs_err_%p.log', // JVM错误日志
        // 编码
        '-Dfile.encoding=UTF-8',
        // 应用参数
        '-jar',
        jarPath
      ];
      // 确保日志目录存在
      const logDir = 'D://wcs_temp_data/log';
      const dumpDir = 'D://wcs_temp_data/dump';
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      if (!fs.existsSync(dumpDir)) {
        fs.mkdirSync(dumpDir, { recursive: true });
      }

      logToFile(`启动Java进程，使用参数: ${javaOpts.join(' ')}`);
      const process = spawn(javaPath, javaOpts);

      process.on('error', (err) => {
        logToFile(`Java程序启动错误: ${err.message}`);
      });

      process.on('exit', (code, signal) => {
        logToFile(`Java程序退出，退出码: ${code}, 信号: ${signal}`);
      });
    } catch (error) {
      logToFile(`Java程序启动异常: ${error.message}`);
    }
  }

  // 开发者工具
  globalShortcut.register('CommandOrControl+L', () => {
    mainWindow.webContents.openDevTools();
  });
  globalShortcut.register('CommandOrControl+F11', () => {
    mainWindow.isFullScreen()
      ? mainWindow.setFullScreen(false)
      : mainWindow.setFullScreen(true);
  });
  // 定义自定义事件
  ipcMain.on('full_screen', function () {
    mainWindow.isFullScreen()
      ? mainWindow.setFullScreen(false)
      : mainWindow.setFullScreen(true);
  });
  // 定义自定义事件 - 优化后的日志写入
  ipcMain.on('writeLogToLocal', (event, arg) => {
    writeLogToLocalOptimized(arg);
  });
});

function conPLC() {
  logger.info('开始连接PLC');
  // 查询配置
  HttpUtil.get('/cssConfig/getConfig')
    .then((res) => {
      logger.info(JSON.stringify(res));
      if (!res.data.plcPort) {
        logger.info('配置查询失败');
        // We have an error. Maybe the PLC is not reachable.
        conPLC();
        return false;
      }
      conn.initiateConnection(
        {
          port: Number(res.data.plcPort),
          host: res.data.plcIp,
          rack: 0,
          slot: 1,
          debug: false
        },
        (err) => {
          if (typeof err !== 'undefined') {
            logger.info('连接PLC失败' + JSON.stringify(err));
            // We have an error. Maybe the PLC is not reachable.
            conPLC();
            return false;
            // process.exit();
          }
          conn.setTranslationCB(function (tag) {
            return variables[tag];
          }); // This sets the "translation" to allow us to work with object names
          logger.info('连接PLC成功');
          // 添加所有需要读取的变量
          conn.addItems([
            'DBW0', // 心跳
            'DBW2', // 输送线当前运行状态
            'DBW4', // 允许进料反馈
            'DBW6', // A线电机运行信号
            'DBW8', // A线光电检测信号
            'DBW10', // B线电机运行信号
            'DBW12', // B线光电检测信号
            'DBW14', // C线电机运行信号
            'DBW16', // C线光电检测信号
            'DBW18', // D线电机运行信号
            'DBW20', // D线光电检测信号
            'DBW22', // E线电机运行信号
            'DBW24', // E线光电检测信号
            'DBW26', // 输送线故障反馈
            'DBW28', // A1-2数量   预热房(前期备用）
            'DBW30', // A1-3数量    预热房(前期备用）
            'DBW32', // A2-1-进货 数量   灭菌柜     (前期备用）
            'DBW34', // A3-1数量    解析房(前期备用）
            'DBW36', // A3-2数量   解析放 (前期备用）
            'DBW38', // A1-5数量   预热房（本次开始）
            'DBW40', // A1-6数量   预热房
            'DBW42', // A2-2-进货 数量   灭菌柜
            'DBW44', // A3-4数量   解析房
            'DBW46', // A3-5数量   解析房
            'DBW48', // B1-2数量   预热房
            'DBW50', // B1-3数量    预热房
            'DBW52', // B2-1-进货 数量   灭菌柜
            'DBW54', // B3-1数量    解析房
            'DBW56', // B3-2数量   解析放
            'DBW58', // B1-5数量   预热房
            'DBW60', // B1-6数量   预热房
            'DBW62', // B2-2-进货 数量   灭菌柜
            'DBW64', // B3-4数量   解析房
            'DBW66', // B3-5数量   解析房
            'DBW68', // C1-2数量   预热房
            'DBW70', // C1-3数量    预热房
            'DBW72', // C2-1-进货 数量   灭菌柜
            'DBW74', // C3-1数量    解析房
            'DBW76', // C3-2数量   解析放
            'DBW78', // C1-5数量   预热房
            'DBW80', // C1-6数量   预热房
            'DBW82', // C2-2-进货 数量   灭菌柜
            'DBW84', // C3-4数量   解析房
            'DBW86', // C3-5数量   解析房
            'DBW88', // D1-2数量   预热房
            'DBW90', // D1-3数量    预热房
            'DBW92', // D2-1-进货 数量   灭菌柜
            'DBW94', // D3-1数量    解析房
            'DBW96', // D3-2数量   解析放
            'DBW98', // D1-5数量   预热房
            'DBW100', // D1-6数量   预热房
            'DBW102', // D2-2-进货 数量   灭菌柜
            'DBW104', // D3-4数量   解析房
            'DBW106', // D3-5数量   解析房
            'DBW108', // E1-2数量   预热房
            'DBW110', // E1-3数量    预热房
            'DBW112', // E2-1-进货 数量   灭菌柜
            'DBW114', // E3-1数量    解析房
            'DBW116', // E3-2数量   解析放
            'DBW118', // E1-5数量   预热房
            'DBW120', // E1-6数量   预热房
            'DBW122', // E2-2-进货 数量   灭菌柜
            'DBW124', // E3-4数量   解析房
            'DBW126', // E3-5数量   解析房
            'DBW128', // 上货区请求进货信号
            'DBW134', // 灭菌前1#小车位置值
            'DBW136', // 灭菌后2#小车位置值
            'DBW140', // A2-1-出货 数量
            'DBW142', // A2-2-出货 数量
            'DBW144', // B2-1-出货 数量
            'DBW146', // B2-2-出货 数量
            'DBW148', // C2-1-出货 数量
            'DBW150', // C2-2-出货 数量
            'DBW152', // D2-1-出货 数量
            'DBW154', // D2-2-出货 数量
            'DBW156', // E2-1-出货 数量
            'DBW158', // E2-2-出货 数量
            'DBW160', // 预热、灭菌完成信号
            'DBW162', // 解析完成信号
            'DBB200', // A1-1上货码
            'DBB230', // A1-4上货码
            'DBB260', // B1-1上货码
            'DBB290', // B1-4上货码
            'DBB320', // C1-1上货码
            'DBB350', // C1-4上货码
            'DBB380', // D1-1上货码
            'DBB410', // D1-4上货码
            'DBB440', // E1-1上货码
            'DBB470', // E1-4上货码
            'DBW500', // 1#预热上线故障
            'DBW502', // 1-1#预热线体故障
            'DBW504', // 1-2#预热线体故障
            'DBW506', // 1#灭菌线体故障
            'DBW508', // 1-1#解析线体故障
            'DBW510', // 1-2#解析线体故障
            'DBW512', // 1-2#解析下线故障
            'DBW514', // 2-1-1#上线故障
            'DBW516', // 2-1-2#上线故障
            'DBW518', // 2-1-1#预热线体故障
            'DBW520', // 2-1-2#预热线体故障
            'DBW522', // 2-2-1#预热线体故障
            'DBW524', // 2-2-2#预热线体故障
            'DBW526', // 2-1#灭菌线体故障
            'DBW528', // 2-2#灭菌线体故障
            'DBW530', // 2-1-1#解析线体故障
            'DBW532', // 2-1-2#解析线体故障
            'DBW534', // 2-2-1#解析线体故障
            'DBW536', // 2-2-2#解析线体故障
            'DBW538', // 2-2-1#解析下线故障
            'DBW540', // 2-2-2#解析下线故障
            'DBW542', // 3-1-1#上线故障
            'DBW544', // 3-1-2#上线故障
            'DBW546', // 3-1-1#预热线体故障
            'DBW548', // 3-1-2#预热线体故障
            'DBW550', // 3-2-1#预热线体故障
            'DBW552', // 3-2-2#预热线体故障
            'DBW554', // 3-1#灭菌线体故障
            'DBW556', // 3-2#灭菌线体故障
            'DBW558', // 3-1-1#解析线体故障
            'DBW560', // 3-1-2#解析线体故障
            'DBW562', // 3-2-1#解析线体故障
            'DBW564', // 3-2-2#解析线体故障
            'DBW566', // 3-2-1#解析下线故障
            'DBW568', // 3-2-2#解析下线故障
            'DBW570', // 4-1-1#上线故障
            'DBW572', // 4-1-2#上线故障
            'DBW574', // 4-1-1#预热线体故障
            'DBW576', // 4-1-2#预热线体故障
            'DBW578', // 4-2-1#预热线体故障
            'DBW580', // 4-2-2#预热线体故障
            'DBW582', // 4-1#灭菌线体故障
            'DBW584', // 4-2#灭菌线体故障
            'DBW586', // 4-1-1#解析线体故障
            'DBW588', // 4-1-2#解析线体故障
            'DBW590', // 4-2-1#解析线体故障
            'DBW592', // 4-2-2#解析线体故障
            'DBW594', // 4-2-1#解析下线故障
            'DBW596', // 4-2-2#解析下线故障
            'DBW598', // 5-1-1#上线故障
            'DBW600', // 5-1-2#上线故障
            'DBW602', // 5-1-1#预热线体故障
            'DBW604', // 5-1-2#预热线体故障
            'DBW606', // 5-2-1#预热线体故障
            'DBW608', // 5-2-2#预热线体故障
            'DBW610', // 5-1#灭菌线体故障
            'DBW612', // 5-2#灭菌线体故障
            'DBW614', // 5-1-1#解析线体故障
            'DBW616', // 5-1-2#解析线体故障
            'DBW618', // 5-2-1#解析线体故障
            'DBW620', // 5-2-2#解析线体故障
            'DBW622', // 5-2-1#解析下线故障
            'DBW624', // 5-2-2#解析下线故障
            'DBW626', // 1#小车故障1
            'DBW628', // 1#小车故障2
            'DBW630', // 2#小车故障1
            'DBW632', // 2#小车故障2
            'DBW634' // 通讯故障 \急停故障
          ]);
          setInterval(() => {
            conn.readAllItems(valuesReady);
          }, 200);
          setInterval(() => {
            // nodes7 代码
            conn.writeItems(writeAddArr, writeStrArr, valuesWritten);
          }, 200);
          // 发送心跳
          sendHeartToPLC();
        }
      );
    })
    .catch((err) => {
      logger.info('config error!');
    });
}
let times = 1;
let nowValue = 0;
function sendHeartToPLC() {
  setInterval(() => {
    if (times > 5) {
      times = 1;
      nowValue = 1 - nowValue;
    }
    times++;
    writeValuesToPLC('DBW1000', nowValue);
  }, 200); // 每200毫秒执行一次交替
}

var variables = {
  DBW0: 'DB101,INT0', // 心跳
  DBW2: 'DB101,INT2', // 输送线当前运行状态
  DBW4: 'DB101,INT4', // 允许进料反馈
  DBW6: 'DB101,INT6', // A线电机运行信号
  DBW8: 'DB101,INT8', // A线光电检测信号
  DBW10: 'DB101,INT10', // B线电机运行信号
  DBW12: 'DB101,INT12', // B线光电检测信号
  DBW14: 'DB101,INT14', // C线电机运行信号
  DBW16: 'DB101,INT16', // C线光电检测信号
  DBW18: 'DB101,INT18', // D线电机运行信号
  DBW20: 'DB101,INT20', // D线光电检测信号
  DBW22: 'DB101,INT22', // E线电机运行信号
  DBW24: 'DB101,INT24', // E线光电检测信号
  DBW26: 'DB101,INT26', // 输送线故障反馈
  DBW28: 'DB101,INT28', // A1-2数量   预热房(前期备用）
  DBW30: 'DB101,INT30', // A1-3数量    预热房(前期备用）
  DBW32: 'DB101,INT32', // A2-1-进货 数量   灭菌柜     (前期备用）
  DBW34: 'DB101,INT34', // A3-1数量    解析房(前期备用）
  DBW36: 'DB101,INT36', // A3-2数量   解析放 (前期备用）
  DBW38: 'DB101,INT38', // A1-5数量   预热房（本次开始）
  DBW40: 'DB101,INT40', // A1-6数量   预热房
  DBW42: 'DB101,INT42', // A2-2-进货 数量   灭菌柜
  DBW44: 'DB101,INT44', // A3-4数量   解析房
  DBW46: 'DB101,INT46', // A3-5数量   解析房
  DBW48: 'DB101,INT48', // B1-2数量   预热房
  DBW50: 'DB101,INT50', // B1-3数量    预热房
  DBW52: 'DB101,INT52', // B2-1-进货 数量   灭菌柜
  DBW54: 'DB101,INT54', // B3-1数量    解析房
  DBW56: 'DB101,INT56', // B3-2数量   解析放
  DBW58: 'DB101,INT58', // B1-5数量   预热房
  DBW60: 'DB101,INT60', // B1-6数量   预热房
  DBW62: 'DB101,INT62', // B2-2-进货 数量   灭菌柜
  DBW64: 'DB101,INT64', // B3-4数量   解析房
  DBW66: 'DB101,INT66', // B3-5数量   解析房
  DBW68: 'DB101,INT68', // C1-2数量   预热房
  DBW70: 'DB101,INT70', // C1-3数量    预热房
  DBW72: 'DB101,INT72', // C2-1-进货 数量   灭菌柜
  DBW74: 'DB101,INT74', // C3-1数量    解析房
  DBW76: 'DB101,INT76', // C3-2数量   解析放
  DBW78: 'DB101,INT78', // C1-5数量   预热房
  DBW80: 'DB101,INT80', // C1-6数量   预热房
  DBW82: 'DB101,INT82', // C2-2-进货 数量   灭菌柜
  DBW84: 'DB101,INT84', // C3-4数量   解析房
  DBW86: 'DB101,INT86', // C3-5数量   解析房
  DBW88: 'DB101,INT88', // D1-2数量   预热房
  DBW90: 'DB101,INT90', // D1-3数量    预热房
  DBW92: 'DB101,INT92', // D2-1-进货 数量   灭菌柜
  DBW94: 'DB101,INT94', // D3-1数量    解析房
  DBW96: 'DB101,INT96', // D3-2数量   解析放
  DBW98: 'DB101,INT98', // D1-5数量   预热房
  DBW100: 'DB101,INT100', // D1-6数量   预热房
  DBW102: 'DB101,INT102', // D2-2-进货 数量   灭菌柜
  DBW104: 'DB101,INT104', // D3-4数量   解析房
  DBW106: 'DB101,INT106', // D3-5数量   解析房
  DBW108: 'DB101,INT108', // E1-2数量   预热房
  DBW110: 'DB101,INT110', // E1-3数量    预热房
  DBW112: 'DB101,INT112', // E2-1-进货 数量   灭菌柜
  DBW114: 'DB101,INT114', // E3-1数量    解析房
  DBW116: 'DB101,INT116', // E3-2数量   解析放
  DBW118: 'DB101,INT118', // E1-5数量   预热房
  DBW120: 'DB101,INT120', // E1-6数量   预热房
  DBW122: 'DB101,INT122', // E2-2-进货 数量   灭菌柜
  DBW124: 'DB101,INT124', // E3-4数量   解析房
  DBW126: 'DB101,INT126', // E3-5数量   解析房
  DBW128: 'DB101,INT128', // 上货区请求进货信号
  DBW134: 'DB101,INT134', // 灭菌前1#小车位置值
  DBW136: 'DB101,INT136', // 灭菌后2#小车位置值
  DBW140: 'DB101,INT140', // A2-1-出货 数量
  DBW142: 'DB101,INT142', // A2-2-出货 数量
  DBW144: 'DB101,INT144', // B2-1-出货 数量
  DBW146: 'DB101,INT146', // B2-2-出货 数量
  DBW148: 'DB101,INT148', // C2-1-出货 数量
  DBW150: 'DB101,INT150', // C2-2-出货 数量
  DBW152: 'DB101,INT152', // D2-1-出货 数量
  DBW154: 'DB101,INT154', // D2-2-出货 数量
  DBW156: 'DB101,INT156', // E2-1-出货 数量
  DBW158: 'DB101,INT158', // E2-2-出货 数量
  DBW160: 'DB101,INT160', // 预热、灭菌完成信号
  DBW162: 'DB101,INT162', // 解析完成信号
  DBB200: 'DB101,C200.30', // A1-1上货码
  DBB230: 'DB101,C230.30', // A1-4上货码
  DBB260: 'DB101,C260.30', // B1-1上货码
  DBB290: 'DB101,C290.30', // B1-4上货码
  DBB320: 'DB101,C320.30', // C1-1上货码
  DBB350: 'DB101,C350.30', // C1-4上货码
  DBB380: 'DB101,C380.30', // D1-1上货码
  DBB410: 'DB101,C410.30', // D1-4上货码
  DBB440: 'DB101,C440.30', // E1-1上货码
  DBB470: 'DB101,C470.30', // E1-4上货码
  DBW1000: 'DB101,INT1000', // WCS看门狗心跳
  DBW1002: 'DB101,INT1002', // WCS-全线启动
  DBW1004: 'DB101,INT1004', // WCS-全线停止
  DBW1006: 'DB101,INT1006', // WCS看门狗心跳
  DBW1008: 'DB101,INT1008', // WCS-故障复位
  DBW1010_BIT0: 'DB101,X1010.0', // A1-1#允许进货信号
  DBW1010_BIT1: 'DB101,X1010.1', // A1-4#允许进货信号
  DBW1010_BIT2: 'DB101,X1010.2', // B1-1#允许进货信号
  DBW1010_BIT3: 'DB101,X1010.3', // B1-4#允许进货信号
  DBW1010_BIT4: 'DB101,X1010.4', // C1-1#允许进货信号
  DBW1010_BIT5: 'DB101,X1010.5', // C1-4#允许进货信号
  DBW1010_BIT6: 'DB101,X1010.6', // D1-1#允许进货信号
  DBW1010_BIT7: 'DB101,X1010.7', // D1-4#允许进货信号
  DBW1010_BIT8: 'DB101,X1011.0', // E1-1#允许进货信号
  DBW1010_BIT9: 'DB101,X1011.1', // E1-4#允许进货信号
  DBW1012: 'DB101,INT1012', // WCS执行出货预热房编号
  DBW1014: 'DB101,INT1014', // WCS执行进货灭菌柜编号
  DBW1016: 'DB101,INT1016', // WCS执行出货灭菌柜编号
  DBW1018: 'DB101,INT1018', // WCS执行进货解析柜编号
  DBW1020: 'DB101,INT1020', // A1-1数量 需进货数量
  DBW1022: 'DB101,INT1022', // A1-4数量 需进货数量
  DBW1024: 'DB101,INT1024', // B1-1数量 需进货数量
  DBW1026: 'DB101,INT1026', // B1-4数量 需进货数量
  DBW1028: 'DB101,INT1028', // C1-1数量 需进货数量
  DBW1030: 'DB101,INT1030', // C1-4数量 需进货数量
  DBW1032: 'DB101,INT1032', // D1-1数量 需进货数量
  DBW1034: 'DB101,INT1034', // D1-4数量 需进货数量
  DBW1036: 'DB101,INT1036', // E1-1数量 需进货数量
  DBW1038: 'DB101,INT1038', // E1-4数量 需进货数量
  DBW1040: 'DB101,INT1040', // 系统模式切换 01：单机模式02：AGV模式
  DBW1042: 'DB101,INT1042', // 灭菌进货需进货数量
  DBW1044: 'DB101,INT1044', // 解析进货需进货数量
  DBW1046: 'DB101,INT1046', // A需出货数量
  DBW1048: 'DB101,INT1048', // B需出货数量
  DBW1050: 'DB101,INT1050', // C需出货数量
  DBW1052: 'DB101,INT1052', // D需出货数量
  DBW1054: 'DB101,INT1054', // E需出货数量
  DBW1056_BIT0: 'DB101,X1056.0', // A3-2#允许出货信号
  DBW1056_BIT1: 'DB101,X1056.1', // A3-5#允许出货信号
  DBW1056_BIT2: 'DB101,X1056.2', // B3-2#允许出货信号
  DBW1056_BIT3: 'DB101,X1056.3', // B3-5#允许出货信号
  DBW1056_BIT4: 'DB101,X1056.4', // C3-2#允许出货信号
  DBW1056_BIT5: 'DB101,X1056.5', // C3-5#允许出货信号
  DBW1056_BIT6: 'DB101,X1056.6', // D3-2#允许出货信号
  DBW1056_BIT7: 'DB101,X1056.7', // D3-5#允许出货信号
  DBW1056_BIT8: 'DB101,X1057.0', // E3-2#允许出货信号
  DBW1056_BIT9: 'DB101,X1057.1', // E3-5#允许出货信号
  DBW500: 'DB101,INT500', // 1#预热上线故障
  DBW502: 'DB101,INT502', // 1-1#预热线体故障
  DBW504: 'DB101,INT504', // 1-2#预热线体故障
  DBW506: 'DB101,INT506', // 1#灭菌线体故障
  DBW508: 'DB101,INT508', // 1-1#解析线体故障
  DBW510: 'DB101,INT510', // 1-2#解析线体故障
  DBW512: 'DB101,INT512', // 1-2#解析下线故障
  DBW514: 'DB101,INT514', // 2-1-1#上线故障
  DBW516: 'DB101,INT516', // 2-1-2#上线故障
  DBW518: 'DB101,INT518', // 2-1-1#预热线体故障
  DBW520: 'DB101,INT520', // 2-1-2#预热线体故障
  DBW522: 'DB101,INT522', // 2-2-1#预热线体故障
  DBW524: 'DB101,INT524', // 2-2-2#预热线体故障
  DBW526: 'DB101,INT526', // 2-1#灭菌线体故障
  DBW528: 'DB101,INT528', // 2-2#灭菌线体故障
  DBW530: 'DB101,INT530', // 2-1-1#解析线体故障
  DBW532: 'DB101,INT532', // 2-1-2#解析线体故障
  DBW534: 'DB101,INT534', // 2-2-1#解析线体故障
  DBW536: 'DB101,INT536', // 2-2-2#解析线体故障
  DBW538: 'DB101,INT538', // 2-2-1#解析下线故障
  DBW540: 'DB101,INT540', // 2-2-2#解析下线故障
  DBW542: 'DB101,INT542', // 3-1-1#上线故障
  DBW544: 'DB101,INT544', // 3-1-2#上线故障
  DBW546: 'DB101,INT546', // 3-1-1#预热线体故障
  DBW548: 'DB101,INT548', // 3-1-2#预热线体故障
  DBW550: 'DB101,INT550', // 3-2-1#预热线体故障
  DBW552: 'DB101,INT552', // 3-2-2#预热线体故障
  DBW554: 'DB101,INT554', // 3-1#灭菌线体故障
  DBW556: 'DB101,INT556', // 3-2#灭菌线体故障
  DBW558: 'DB101,INT558', // 3-1-1#解析线体故障
  DBW560: 'DB101,INT560', // 3-1-2#解析线体故障
  DBW562: 'DB101,INT562', // 3-2-1#解析线体故障
  DBW564: 'DB101,INT564', // 3-2-2#解析线体故障
  DBW566: 'DB101,INT566', // 3-2-1#解析下线故障
  DBW568: 'DB101,INT568', // 3-2-2#解析下线故障
  DBW570: 'DB101,INT570', // 4-1-1#上线故障
  DBW572: 'DB101,INT572', // 4-1-2#上线故障
  DBW574: 'DB101,INT574', // 4-1-1#预热线体故障
  DBW576: 'DB101,INT576', // 4-1-2#预热线体故障
  DBW578: 'DB101,INT578', // 4-2-1#预热线体故障
  DBW580: 'DB101,INT580', // 4-2-2#预热线体故障
  DBW582: 'DB101,INT582', // 4-1#灭菌线体故障
  DBW584: 'DB101,INT584', // 4-2#灭菌线体故障
  DBW586: 'DB101,INT586', // 4-1-1#解析线体故障
  DBW588: 'DB101,INT588', // 4-1-2#解析线体故障
  DBW590: 'DB101,INT590', // 4-2-1#解析线体故障
  DBW592: 'DB101,INT592', // 4-2-2#解析线体故障
  DBW594: 'DB101,INT594', // 4-2-1#解析下线故障
  DBW596: 'DB101,INT596', // 4-2-2#解析下线故障
  DBW598: 'DB101,INT598', // 5-1-1#上线故障
  DBW600: 'DB101,INT600', // 5-1-2#上线故障
  DBW602: 'DB101,INT602', // 5-1-1#预热线体故障
  DBW604: 'DB101,INT604', // 5-1-2#预热线体故障
  DBW606: 'DB101,INT606', // 5-2-1#预热线体故障
  DBW608: 'DB101,INT608', // 5-2-2#预热线体故障
  DBW610: 'DB101,INT610', // 5-1#灭菌线体故障
  DBW612: 'DB101,INT612', // 5-2#灭菌线体故障
  DBW614: 'DB101,INT614', // 5-1-1#解析线体故障
  DBW616: 'DB101,INT616', // 5-1-2#解析线体故障
  DBW618: 'DB101,INT618', // 5-2-1#解析线体故障
  DBW620: 'DB101,INT620', // 5-2-2#解析线体故障
  DBW622: 'DB101,INT622', // 5-2-1#解析下线故障
  DBW624: 'DB101,INT624', // 5-2-2#解析下线故障
  DBW626: 'DB101,INT626', // 1#小车故障1
  DBW628: 'DB101,INT628', // 1#小车故障2
  DBW630: 'DB101,INT630', // 2#小车故障1
  DBW632: 'DB101,INT632', // 2#小车故障2
  DBW634: 'DB101,INT634', // 通讯故障 \急停故障
  // 预热完成复位按钮
  DBW1058_BIT0: 'DB101,X1058.0', // 1#预热1线预热完成复位
  DBW1058_BIT1: 'DB101,X1058.1', // 1#预热2线预热完成复位
  DBW1058_BIT2: 'DB101,X1058.2', // 2#预热1线预热完成复位
  DBW1058_BIT3: 'DB101,X1058.3', // 2#预热2线预热完成复位
  DBW1058_BIT4: 'DB101,X1058.4', // 3#预热1线预热完成复位
  DBW1058_BIT5: 'DB101,X1058.5', // 3#预热2线预热完成复位
  DBW1058_BIT6: 'DB101,X1058.6', // 4#预热1线预热完成复位
  DBW1058_BIT7: 'DB101,X1058.7', // 4#预热2线预热完成复位
  DBW1058_BIT8: 'DB101,X1059.0', // 5#预热1线预热完成复位
  DBW1058_BIT9: 'DB101,X1059.1', // 5#预热2线预热完成复位
  // 灭菌完成复位按钮
  DBW1060_BIT0: 'DB101,X1060.0', // 1#灭菌完成复位
  DBW1060_BIT1: 'DB101,X1060.1', // 2#灭菌完成复位
  DBW1060_BIT2: 'DB101,X1060.2', // 3#灭菌完成复位
  DBW1060_BIT3: 'DB101,X1060.3', // 4#灭菌完成复位
  DBW1060_BIT4: 'DB101,X1060.4', // 5#灭菌完成复位
  // 解析完成复位按钮
  DBW1062_BIT0: 'DB101,X1062.0', // 1#解析1线解析完成复位
  DBW1062_BIT1: 'DB101,X1062.1', // 1#解析2线解析完成复位
  DBW1062_BIT2: 'DB101,X1062.2', // 2#解析1线解析完成复位
  DBW1062_BIT3: 'DB101,X1062.3', // 2#解析2线解析完成复位
  DBW1062_BIT4: 'DB101,X1062.4', // 3#解析1线解析完成复位
  DBW1062_BIT5: 'DB101,X1062.5', // 3#解析2线解析完成复位
  DBW1062_BIT6: 'DB101,X1062.6', // 4#解析1线解析完成复位
  DBW1062_BIT7: 'DB101,X1062.7', // 4#解析2线解析完成复位
  DBW1062_BIT8: 'DB101,X1063.0', // 5#解析1线解析完成复位
  DBW1062_BIT9: 'DB101,X1063.1' // 5#解析2线解析完成复位
};

var writeStrArr = [
  0,
  0,
  0,
  0,
  0,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  false,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
];
var writeAddArr = [
  'DBW1000',
  'DBW1002',
  'DBW1004',
  'DBW1006',
  'DBW1008',
  'DBW1010_BIT0',
  'DBW1010_BIT1',
  'DBW1010_BIT2',
  'DBW1010_BIT3',
  'DBW1010_BIT4',
  'DBW1010_BIT5',
  'DBW1010_BIT6',
  'DBW1010_BIT7',
  'DBW1010_BIT8',
  'DBW1010_BIT9',
  'DBW1020',
  'DBW1022',
  'DBW1024',
  'DBW1026',
  'DBW1028',
  'DBW1030',
  'DBW1032',
  'DBW1034',
  'DBW1036',
  'DBW1038',
  'DBW1040',
  'DBW1056_BIT0',
  'DBW1056_BIT1',
  'DBW1056_BIT2',
  'DBW1056_BIT3',
  'DBW1056_BIT4',
  'DBW1056_BIT5',
  'DBW1056_BIT6',
  'DBW1056_BIT7',
  'DBW1056_BIT8',
  'DBW1056_BIT9'
];

// 给PLC写值
function writeValuesToPLC(add, values) {
  const index = writeAddArr.indexOf(add);
  if (index !== -1) {
    writeStrArr[index] = values;
  } else {
    console.warn(`Address ${add} not found in writeAddArr.`);
  }
}

// 单独给PLC某个变量写值，通过操作批量写入数组实现，避免写入冲突
function writeSingleValueToPLC(add, values) {
  if (!variables[add]) {
    console.warn(`Address ${add} not found in variables.`);
    return;
  }

  // 查找地址在批量写入数组中的索引
  const index = writeAddArr.indexOf(add);

  if (index !== -1) {
    // 地址已存在，直接更新值（这个操作是原子的）
    writeStrArr[index] = values;
    console.log(`更新PLC地址 ${add} 的值为：${values}`);
  } else {
    // 地址不存在，使用原子性操作添加到批量写入数组
    const newAddArr = [...writeAddArr, add];
    const newStrArr = [...writeStrArr, values];

    // 原子性替换数组内容
    writeAddArr.length = 0;
    writeStrArr.length = 0;
    writeAddArr.push(...newAddArr);
    writeStrArr.push(...newStrArr);

    console.log(`添加PLC地址 ${add} 到批量写入数组，值：${values}`);
  }
}

// 取消PLC某个变量的写入，从批量写入数组中移除
function cancelWriteToPLC(add) {
  // 使用 filter 方法重建数组，避免 splice 的并发问题
  const originalLength = writeAddArr.length;
  const newAddArr = [];
  const newStrArr = [];

  for (let i = 0; i < writeAddArr.length; i++) {
    if (writeAddArr[i] !== add) {
      newAddArr.push(writeAddArr[i]);
      newStrArr.push(writeStrArr[i]);
    }
  }

  // 检查是否找到并移除了地址
  if (newAddArr.length === originalLength) {
    console.warn(`Address ${add} not found in writeAddArr, cannot cancel.`);
    return false;
  }

  // 原子性替换数组内容
  writeAddArr.length = 0;
  writeStrArr.length = 0;
  writeAddArr.push(...newAddArr);
  writeStrArr.push(...newStrArr);

  console.log(`已从批量写入数组中移除PLC地址：${add}`);

  // 验证数组长度一致性
  if (writeAddArr.length !== writeStrArr.length) {
    console.error(
      `数组长度不一致！地址数组长度：${writeAddArr.length}，值数组长度：${writeStrArr.length}`
    );
  }

  return true;
}

function valuesWritten(anythingBad) {
  if (anythingBad) {
    console.log('SOMETHING WENT WRONG WRITING VALUES!!!!');
  }
}

function valuesReady(anythingBad, values) {
  if (anythingBad) {
    console.log('SOMETHING WENT WRONG READING VALUES!!!!');
  }
  // console.log(values)
  mainWindow.webContents.send('receivedMsg', values, writeStrArr.toString());
}

const setAppTray = () => {
  // 系统托盘右键菜单
  var trayMenuTemplate = [
    {
      label: '退出',
      click: function () {
        app.quit();
      }
    }
  ];

  // 系统托盘图标目录
  appTray = new Tray(path.join(__static, './icon.ico'));

  // 图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  // 设置此托盘图标的悬停提示内容
  appTray.setToolTip('WCS系统');

  // 设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);

  appTray.on('click', function () {
    //主窗口显示隐藏切换
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
    } else {
      mainWindow.show();
      mainWindow.setSkipTaskbar(false);
    }
  });
};
