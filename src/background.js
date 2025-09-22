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
          // 输送线看门狗心跳
          conn.addItems('DBW0');
          // 输送线当前运行状态
          conn.addItems('DBW2');
          // 允许进料反馈
          conn.addItems('DBW4');
          // A线电机运行信号
          conn.addItems('DBW6');
          // A线光电检测信号
          conn.addItems('DBW8');
          // B线电机运行信号
          conn.addItems('DBW10');
          // B线光电检测信号
          conn.addItems('DBW12');
          // C线电机运行信号
          conn.addItems('DBW14');
          // C线光电检测信号
          conn.addItems('DBW16');
          // D线电机运行信号
          conn.addItems('DBW18');
          // D线光电检测信号
          conn.addItems('DBW20');
          // E线电机运行信号
          conn.addItems('DBW22');
          // E线光电检测信号
          conn.addItems('DBW24');
          // 输送线故障反馈
          conn.addItems('DBW26');
          // 缓存区数量
          conn.addItems('DBW28');
          // 请求上位机下发任务(判断去灭菌还是非灭菌）
          conn.addItems('DBW30');
          // 非灭菌缓存区数量
          conn.addItems('DBW32');
          // A1数量
          conn.addItems('DBW34');
          // A2数量
          conn.addItems('DBW36');
          // A3数量
          conn.addItems('DBW38');
          // B1数量
          conn.addItems('DBW40');
          // B2数量
          conn.addItems('DBW42');
          // B3数量
          conn.addItems('DBW44');
          // C1数量
          conn.addItems('DBW46');
          // C2数量
          conn.addItems('DBW48');
          // C3数量
          conn.addItems('DBW50');
          // D进货数量
          conn.addItems('DBW52');
          // D出货数量
          conn.addItems('DBW54');
          // D请求出货信号
          conn.addItems('DBW56');
          // E进货数量
          conn.addItems('DBW58');
          // E出货数量
          conn.addItems('DBW60');
          // E请求出货信号
          conn.addItems('DBW62');
          // E数量
          conn.addItems('DBW58');
          // 上货区电机运行信号（扫码后入队）
          conn.addItems('DBW64');
          // 上货区输送线光电信号
          conn.addItems('DBW66');
          // 预热前小车电机运行信号1#车
          conn.addItems('DBW68');
          // 预热前小车检测信号1#车
          conn.addItems('DBW70');
          // 灭菌前小车电机运行信号2#车
          conn.addItems('DBW72');
          // 灭菌前小车检测信号2#车
          conn.addItems('DBW74');
          // 解析前小车电机运行信号3#车
          conn.addItems('DBW76');
          // 解析前小车检测信号3#车
          conn.addItems('DBW78');
          // 解析后小车电机运行信号4#车
          conn.addItems('DBW80');
          // 解析后小车检测信号4#车
          conn.addItems('DBW82');
          // 扫码枪处光电信号
          conn.addItems('DBW84');
          // 请求上位机下发任务(预热小车前）
          conn.addItems('DBW86');
          // 预热前1#小车位置值
          conn.addItems('DBW88');
          // 灭菌前2#小车位置值
          conn.addItems('DBW90');
          // 解析出4#小车位置值
          conn.addItems('DBW92');
          // 灭菌前2#小车位置值
          conn.addItems('DBW94');
          // 提升机一楼接货站台扫码数据（托盘号）
          conn.addItems('DBB160');
          // 一楼顶升移栽区扫码数据（扫码后判断方向）（托盘号）
          conn.addItems('DBB190');
          // 提升机二楼接货站台扫码数据（托盘号）
          conn.addItems('DBB220');
          // 提升机三楼接货站台扫码数据（托盘号）
          conn.addItems('DBB250');
          // 提升机四楼接货站台扫码数据（托盘号）
          conn.addItems('DBB280');
          // D扫码
          conn.addItems('DBB310');
          //E扫码
          conn.addItems('DBB340');
          // 报警点位读取
          conn.addItems('DBW370'); // 提升机相关报警
          conn.addItems('DBW372'); // 提升机相关报警
          conn.addItems('DBW374'); // 门安全故障相关报警
          conn.addItems('DBW376'); // 备用报警点位
          conn.addItems('DBW378'); // 链条电机相关报警
          conn.addItems('DBW380'); // 链条电机相关报警
          conn.addItems('DBW382'); // 链条电机相关报警
          conn.addItems('DBW384'); // 预热进口小车相关报警
          conn.addItems('DBW386'); // 预热进口小车相关报警
          conn.addItems('DBW388'); // A1-1预热相关报警
          conn.addItems('DBW390'); // B1-1预热相关报警
          conn.addItems('DBW392'); // C1-1预热相关报警
          conn.addItems('DBW394'); // 预热出小车相关报警
          conn.addItems('DBW396'); // 预热出小车相关报警
          conn.addItems('DBW398'); // A2-1灭菌相关报警
          conn.addItems('DBW400'); // B2-1灭菌相关报警
          conn.addItems('DBW402'); // C2-1灭菌相关报警
          conn.addItems('DBW404'); // 解析进小车相关报警
          conn.addItems('DBW406'); // 解析进小车相关报警
          conn.addItems('DBW408'); // A3-1解析相关报警
          conn.addItems('DBW410'); // B3-1解析相关报警
          conn.addItems('DBW412'); // C3-1解析相关报警
          conn.addItems('DBW414'); // 解析出小车相关报警
          conn.addItems('DBW416'); // 解析出小车相关报警
          conn.addItems('DBW418'); // 立库对接相关报警
          conn.addItems('DBW420'); // D柜相关报警
          conn.addItems('DBW422'); // E柜相关报警
          conn.addItems('DBW424'); // 上货1数量
          conn.addItems('DBW426'); // 上货2数量
          conn.addItems('DBW428'); // 缓存区1数量
          conn.addItems('DBW430'); // 缓存区2数量
          conn.addItems('DBW432'); // 预热、灭菌、解析柜状态
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
    writeValuesToPLC('DBW500', nowValue);
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
  DBW32: 'DB101,INT32', // A2-1数量   灭菌柜     (前期备用） 
  DBW34: 'DB101,INT34', // A3-1数量    解析房(前期备用）
  DBW36: 'DB101,INT36', // A3-2数量   解析放 (前期备用）
  DBW38: 'DB101,INT38', // A1-5数量   预热房（本次开始）
  DBW40: 'DB101,INT40', // A1-6数量   预热房
  DBW42: 'DB101,INT42', // A2-2数量   灭菌柜
  DBW44: 'DB101,INT44', // A1-4数量   解析房
  DBW46: 'DB101,INT46', // A1-5数量   解析房
  DBW48: 'DB101,INT48', // B1-2数量   预热房
  DBW50: 'DB101,INT50', // B1-3数量    预热房
  DBW52: 'DB101,INT52', // B2-1数量   灭菌柜
  DBW54: 'DB101,INT54', // B3-1数量    解析房
  DBW56: 'DB101,INT56', // B3-2数量   解析放  
  DBW58: 'DB101,INT58', // B1-5数量   预热房
  DBW60: 'DB101,INT60', // B1-6数量   预热房
  DBW62: 'DB101,INT62', // B2-2数量   灭菌柜
  DBW64: 'DB101,INT64', // B1-4数量   解析房
  DBW66: 'DB101,INT66', // B1-5数量   解析房
  DBW68: 'DB101,INT68', // C1-2数量   预热房
  DBW70: 'DB101,INT70', // C1-3数量    预热房
  DBW72: 'DB101,INT72', // C2-1数量   灭菌柜
  DBW74: 'DB101,INT74', // C3-1数量    解析房
  DBW76: 'DB101,INT76', // C3-2数量   解析放
  DBW78: 'DB101,INT78', // C1-5数量   预热房
  DBW80: 'DB101,INT80', // C1-6数量   预热房
  DBW82: 'DB101,INT82', // C2-2数量   灭菌柜
  DBW84: 'DB101,INT84', // C1-4数量   解析房
  DBW86: 'DB101,INT86', // C1-5数量   解析房
  DBW88: 'DB101,INT88', // D1-2数量   预热房
  DBW90: 'DB101,INT90', // D1-3数量    预热房
  DBW92: 'DB101,INT92', // D2-1数量   灭菌柜
  DBW94: 'DB101,INT94', // D3-1数量    解析房
  DBW96: 'DB101,INT96', // D3-2数量   解析放
  DBW98: 'DB101,INT98', // D1-5数量   预热房
  DBW100: 'DB101,INT100', // D1-6数量   预热房
  DBW102: 'DB101,INT102', // D2-2数量   灭菌柜
  DBW104: 'DB101,INT104', // D1-4数量   解析房
  DBW106: 'DB101,INT106', // D1-5数量   解析房
  DBW108: 'DB101,INT108', // E1-2数量   预热房
  DBW110: 'DB101,INT110', // E1-3数量    预热房
  DBW112: 'DB101,INT112', // E2-1数量   灭菌柜
  DBW114: 'DB101,INT114', // E3-1数量    解析房
  DBW116: 'DB101,INT116', // E3-2数量   解析放
  DBW118: 'DB101,INT118', // E1-5数量   预热房
  DBW120: 'DB101,INT120', // E1-6数量   预热房
  DBW122: 'DB101,INT122', // E2-2数量   灭菌柜
  DBW124: 'DB101,INT124', // E1-4数量   解析房
  DBW126: 'DB101,INT126', // E1-5数量   解析房
  DBW128: 'DB101,INT128', // 上货区请求进货信号
  DBW134: 'DB101,INT134', // 灭菌前1#小车位置值
  DBW136: 'DB101,INT136', // 灭菌后2#小车位置值
  DBB200: 'DB101,C200.30', // A1-1上货码
  DBB230: 'DB101,C230.30', // A1-4上货码
  DBB260: 'DB101,C260.30', // B1-1上货码
  DBB290: 'DB101,C290.30', // B1-4上货码
  DBB310: 'DB101,C310.30', // C1-1上货码
  DBB340: 'DB101,C340.30', // C1-4上货码
  DBB370: 'DB101,C370.30', // D1-1上货码
  DBB400: 'DB101,C400.30', // D1-4上货码
  DBB430: 'DB101,C430.30', // E1-1上货码
  DBB460: 'DB101,C460.30', // E1-4上货码
  DBW1000: 'DB101,INT1000', // WCS看门狗心跳
  DBW1002: 'DB101,INT1002', // WCS-全线启动
  DBW1004: 'DB101,INT1004', // WCS-全线停止
  DBW1006: 'DB101,INT1006', // WCS看门狗心跳
  DBW1008: 'DB101,INT1008', // WCS-故障复位
  DBW1010_BIT0: 'DB101,X1010.0', // A1-1#允许进货信号
  DBW1010_BIT1: 'DB101,X1010.1', // A1-4#允许进货信号
  DBW1010_BIT2: 'DB101,X1010.2', // B1-1#允许进货信号
  DBW1010_BIT3: 'DB101,X1010.3', // B1-4#允许进货信号
  DBW1010_BIT4: 'DB101,X1010.4', // D1-5#允许进货信号
  DBW1010_BIT5: 'DB101,X1010.5', // C1-1#允许进货信号
  DBW1010_BIT6: 'DB101,X1010.6', // C1-4#允许进货信号
  DBW1010_BIT7: 'DB101,X1010.7', // D1-1#允许进货信号
  DBW1010_BIT8: 'DB101,X1011.0', // D1-4#允许进货信号
  DBW1010_BIT9: 'DB101,X1011.1', // E1-1#允许进货信号
  DBW1010_BIT10: 'DB101,X1011.2', // E1-4#允许进货信号
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
};

var writeStrArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var writeAddArr = [
  'DBW1000',
  'DBW1002',
  'DBW1004',
  'DBW1006',
  'DBW1008',
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
  'DBW1040'
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
