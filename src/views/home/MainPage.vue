<template>
  <div class="smart-workshop">
    <!-- 内容区包装器 -->
    <div class="content-wrapper">
      <!-- 左侧面板 -->
      <div class="side-info-panel">
        <!-- PLC状态与订单信息区域 -->
        <div class="plc-info-section">
          <div class="section-header">当前扫码托盘信息</div>
          <div class="scrollable-content" style="margin-top: 5px">
            <div class="status-overview">
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop granient-text">
                    订单id
                  </div>
                  <div
                    class="data-card-border-borderDown"
                    style="font-size: 1.3vw"
                  >
                    {{ nowScanTrayInfo.orderId || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">产品名称</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.productName || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">当前进货口</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.inPut || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">是否消毒</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.isTerile || '--' }}
                  </div>
                </div>
              </div>
              <!-- <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">物料编号</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.productCode || '--' }}
                  </div>
                </div>
              </div>
              <div class="data-card">
                <div class="data-card-border">
                  <div class="data-card-border-borderTop">备注</div>
                  <div class="data-card-border-borderDown">
                    {{ nowScanTrayInfo.batchNo || '--' }}
                  </div>
                </div>
              </div> -->
            </div>
          </div>
        </div>

        <!-- 订单设置卡片区域 -->
        <div class="production-cards-section">
          <div class="section-header">
            <span>订单设置</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="showOrderQueryDialog"
            >
              查询历史订单
            </el-button>
          </div>
          <div class="production-cards">
            <div
              v-for="line in productionLines"
              :key="line.id"
              class="production-card"
              :class="{ 'has-order': line.currentOrder }"
            >
              <!-- 左边：生产线标识 -->
              <div class="line-identifier">
                <span class="line-letter">{{ line.letter }}</span>
              </div>

              <!-- 中间：订单信息或设置按钮 -->
              <div class="order-section">
                <div v-if="line.currentOrder" class="order-info">
                  <div class="order-header">
                    <span class="order-id">{{
                      line.currentOrder.orderId
                    }}</span>
                    <span class="order-status running">
                      <i class="el-icon-loading"></i>
                      执行中
                    </span>
                  </div>
                  <div class="order-details">
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">产品名称</span>
                        <span class="info-value">{{
                          line.currentOrder.productName
                        }}</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="info-item">
                        <span class="info-label">进货口</span>
                        <span class="info-value">{{
                          getInputText(line.currentOrder.inPut)
                        }}</span>
                      </div>
                      <div class="info-item">
                        <span class="info-label">出货口</span>
                        <span class="info-value">{{
                          getOutputText(line.currentOrder.isPrint3)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-order">
                  <el-button
                    type="primary"
                    size="small"
                    @click="showOrderDialog(line)"
                    icon="el-icon-plus"
                  >
                    设置订单
                  </el-button>
                </div>
              </div>

              <!-- 右边：允许上货复选框 -->
              <div class="allow-loading">
                <el-checkbox
                  v-model="line.allowLoading"
                  @change="onAllowLoadingChange(line)"
                >
                  允许上货
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="operation-panel">
          <div class="section-header">
            <span>操作区</span>
          </div>
          <div class="operation-buttons">
            <button
              @click="toggleButtonState('start')"
              :class="{ pressed: buttonStates.start }"
            >
              <i class="el-icon-switch-button"></i><span>全线启动</span>
            </button>
            <button
              @click="toggleButtonState('stop')"
              :class="{ pressed: buttonStates.stop }"
            >
              <i class="el-icon-error"></i><span>全线停止</span>
            </button>
            <button
              v-show="false"
              @click="toggleButtonState('reset')"
              :class="{ pressed: buttonStates.reset }"
            >
              <i class="el-icon-video-pause"></i><span>全线暂停</span>
            </button>
            <button @click="toggleButtonState('fault_reset')">
              <i class="el-icon-refresh"></i><span>故障复位</span>
            </button>
            <button @click="toggleButtonState('clear')">
              <i class="el-icon-delete"></i><span>全线清空</span>
            </button>
          </div>
        </div>

        <!-- 日志区域 -->
        <div class="log-section">
          <div class="section-header">
            日志区
            <div class="log-tabs">
              <div
                class="log-tab"
                :class="{ active: activeLogType === 'running' }"
                @click="activeLogType = 'running'"
              >
                运行日志
              </div>
              <div
                class="log-tab"
                :class="{ active: activeLogType === 'alarm' }"
                @click="switchToAlarmLog"
              >
                报警日志
                <div v-if="unreadAlarms > 0" class="alarm-badge">
                  {{ unreadAlarms }}
                </div>
              </div>
            </div>
          </div>
          <div class="scrollable-content">
            <div class="log-list">
              <template v-if="currentLogs.length > 0">
                <div
                  v-for="log in currentLogs"
                  :key="log.id"
                  :class="[
                    'log-item',
                    { alarm: log.type === 'alarm', unread: log.unread }
                  ]"
                >
                  <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                  <div class="log-item-content">{{ log.message }}</div>
                </div>
              </template>
              <div v-else class="empty-state">
                <i class="el-icon-chat-line-square"></i>
                <p>
                  {{
                    activeLogType === 'running'
                      ? '暂无运行日志'
                      : '暂无报警日志'
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧内容区域 -->
      <div class="main-content">
        <div class="floor-container">
          <!-- 左侧区域 -->
          <div class="floor-left">
            <div class="floor-title">
              <i class="el-icon-office-building"></i> 作业区域
            </div>
            <div class="floor-image-container">
              <div class="image-wrapper">
                <img
                  src="@/assets/pingan-wenjian-img/image.png"
                  alt="一楼平面图"
                  class="floor-image"
                  @load="updateMarkerPositions"
                />
                <!-- 修改队列标识 -->
                <div
                  v-for="marker in queueMarkers"
                  :key="marker.id"
                  class="queue-marker"
                  :style="
                    marker.name.includes('进') || marker.name.includes('出')
                      ? 'width: 75px'
                      : 'width: 60px'
                  "
                  :data-x="marker.x"
                  :data-y="marker.y"
                  @click="handleQueueMarkerClick(marker.queueId)"
                >
                  <div class="queue-marker-content">
                    <span class="queue-marker-name">{{ marker.name }}</span>
                    <span class="queue-marker-count"
                      >({{ quantityByQueueId[marker.queueId] || 0 }})</span
                    >
                  </div>
                </div>
                <!-- 修改小车元素 -->
                <div
                  v-for="cart in carts"
                  :key="cart.name"
                  class="cart-container"
                  :data-x="cart.x"
                  :data-y="cart.y"
                  :data-width="cart.width"
                >
                  <img :src="cart.image" :alt="cart.name" class="cart-image" />
                </div>
                <!-- A线电机运行信号 -->
                <div
                  class="motor-marker label-left"
                  :class="{ running: aLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">A1-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit4 === '1' }"
                  data-x="400"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">A1-5#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit5 === '1' }"
                  data-x="860"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">A1-6#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit9 === '1' }"
                  data-x="2070"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">A3-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit10 === '1' }"
                  data-x="2530"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">A3-5#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: aLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">A3-6#</div>
                </div>
                <!-- A线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="150"
                  data-y="423"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">A1-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="180"
                  data-y="385"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">A1-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="620"
                  data-y="423"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">A1-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="1100"
                  data-y="423"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">A1-8#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit12 === '1' }"
                  data-x="1830"
                  data-y="423"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit12')"
                >
                  <div class="marker-label">A3-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit13 === '1' }"
                  data-x="2310"
                  data-y="423"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit13')"
                >
                  <div class="marker-label">A3-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit14 === '1' }"
                  data-x="2750"
                  data-y="385"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit14')"
                >
                  <div class="marker-label">A3-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit15 === '1' }"
                  data-x="2785"
                  data-y="423"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit15')"
                >
                  <div class="marker-label">A3-8#</div>
                </div>
                <!-- B线电机运行信号 -->
                <div
                  class="motor-marker label-left"
                  :class="{ running: bLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">B1-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit1 === '1' }"
                  data-x="400"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">B1-2#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit2 === '1' }"
                  data-x="860"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">B1-3#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: bLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">B1-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit4 === '1' }"
                  data-x="400"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">B1-5#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit5 === '1' }"
                  data-x="860"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">B1-6#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit6 === '1' }"
                  data-x="2070"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">B3-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit7 === '1' }"
                  data-x="2530"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">B3-2#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: bLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">B3-3#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit9 === '1' }"
                  data-x="2070"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">B3-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit10 === '1' }"
                  data-x="2530"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">B3-5#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: bLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">B3-6#</div>
                </div>
                <!-- B线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="150"
                  data-y="525"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">B1-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="180"
                  data-y="490"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">B1-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="620"
                  data-y="525"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">B1-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="1100"
                  data-y="525"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">B1-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="150"
                  data-y="572"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">B1-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="180"
                  data-y="605"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">B1-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="620"
                  data-y="572"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">B1-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="1100"
                  data-y="572"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">B1-8#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="1830"
                  data-y="525"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">B3-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="2310"
                  data-y="525"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">B3-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit10 === '1' }"
                  data-x="2750"
                  data-y="490"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit10')"
                >
                  <div class="marker-label">B3-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit11 === '1' }"
                  data-x="2785"
                  data-y="525"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit11')"
                >
                  <div class="marker-label">B3-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit12 === '1' }"
                  data-x="1830"
                  data-y="572"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit12')"
                >
                  <div class="marker-label">B3-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit13 === '1' }"
                  data-x="2310"
                  data-y="572"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit13')"
                >
                  <div class="marker-label">B3-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit14 === '1' }"
                  data-x="2750"
                  data-y="605"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit14')"
                >
                  <div class="marker-label">B3-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit15 === '1' }"
                  data-x="2785"
                  data-y="572"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit15')"
                >
                  <div class="marker-label">B3-8#</div>
                </div>
                <!-- C线电机运行信号 -->
                <div
                  class="motor-marker label-left"
                  :class="{ running: cLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">C1-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit1 === '1' }"
                  data-x="400"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">C1-2#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit2 === '1' }"
                  data-x="860"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">C1-3#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: cLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">C1-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit4 === '1' }"
                  data-x="400"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">C1-5#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit5 === '1' }"
                  data-x="860"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">C1-6#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit6 === '1' }"
                  data-x="2070"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">C3-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit7 === '1' }"
                  data-x="2530"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">C3-2#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: cLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">C3-3#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit9 === '1' }"
                  data-x="2070"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">C3-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: cLineMotorRunning.bit10 === '1' }"
                  data-x="2530"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">C3-5#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: cLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">C3-6#</div>
                </div>
                <!-- C线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="150"
                  data-y="673"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">C1-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="180"
                  data-y="640"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">C1-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="620"
                  data-y="673"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">C1-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="1100"
                  data-y="673"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">C1-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="150"
                  data-y="718"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">C1-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="180"
                  data-y="753"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">C1-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="620"
                  data-y="718"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">C1-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="1100"
                  data-y="718"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">C1-8#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="1830"
                  data-y="673"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">C3-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="2310"
                  data-y="673"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">C3-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit10 === '1' }"
                  data-x="2750"
                  data-y="640"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit10')"
                >
                  <div class="marker-label">C3-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit11 === '1' }"
                  data-x="2785"
                  data-y="673"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit11')"
                >
                  <div class="marker-label">C3-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit12 === '1' }"
                  data-x="1830"
                  data-y="718"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit12')"
                >
                  <div class="marker-label">C3-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit13 === '1' }"
                  data-x="2310"
                  data-y="718"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit13')"
                >
                  <div class="marker-label">C3-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit14 === '1' }"
                  data-x="2750"
                  data-y="753"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit14')"
                >
                  <div class="marker-label">C3-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: cLinePhotoelectricSignal.bit15 === '1' }"
                  data-x="2785"
                  data-y="718"
                  @click="toggleBitValue(cLinePhotoelectricSignal, 'bit15')"
                >
                  <div class="marker-label">C3-8#</div>
                </div>
                <!-- D线电机运行信号 -->
                <div
                  class="motor-marker label-left"
                  :class="{ running: dLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">D1-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit1 === '1' }"
                  data-x="400"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">D1-2#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit2 === '1' }"
                  data-x="860"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">D1-3#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: dLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">D1-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit4 === '1' }"
                  data-x="400"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">D1-5#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit5 === '1' }"
                  data-x="860"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">D1-6#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit6 === '1' }"
                  data-x="2070"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">D3-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit7 === '1' }"
                  data-x="2530"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">D3-2#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: dLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">D3-3#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit9 === '1' }"
                  data-x="2070"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">D3-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: dLineMotorRunning.bit10 === '1' }"
                  data-x="2530"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">D3-5#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: dLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">D3-6#</div>
                </div>
                <!-- D线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="150"
                  data-y="820"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">D1-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="180"
                  data-y="790"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">D1-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="620"
                  data-y="820"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">D1-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="1100"
                  data-y="820"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">D1-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="150"
                  data-y="867"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">D1-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="180"
                  data-y="900"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">D1-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="620"
                  data-y="867"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">D1-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="1100"
                  data-y="867"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">D1-8#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="1830"
                  data-y="820"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">D3-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="2310"
                  data-y="820"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">D3-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit10 === '1' }"
                  data-x="2750"
                  data-y="790"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit10')"
                >
                  <div class="marker-label">D3-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit11 === '1' }"
                  data-x="2785"
                  data-y="820"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit11')"
                >
                  <div class="marker-label">D3-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit12 === '1' }"
                  data-x="1830"
                  data-y="867"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit12')"
                >
                  <div class="marker-label">D3-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit13 === '1' }"
                  data-x="2310"
                  data-y="867"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit13')"
                >
                  <div class="marker-label">D3-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit14 === '1' }"
                  data-x="2750"
                  data-y="900"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit14')"
                >
                  <div class="marker-label">D3-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: dLinePhotoelectricSignal.bit15 === '1' }"
                  data-x="2785"
                  data-y="867"
                  @click="toggleBitValue(dLinePhotoelectricSignal, 'bit15')"
                >
                  <div class="marker-label">D3-8#</div>
                </div>
                <!-- E线电机运行信号 -->
                <div
                  class="motor-marker label-left"
                  :class="{ running: eLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">E1-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit1 === '1' }"
                  data-x="400"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">E1-2#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit2 === '1' }"
                  data-x="860"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">E1-3#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: eLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">E1-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit4 === '1' }"
                  data-x="400"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">E1-5#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit5 === '1' }"
                  data-x="860"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">E1-6#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit6 === '1' }"
                  data-x="2070"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">E3-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit7 === '1' }"
                  data-x="2530"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">E3-2#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: eLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">E3-3#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit9 === '1' }"
                  data-x="2070"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">E3-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: eLineMotorRunning.bit10 === '1' }"
                  data-x="2530"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">E3-5#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: eLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">E3-6#</div>
                </div>
                <!-- E线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="150"
                  data-y="970"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">E1-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="180"
                  data-y="938"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">E1-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="620"
                  data-y="970"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">E1-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="1100"
                  data-y="970"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">E1-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="150"
                  data-y="1015"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">E1-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="180"
                  data-y="1050"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">E1-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="620"
                  data-y="1015"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">E1-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="1100"
                  data-y="1015"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">E1-8#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="1830"
                  data-y="970"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">E3-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="2310"
                  data-y="970"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">E3-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit10 === '1' }"
                  data-x="2750"
                  data-y="938"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit10')"
                >
                  <div class="marker-label">E3-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit11 === '1' }"
                  data-x="2785"
                  data-y="970"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit11')"
                >
                  <div class="marker-label">E3-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit12 === '1' }"
                  data-x="1830"
                  data-y="1015"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit12')"
                >
                  <div class="marker-label">E3-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit13 === '1' }"
                  data-x="2310"
                  data-y="1015"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit13')"
                >
                  <div class="marker-label">E3-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit14 === '1' }"
                  data-x="2750"
                  data-y="1050"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit14')"
                >
                  <div class="marker-label">E3-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: eLinePhotoelectricSignal.bit15 === '1' }"
                  data-x="2785"
                  data-y="1015"
                  @click="toggleBitValue(eLinePhotoelectricSignal, 'bit15')"
                >
                  <div class="marker-label">E3-8#</div>
                </div>
                <!-- 箭头指示器 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit1 === '1' }"
                  data-x="95"
                  data-y="423"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">A1-4#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit2 === '1' }"
                  data-x="95"
                  data-y="520"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">B1-1#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit3 === '1' }"
                  data-x="95"
                  data-y="575"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">B1-4#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit4 === '1' }"
                  data-x="95"
                  data-y="671"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">C1-1#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit5 === '1' }"
                  data-x="95"
                  data-y="723"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">C1-4#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit6 === '1' }"
                  data-x="95"
                  data-y="820"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">D1-1#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit7 === '1' }"
                  data-x="95"
                  data-y="872"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">D1-4#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit8 === '1' }"
                  data-x="95"
                  data-y="969"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">E1-1#进货</div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: scanPhotoelectricSignal.bit9 === '1' }"
                  data-x="95"
                  data-y="1020"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">E1-4#进货</div>
                </div>
                <!-- 扫码信息汇总卡片 -->
                <div class="marker-with-panel" data-x="1350" data-y="1400">
                  <div
                    class="data-panel upload-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="width: 600px"
                  >
                    <div class="data-panel-header">上货扫码信息面板</div>
                    <div class="data-panel-content">
                      <!-- 按ABCDE分组显示，每行3个分组，两行布局 -->
                      <div class="scan-groups-grid">
                        <!-- 第一行：A B C -->
                        <div class="scan-group-row">
                          <!-- A组 -->
                          <div class="scan-group">
                            <div class="group-header">A线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">A1-4：</span>
                                <span class="scan-value">88888888888</span>
                              </div>
                            </div>
                          </div>
                          <!-- B组 -->
                          <div class="scan-group">
                            <div class="group-header">B线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">B1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">B1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- C组 -->
                          <div class="scan-group">
                            <div class="group-header">C线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">C1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">C1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- 第二行：D E -->
                        <div class="scan-group-row">
                          <!-- D组 -->
                          <div class="scan-group">
                            <div class="group-header">D线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">D1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">D1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- E组 -->
                          <div class="scan-group">
                            <div class="group-header">E线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">E1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">E1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 出库信息卡片 -->
                <div class="marker-with-panel" data-x="2880" data-y="1400">
                  <div
                    class="data-panel download-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="width: 600px"
                  >
                    <div class="data-panel-header">下货扫码信息面板</div>
                    <div class="data-panel-content">
                      <!-- 按ABCDE分组显示，每行3个分组，两行布局 -->
                      <div class="scan-groups-grid">
                        <!-- 第一行：A B C -->
                        <div class="scan-group-row">
                          <!-- A组 -->
                          <div class="scan-group">
                            <div class="group-header">A线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">A1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- B组 -->
                          <div class="scan-group">
                            <div class="group-header">B线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">B1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">B1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- C组 -->
                          <div class="scan-group">
                            <div class="group-header">C线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">C1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">C1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- 第二行：D E -->
                        <div class="scan-group-row">
                          <!-- D组 -->
                          <div class="scan-group">
                            <div class="group-header">D线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">D1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">D1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- E组 -->
                          <div class="scan-group">
                            <div class="group-header">E线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">E1-1：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">E1-4：</span>
                                <span class="scan-value">{{ '--' }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="preheating-room-marker"
                  data-x="650"
                  data-y="195"
                  style="width: 160px"
                >
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">预热房到灭菌柜选择</div>
                    <div class="preheating-room-body">
                      <div style="display: flex; align-items: center">
                        <el-select
                          v-model="disinfectionRoomSelectedFrom"
                          placeholder="预热"
                          size="mini"
                        >
                          <el-option label="不执行" :value="null"></el-option>
                          <el-option label="A" value="A"></el-option>
                          <el-option label="B" value="B"></el-option>
                          <el-option label="C" value="C"></el-option>
                          <el-option label="D" value="D"></el-option>
                          <el-option label="E" value="E"></el-option>
                        </el-select>
                        <span
                          style="font-size: 12px; color: #fff; margin-left: 5px"
                          >到：</span
                        >
                        <el-select
                          v-model="disinfectionRoomSelectedTo"
                          placeholder="灭菌"
                          size="mini"
                        >
                          <el-option label="不执行" :value="null"></el-option>
                          <el-option label="A" value="A"></el-option>
                          <el-option label="B" value="B"></el-option>
                          <el-option label="C" value="C"></el-option>
                          <el-option label="D" value="D"></el-option>
                          <el-option label="E" value="E"></el-option>
                        </el-select>
                      </div>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="sendToDisinfectionRoom"
                        :loading="disinfectionRoomLoading"
                        style="width: 100%"
                        >执行</el-button
                      >
                      <el-button
                        v-if="disinfectionExecuting"
                        type="danger"
                        size="mini"
                        @click="cancelDisinfectionRoom"
                        style="width: 100%; margin-left: 0px"
                        >取消</el-button
                      >
                      <div
                        style="display: flex; align-items: center"
                        v-if="disinfectionTrayCode"
                      >
                        <span
                          style="
                            font-size: 12px;
                            color: #fff;
                            color: greenyellow;
                          "
                          v-if="disinfectionTrayCode"
                          >执行中：{{ disinfectionTrayCode }}</span
                        >
                      </div>
                      <div style="font-size: 12px; color: #9fe3d3">
                        需进货：<b>{{ disinfectionNeedQty }}</b>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="preheating-room-marker"
                  data-x="1480"
                  data-y="195"
                  style="width: 160px"
                >
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">灭菌柜到解析房选择</div>
                    <div class="preheating-room-body">
                      <div style="display: flex; align-items: center">
                        <el-select
                          v-model="warehouseSelectedFrom"
                          placeholder="灭菌"
                          size="mini"
                        >
                          <el-option label="不执行" :value="null"></el-option>
                          <el-option label="A" value="A"></el-option>
                          <el-option label="B" value="B"></el-option>
                          <el-option label="C" value="C"></el-option>
                          <el-option label="D" value="D"></el-option>
                          <el-option label="E" value="E"></el-option>
                        </el-select>
                        <span
                          style="font-size: 12px; color: #fff; margin-left: 5px"
                          >到：</span
                        >
                        <el-select
                          v-model="warehouseSelectedTo"
                          placeholder="解析"
                          size="mini"
                        >
                          <el-option label="不执行" :value="null"></el-option>
                          <el-option label="A" value="A"></el-option>
                          <el-option label="B" value="B"></el-option>
                          <el-option label="C" value="C"></el-option>
                          <el-option label="D" value="D"></el-option>
                          <el-option label="E" value="E"></el-option>
                        </el-select>
                      </div>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="sendDisinfectionRoomToWarehouse"
                        :loading="analysisRoomLoading"
                        style="width: 100%"
                        >执行</el-button
                      >
                      <el-button
                        v-if="analysisExecuting"
                        type="danger"
                        size="mini"
                        @click="cancelAnalysisRoom"
                        style="width: 100%; margin-left: 0px"
                        >取消</el-button
                      >
                      <div
                        style="display: flex; align-items: center"
                        v-if="analysisTrayCode"
                      >
                        <span
                          style="
                            font-size: 12px;
                            color: #fff;
                            color: greenyellow;
                          "
                          v-if="analysisTrayCode"
                          >执行中：{{ analysisTrayCode }}</span
                        >
                      </div>
                      <div style="font-size: 12px; color: #9fe3d3">
                        需进货：<b>{{ analysisNeedQty }}</b>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="preheating-room-marker" data-x="2300" data-y="195">
                  <div class="preheating-room-content">
                    <div class="preheating-room-header">出库选择</div>
                    <div class="preheating-room-body">
                      <el-select
                        v-model="outWarehouseSelected"
                        placeholder="选择"
                        size="mini"
                      >
                        <el-option label="不执行" :value="null"></el-option>
                        <el-option label="A" value="A"></el-option>
                        <el-option label="B" value="B"></el-option>
                        <el-option label="C" value="C"></el-option>
                        <el-option label="D" value="D"></el-option>
                        <el-option label="E" value="E"></el-option>
                      </el-select>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="sendToWarehouse"
                        :loading="outWarehouseLoading"
                        style="width: 100%"
                        >执行</el-button
                      >
                      <el-button
                        v-if="outWarehouseExecuting"
                        type="danger"
                        size="mini"
                        @click="cancelOutWarehouse"
                        style="width: 100%; margin-left: 0px"
                        >取消</el-button
                      >
                      <span
                        style="font-size: 12px; color: #fff; color: greenyellow"
                        v-if="outWarehouseTrayCode"
                        >执行中：{{ outWarehouseTrayCode }}</span
                      >
                      <div
                        style="margin-top: 4px; font-size: 12px; color: #9fe3d3"
                      >
                        需进货：<b>{{ outNeedQty }}</b>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 无码上货按钮 -->
                <div class="marker-with-button" data-x="480" data-y="1750">
                  <div style="display: flex; align-items: center">
                    <el-button
                      :type="noCodeUpload ? 'success' : 'primary'"
                      size="mini"
                      @click="toggleNoCodeUpload"
                      :icon="
                        noCodeUpload ? 'el-icon-loading' : 'el-icon-setting'
                      "
                    >
                      {{
                        noCodeUpload
                          ? '正在使用无码上货模式'
                          : '设置为无码上货模式'
                      }}
                    </el-button>
                    <!-- 当前运行模式状态显示 -->
                    <div
                      class="mode-status-display"
                      style="
                        margin-left: 10px;
                        font-weight: bold;
                        color: #f56c6c;
                        font-size: 20px;
                        white-space: nowrap;
                      "
                    >
                      <span style="color: #606266">当前运行模式：</span
                      >{{ noCodeUpload ? '无码模式' : '有码模式' }}
                      <!-- 深灰标签 + 红色状态 -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧队列信息区 -->
    <div
      class="side-info-panel-queue"
      :style="{
        width: isQueueExpanded ? '850px' : 'auto',
        height: isQueueExpanded ? 'calc(100% - 40px)' : 'auto'
      }"
    >
      <!-- 队列信息区域 -->
      <div class="queue-section" :class="{ expanded: isQueueExpanded }">
        <div class="section-header">
          <template v-if="isQueueExpanded">
            <div class="header-left">
              <span><i class="el-icon-s-data"></i> 队列信息</span>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-search"
                @click.stop="showTraySearchDialog"
                style="margin-left: 15px"
              >
                检索托盘
              </el-button>
            </div>
            <span
              class="arrow-icon"
              :class="{ 'expanded-arrow': isQueueExpanded }"
              @click="changeQueueExpanded"
              >▼</span
            >
          </template>
          <template v-else>
            <i class="el-icon-s-data" @click="changeQueueExpanded"></i>
          </template>
        </div>
        <div v-if="isQueueExpanded" class="expandable-content-queue">
          <div class="queue-container">
            <!-- 左侧队列列表 -->
            <div class="queue-container-left">
              <div
                v-for="(queue, filteredIndex) in filteredQueues"
                :key="'queue-' + queue.id + '-' + filteredIndex"
                class="queue"
                :class="{ active: selectedQueueIndex === queue.id - 1 }"
                @click="showTrays(queue.id - 1)"
                @dragover.prevent
                @drop="handleDrop(queue.id - 1)"
              >
                <span class="queue-name">{{ queue.queueName }}</span>
                <span class="tray-count">{{
                  queue.trayInfo?.length || 0
                }}</span>
              </div>
            </div>

            <!-- 右侧托盘列表 -->
            <div class="queue-container-right">
              <div class="selected-queue-header" v-if="selectedQueue">
                <h3>{{ selectedQueue.queueName }}</h3>
                <div class="queue-header-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="showAddTrayDialog"
                    :disabled="!selectedQueue"
                    icon="el-icon-plus"
                  >
                    添加托盘
                  </el-button>
                  <span class="tray-total"
                    >托盘数量: {{ selectedQueue.trayInfo?.length || 0 }}</span
                  >
                </div>
              </div>
              <div class="tray-list">
                <template v-if="nowTrays && nowTrays.length > 0">
                  <div
                    v-for="(tray, index) in nowTrays"
                    :key="'tray-' + tray.id + '-' + index"
                    class="tray-item"
                    :class="{
                      dragging: isDragging && draggedTray?.id === tray.id
                    }"
                    draggable="true"
                    @dragstart="
                      handleDragStart($event, tray, selectedQueueIndex)
                    "
                    @dragend="handleDragEnd"
                  >
                    <div class="tray-info">
                      <div class="tray-info-row">
                        <span class="tray-name">{{ tray.name }}</span>
                        <div class="tray-batch-group">
                          <span class="tray-batch">
                            <span>
                              {{
                                tray.isTerile === 1 ? '消毒' : '不消毒'
                              }}</span
                            >
                          </span>
                          <span
                            class="tray-batch"
                            v-if="
                              tray.sendTo &&
                              ['A1', 'B1', 'C1', '缓存区'].includes(
                                selectedQueue.queueName
                              )
                            "
                            >{{
                              ['A1', 'B1', 'C1'].includes(
                                selectedQueue.queueName
                              )
                                ? '预热房位置：'
                                : '预热房发送中：'
                            }}{{ tray.sendTo }}</span
                          >
                          <span
                            class="tray-batch"
                            v-if="tray.sequenceNumber > 0"
                            ><span class="sequence-number"
                              >(序号：{{ tray.sequenceNumber }})</span
                            ></span
                          >
                          <span
                            class="tray-batch"
                            v-if="selectedQueue.queueName == '分发区'"
                            >PLC命令：{{
                              tray.state === '0' ? '未执行' : '已执行'
                            }}</span
                          >
                        </div>
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >订单ID：{{ tray.orderId || '--' }}</span
                        >
                        <span class="tray-detail"
                          >物料编码：{{ tray.productCode || '--' }}</span
                        >
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >产品名称：{{ tray.productName || '--' }}</span
                        >
                        <span class="tray-detail"
                          >规格：{{ tray.unit || '--' }}</span
                        >
                      </div>
                      <div class="tray-info-row">
                        <span class="tray-detail"
                          >备注：{{ tray.batchNo || '--' }}</span
                        >
                      </div>
                      <span class="tray-time">{{ tray.time }}</span>
                    </div>
                    <div class="tray-actions">
                      <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-arrow-up"
                        circle
                        :disabled="index === 0"
                        @click.stop="moveTrayUp(index)"
                        class="move-btn"
                      ></el-button>
                      <el-button
                        type="primary"
                        size="mini"
                        icon="el-icon-arrow-down"
                        circle
                        :disabled="index === nowTrays.length - 1"
                        @click.stop="moveTrayDown(index)"
                        class="move-btn"
                      ></el-button>
                      <el-button
                        type="danger"
                        size="mini"
                        icon="el-icon-delete"
                        circle
                        @click.stop="deleteTray(tray, index)"
                      ></el-button>
                    </div>
                  </div>
                </template>
                <div v-else class="empty-state">
                  <i class="el-icon-box"></i>
                  <p>暂无托盘信息</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 测试面板 -->
    <div class="test-panel-container">
      <!-- 测试按钮 -->
      <div class="test-toggle-btn" @click="showTestPanel = !showTestPanel">
        <i class="el-icon-setting"></i>
      </div>
      <!-- 测试面板 -->
      <div class="test-panel" :class="{ collapsed: !showTestPanel }">
        <div class="test-panel-header">
          <span>测试面板</span>
          <i class="el-icon-close" @click.stop="showTestPanel = false"></i>
        </div>
        <div class="test-panel-content">
          <div class="test-section">
            <span class="test-label">小车位置测试:</span>
            <div class="cart-position-test-container">
              <div class="cart-position-group">
                <div class="cart-position-label">
                  <span>小车1 (0-1010):</span>
                  <span class="cart-value">{{ cartPositionValues.cart1 }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues.cart1"
                    :min="0"
                    :max="1010"
                    :step="1"
                    class="cart-position-slider"
                  ></el-slider>
                </div>
              </div>
              <div class="cart-position-group">
                <div class="cart-position-label">
                  <span>小车2 (0-1010):</span>
                  <span class="cart-value">{{ cartPositionValues.cart2 }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues.cart2"
                    :min="0"
                    :max="1010"
                    :step="1"
                    class="cart-position-slider"
                  ></el-slider>
                </div>
              </div>
            </div>
          </div>
          <!-- 手动数量控制模块 -->
          <div class="test-section">
            <span class="test-label">手动数量控制:</span>
            <div class="quantity-control-container">
              <!-- A线数量控制 -->
              <div class="quantity-line-group">
                <div class="quantity-list">
                  <div
                    class="quantity-item"
                    v-for="(value, key) in aLineQuantity"
                    :key="key"
                  >
                    <span class="quantity-label">{{
                      getSimpleLabel('A', key)
                    }}</span>
                    <div class="quantity-controls">
                      <button
                        class="quantity-btn minus"
                        @click="decreaseQuantity('aLineQuantity', key)"
                      >
                        -
                      </button>
                      <span class="quantity-value">{{ value }}</span>
                      <button
                        class="quantity-btn plus"
                        @click="increaseQuantity('aLineQuantity', key)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- B线数量控制 -->
              <div class="quantity-line-group">
                <div class="quantity-list">
                  <div
                    class="quantity-item"
                    v-for="(value, key) in bLineQuantity"
                    :key="key"
                  >
                    <span class="quantity-label">{{
                      getSimpleLabel('B', key)
                    }}</span>
                    <div class="quantity-controls">
                      <button
                        class="quantity-btn minus"
                        @click="decreaseQuantity('bLineQuantity', key)"
                      >
                        -
                      </button>
                      <span class="quantity-value">{{ value }}</span>
                      <button
                        class="quantity-btn plus"
                        @click="increaseQuantity('bLineQuantity', key)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- C线数量控制 -->
              <div class="quantity-line-group">
                <div class="quantity-list">
                  <div
                    class="quantity-item"
                    v-for="(value, key) in cLineQuantity"
                    :key="key"
                  >
                    <span class="quantity-label">{{
                      getSimpleLabel('C', key)
                    }}</span>
                    <div class="quantity-controls">
                      <button
                        class="quantity-btn minus"
                        @click="decreaseQuantity('cLineQuantity', key)"
                      >
                        -
                      </button>
                      <span class="quantity-value">{{ value }}</span>
                      <button
                        class="quantity-btn plus"
                        @click="increaseQuantity('cLineQuantity', key)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- D线数量控制 -->
              <div class="quantity-line-group">
                <div class="quantity-list">
                  <div
                    class="quantity-item"
                    v-for="(value, key) in dLineQuantity"
                    :key="key"
                  >
                    <span class="quantity-label">{{
                      getSimpleLabel('D', key)
                    }}</span>
                    <div class="quantity-controls">
                      <button
                        class="quantity-btn minus"
                        @click="decreaseQuantity('dLineQuantity', key)"
                      >
                        -
                      </button>
                      <span class="quantity-value">{{ value }}</span>
                      <button
                        class="quantity-btn plus"
                        @click="increaseQuantity('dLineQuantity', key)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- E线数量控制 -->
              <div class="quantity-line-group">
                <div class="quantity-list">
                  <div
                    class="quantity-item"
                    v-for="(value, key) in eLineQuantity"
                    :key="key"
                  >
                    <span class="quantity-label">{{
                      getSimpleLabel('E', key)
                    }}</span>
                    <div class="quantity-controls">
                      <button
                        class="quantity-btn minus"
                        @click="decreaseQuantity('eLineQuantity', key)"
                      >
                        -
                      </button>
                      <span class="quantity-value">{{ value }}</span>
                      <button
                        class="quantity-btn plus"
                        @click="increaseQuantity('eLineQuantity', key)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 订单查询对话框 -->
    <OrderQueryDialog :visible.sync="orderQueryDialogVisible" />

    <!-- 订单选择弹窗 -->
    <el-dialog
      title="选择订单"
      :visible.sync="orderSelectDialogVisible"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="order-select-content">
        <div class="order-table-container" v-if="availableOrders.length > 0">
          <el-table
            :data="availableOrders"
            @row-click="selectOrder"
            highlight-current-row
            stripe
            border
            :current-row="getCurrentRow()"
            style="width: 100%"
            max-height="400"
          >
            <el-table-column
              prop="orderId"
              label="订单号"
              width="120"
              align="center"
            >
              <template slot-scope="{ row }">
                <span class="order-id">{{ row.orderId }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="productName"
              label="产品名称"
              min-width="150"
            >
              <template slot-scope="{ row }">
                <span>{{ row.productName }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="insertTime"
              label="订单时间"
              width="160"
              align="center"
            >
              <template slot-scope="{ row }">
                <span>{{ row.insertTime }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="inPut"
              label="进货口"
              width="100"
              align="center"
            >
              <template slot-scope="{ row }">
                <span>{{ getInputText(row.inPut) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="isPrint3"
              label="出货口"
              width="100"
              align="center"
            >
              <template slot-scope="{ row }">
                <span>{{ getOutputText(row.isPrint3) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template>
                <el-tag type="warning" size="small">待执行</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-else class="empty-state">
          <i class="el-icon-document"></i>
          <p>暂无可用订单</p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="orderSelectDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="confirmOrderSelection"
          :disabled="!selectedOrderId"
        >
          确认选择
        </el-button>
      </div>
    </el-dialog>

    <!-- 管理员密码验证对话框 -->
    <el-dialog
      title="管理员权限验证"
      :visible.sync="adminPasswordDialogVisible"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      append-to-body
    >
      <div class="admin-password-content">
        <el-form
          :model="adminPasswordForm"
          :rules="adminPasswordRules"
          ref="adminPasswordForm"
        >
          <el-form-item label="管理员密码" prop="password" label-width="100px">
            <el-input
              v-model="adminPasswordForm.password"
              type="password"
              placeholder="请输入管理员密码"
              show-password
              @keyup.enter.native="verifyAdminPassword"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdminPassword">取消</el-button>
        <el-button
          type="primary"
          @click="verifyAdminPassword"
          :loading="adminPasswordLoading"
        >
          验证
        </el-button>
      </div>
    </el-dialog>

    <!-- 托盘检索弹窗 -->
    <el-dialog
      title="托盘检索"
      :visible.sync="traySearchDialogVisible"
      width="821px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="tray-search-form">
        <el-form
          :model="traySearchForm"
          ref="traySearchForm"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="托盘号" prop="trayCode">
                <el-input
                  v-model="traySearchForm.trayCode"
                  placeholder="请输入托盘号进行查询"
                  clearable
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单号" prop="orderId">
                <el-input
                  v-model="traySearchForm.orderId"
                  placeholder="请输入订单号进行查询"
                  clearable
                >
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="物料编码" prop="productCode">
                <el-input
                  v-model="traySearchForm.productCode"
                  placeholder="请输入物料编码进行查询"
                  clearable
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="物料名称" prop="productName">
                <el-input
                  v-model="traySearchForm.productName"
                  placeholder="请输入物料名称进行查询"
                  clearable
                >
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 查询结果展示 -->
        <div
          v-if="searchResults && searchResults.length > 0"
          class="search-result"
        >
          <el-divider content-position="left">
            查询结果 (共 {{ searchResults.length }} 个托盘)
          </el-divider>
          <el-table
            :data="searchResults"
            style="width: 100%"
            stripe
            border
            height="300"
            :max-height="300"
          >
            <el-table-column
              prop="trayCode"
              label="托盘号"
              width="180"
              align="center"
            ></el-table-column>
            <el-table-column
              prop="orderId"
              label="订单号"
              width="180"
              align="center"
            >
              <template slot-scope="scope">
                {{ scope.row.orderId || '--' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="productCode"
              label="物料编码"
              width="150"
              align="center"
            >
              <template slot-scope="scope">
                {{ scope.row.productCode || '--' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="productName"
              label="物料名称"
              width="150"
              align="center"
            >
              <template slot-scope="scope">
                {{ scope.row.productName || '--' }}
              </template>
            </el-table-column>
            <el-table-column
              prop="queueName"
              label="当前队列"
              width="120"
              align="center"
            >
              <template slot-scope="scope">
                <span style="color: red; font-weight: bold">{{
                  scope.row.queueName
                }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 无结果提示 -->
        <div
          v-else-if="
            hasSearched && (!searchResults || searchResults.length === 0)
          "
          class="no-result"
        >
          <el-divider content-position="left">查询结果</el-divider>
          <div class="no-result-content">
            <i class="el-icon-warning"></i>
            <p>未找到符合条件的托盘信息</p>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="traySearchDialogVisible = false">关 闭</el-button>
        <el-button type="primary" @click="searchTray" :loading="searchLoading"
          >查 询</el-button
        >
      </div>
    </el-dialog>

    <!-- 添加托盘对话框 -->
    <el-dialog
      title="添加托盘"
      :visible.sync="addTrayDialogVisible"
      width="500px"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="add-tray-form">
        <el-form
          :model="newTrayForm"
          ref="newTrayForm"
          label-width="100px"
          :rules="trayFormRules"
        >
          <el-form-item label="托盘编号" prop="trayCode">
            <el-input
              v-model="newTrayForm.trayCode"
              placeholder="请输入托盘编号"
            ></el-input>
          </el-form-item>
          <el-form-item label="批次号" prop="batchId">
            <el-input
              v-model="newTrayForm.batchId"
              placeholder="请输入批次号"
            ></el-input>
          </el-form-item>
          <el-form-item label="是否灭菌" prop="isSterile">
            <el-switch
              v-model="newTrayForm.isSterile"
              active-text="灭菌"
              inactive-text="不灭菌"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addTrayDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddTray" :loading="isSubmitting"
          >确 定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import HttpUtil from '@/utils/HttpUtil';
import HttpUtilwms from '@/utils/HttpUtilwms';
import moment from 'moment';
import { ipcRenderer } from 'electron';
import OrderQueryDialog from '@/components/OrderQueryDialog.vue';
export default {
  name: 'MonitorScreen',
  components: {
    OrderQueryDialog
  },
  data() {
    return {
      nowScanTrayInfo: {},
      isDataReady: false, // 添加数据准备就绪标志位
      showTestPanel: false,
      orderQueryDialogVisible: false,
      // 生产线卡片相关数据
      productionLines: [
        { id: 1, letter: 'A', currentOrder: null, allowLoading: false },
        { id: 2, letter: 'B', currentOrder: null, allowLoading: false },
        { id: 3, letter: 'C', currentOrder: null, allowLoading: false },
        { id: 4, letter: 'D', currentOrder: null, allowLoading: false },
        { id: 5, letter: 'E', currentOrder: null, allowLoading: false }
      ],
      // 订单选择弹窗相关
      orderSelectDialogVisible: false,
      selectedLine: null,
      selectedOrderId: null,
      availableOrders: [
        {
          orderId: 'ORD001',
          productName: '医疗器械A',
          insertTime: '2024-01-15 10:30:00',
          inPut: '1',
          isPrint3: '1',
          orderStatus: '0'
        },
        {
          orderId: 'ORD002',
          productName: '医疗器械B',
          insertTime: '2024-01-15 11:15:00',
          inPut: '2',
          isPrint3: '0',
          orderStatus: '0'
        },
        {
          orderId: 'ORD003',
          productName: '医疗器械C',
          insertTime: '2024-01-15 12:00:00',
          inPut: '3',
          isPrint3: '2',
          orderStatus: '0'
        },
        {
          orderId: 'ORD004',
          productName: '医疗器械D',
          insertTime: '2024-01-15 13:45:00',
          inPut: '1',
          isPrint3: '1',
          orderStatus: '0'
        },
        {
          orderId: 'ORD005',
          productName: '医疗器械E',
          insertTime: '2024-01-15 14:20:00',
          inPut: '2',
          isPrint3: '0',
          orderStatus: '0'
        }
      ],
      buttonStates: {
        start: false,
        stop: false,
        reset: false,
        fault_reset: false,
        clear: false
      },
      activeLogType: 'running',
      runningLogs: [], // 修改为空数组
      alarmLogs: [], // 修改为空数组
      // 小车y轴范围配置
      cartYRanges: {
        cart1: { min: 387, max: 992 }, // y轴范围615-618
        cart2: { min: 388, max: 994 } // y轴范围310-620
      },
      carts: [
        {
          id: 1,
          name: '小车1',
          x: 1211,
          y: 387, // 对应PLC值0的位置（y轴最小值）
          width: 123,
          image: require('@/assets/pingan-wenjian-img/cart1.png')
        },
        {
          id: 2,
          name: '小车2',
          x: 1773,
          y: 388, // 对应PLC值0的位置（y轴最小值）
          width: 95,
          image: require('@/assets/pingan-wenjian-img/cart2.png')
        }
      ],
      nowTrays: [],
      draggedTray: null,
      dragSourceQueue: null,
      isQueueExpanded: false,
      selectedQueueIndex: 0,
      isDragging: false,
      isRefreshing: false,
      addTrayDialogVisible: false,
      // 托盘检索相关
      traySearchDialogVisible: false,
      searchLoading: false,
      traySearchForm: {
        trayCode: '',
        orderId: '',
        productCode: '',
        productName: ''
      },
      searchResults: [],
      hasSearched: false,
      isSubmitting: false,
      newTrayForm: {
        trayCode: '',
        batchId: '',
        isSterile: true
      },
      trayFormRules: {
        trayCode: [
          { required: true, message: '请输入托盘编号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ],
        batchId: [
          { required: true, message: '请输入批次号', trigger: 'blur' },
          { min: 1, max: 50, message: '长度在 1 到 50 个字符', trigger: 'blur' }
        ]
      },
      queues: [
        {
          id: 1,
          queueName: 'A1-2',
          trayInfo: []
        },
        {
          id: 2,
          queueName: 'A1-3',
          trayInfo: []
        },
        {
          id: 3,
          queueName: 'A2-1-进',
          trayInfo: []
        },
        {
          id: 4,
          queueName: 'A3-1',
          trayInfo: []
        },
        {
          id: 5,
          queueName: 'A3-2',
          trayInfo: []
        },
        {
          id: 6,
          queueName: 'A1-5',
          trayInfo: []
        },
        {
          id: 7,
          queueName: 'A1-6',
          trayInfo: []
        },
        {
          id: 8,
          queueName: 'A2-2-进',
          trayInfo: []
        },
        {
          id: 9,
          queueName: 'A3-4',
          trayInfo: []
        },
        {
          id: 10,
          queueName: 'A3-5',
          trayInfo: []
        },
        {
          id: 11,
          queueName: 'B1-2',
          trayInfo: []
        },
        {
          id: 12,
          queueName: 'B1-3',
          trayInfo: []
        },
        {
          id: 13,
          queueName: 'B2-1-进',
          trayInfo: []
        },
        {
          id: 14,
          queueName: 'B3-1',
          trayInfo: []
        },
        {
          id: 15,
          queueName: 'B3-2',
          trayInfo: []
        },
        {
          id: 16,
          queueName: 'B1-5',
          trayInfo: []
        },
        {
          id: 17,
          queueName: 'B1-6',
          trayInfo: []
        },
        {
          id: 18,
          queueName: 'B2-2-进',
          trayInfo: []
        },
        {
          id: 19,
          queueName: 'B3-4',
          trayInfo: []
        },
        {
          id: 20,
          queueName: 'B3-5',
          trayInfo: []
        },
        {
          id: 21,
          queueName: 'C1-2',
          trayInfo: []
        },
        {
          id: 22,
          queueName: 'C1-3',
          trayInfo: []
        },
        {
          id: 23,
          queueName: 'C2-1-进',
          trayInfo: []
        },
        {
          id: 24,
          queueName: 'C3-1',
          trayInfo: []
        },
        {
          id: 25,
          queueName: 'C3-2',
          trayInfo: []
        },
        {
          id: 26,
          queueName: 'C1-5',
          trayInfo: []
        },
        {
          id: 27,
          queueName: 'C1-6',
          trayInfo: []
        },
        {
          id: 28,
          queueName: 'C2-2-进',
          trayInfo: []
        },
        {
          id: 29,
          queueName: 'C3-4',
          trayInfo: []
        },
        {
          id: 30,
          queueName: 'C3-5',
          trayInfo: []
        },
        {
          id: 31,
          queueName: 'D1-2',
          trayInfo: []
        },
        {
          id: 32,
          queueName: 'D1-3',
          trayInfo: []
        },
        {
          id: 33,
          queueName: 'D2-1-进',
          trayInfo: []
        },
        {
          id: 34,
          queueName: 'D3-1',
          trayInfo: []
        },
        {
          id: 35,
          queueName: 'D3-2',
          trayInfo: []
        },
        {
          id: 36,
          queueName: 'D1-5',
          trayInfo: []
        },
        {
          id: 37,
          queueName: 'D1-6',
          trayInfo: []
        },
        {
          id: 38,
          queueName: 'D2-2-进',
          trayInfo: []
        },
        {
          id: 39,
          queueName: 'D3-4',
          trayInfo: []
        },
        {
          id: 40,
          queueName: 'D3-5',
          trayInfo: []
        },
        {
          id: 41,
          queueName: 'E1-2',
          trayInfo: []
        },
        {
          id: 42,
          queueName: 'E1-3',
          trayInfo: []
        },
        {
          id: 43,
          queueName: 'E2-1-进',
          trayInfo: []
        },
        {
          id: 44,
          queueName: 'E3-1',
          trayInfo: []
        },
        {
          id: 45,
          queueName: 'E3-2',
          trayInfo: []
        },
        {
          id: 46,
          queueName: 'E1-5',
          trayInfo: []
        },
        {
          id: 47,
          queueName: 'E1-6',
          trayInfo: []
        },
        {
          id: 48,
          queueName: 'E2-2-进',
          trayInfo: []
        },
        {
          id: 49,
          queueName: 'E3-4',
          trayInfo: []
        },
        {
          id: 50,
          queueName: 'E3-5',
          trayInfo: []
        },
        {
          id: 51,
          queueName: 'A2-1-出',
          trayInfo: []
        },
        {
          id: 52,
          queueName: 'A2-2-出',
          trayInfo: []
        },
        {
          id: 53,
          queueName: 'B2-1-出',
          trayInfo: []
        },
        {
          id: 54,
          queueName: 'B2-2-出',
          trayInfo: []
        },
        {
          id: 55,
          queueName: 'C2-1-出',
          trayInfo: []
        },
        {
          id: 56,
          queueName: 'C2-2-出',
          trayInfo: []
        },
        {
          id: 57,
          queueName: 'D2-1-出',
          trayInfo: []
        },
        {
          id: 58,
          queueName: 'D2-2-出',
          trayInfo: []
        },
        {
          id: 59,
          queueName: 'E2-1-出',
          trayInfo: []
        },
        {
          id: 60,
          queueName: 'E2-2-出',
          trayInfo: []
        }
      ],
      // 添加队列位置标识数据
      queueMarkers: [
        // { id: 1, name: 'A1-2', queueId: 1, x: 550, y: 180 },
        // { id: 2, name: 'A1-3', queueId: 2, x: 1200, y: 180 },
        // { id: 3, name: 'A2-1-进', queueId: 3, x: 2100, y: 180 },
        // { id: 4, name: 'A3-1', queueId: 4, x: 2870, y: 180 },
        // { id: 5, name: 'A3-2', queueId: 5, x: 3520, y: 180 },
        { id: 6, name: 'A1-5', queueId: 6, x: 520, y: 420 },
        { id: 7, name: 'A1-6', queueId: 7, x: 990, y: 420 },
        { id: 8, name: 'A2-2-进', queueId: 8, x: 1400, y: 420 },
        { id: 9, name: 'A3-4', queueId: 9, x: 2170, y: 420 },
        { id: 10, name: 'A3-5', queueId: 10, x: 2640, y: 420 },
        { id: 11, name: 'B1-2', queueId: 11, x: 520, y: 518 },
        { id: 12, name: 'B1-3', queueId: 12, x: 990, y: 518 },
        { id: 13, name: 'B2-1-进', queueId: 13, x: 1400, y: 518 },
        { id: 14, name: 'B3-1', queueId: 14, x: 2170, y: 518 },
        { id: 15, name: 'B3-2', queueId: 15, x: 2640, y: 518 },
        { id: 16, name: 'B1-5', queueId: 16, x: 520, y: 578 },
        { id: 17, name: 'B1-6', queueId: 17, x: 990, y: 578 },
        { id: 18, name: 'B2-2-进', queueId: 18, x: 1400, y: 578 },
        { id: 19, name: 'B3-4', queueId: 19, x: 2170, y: 578 },
        { id: 20, name: 'B3-5', queueId: 20, x: 2640, y: 578 },
        { id: 21, name: 'C1-2', queueId: 21, x: 520, y: 670 },
        { id: 22, name: 'C1-3', queueId: 22, x: 990, y: 670 },
        { id: 23, name: 'C2-1-进', queueId: 23, x: 1400, y: 670 },
        { id: 24, name: 'C3-1', queueId: 24, x: 2170, y: 670 },
        { id: 25, name: 'C3-2', queueId: 25, x: 2640, y: 670 },
        { id: 26, name: 'C1-5', queueId: 26, x: 520, y: 730 },
        { id: 27, name: 'C1-6', queueId: 27, x: 990, y: 730 },
        { id: 28, name: 'C2-2-进', queueId: 28, x: 1400, y: 730 },
        { id: 29, name: 'C3-4', queueId: 29, x: 2170, y: 730 },
        { id: 30, name: 'C3-5', queueId: 30, x: 2640, y: 730 },
        { id: 31, name: 'D1-2', queueId: 31, x: 520, y: 820 },
        { id: 32, name: 'D1-3', queueId: 32, x: 990, y: 820 },
        { id: 33, name: 'D2-1-进', queueId: 33, x: 1400, y: 820 },
        { id: 34, name: 'D3-1', queueId: 34, x: 2170, y: 820 },
        { id: 35, name: 'D3-2', queueId: 35, x: 2640, y: 820 },
        { id: 36, name: 'D1-5', queueId: 36, x: 520, y: 880 },
        { id: 37, name: 'D1-6', queueId: 37, x: 990, y: 880 },
        { id: 38, name: 'D2-2-进', queueId: 38, x: 1400, y: 880 },
        { id: 39, name: 'D3-4', queueId: 39, x: 2170, y: 880 },
        { id: 40, name: 'D3-5', queueId: 40, x: 2640, y: 880 },
        { id: 41, name: 'E1-2', queueId: 41, x: 520, y: 970 },
        { id: 42, name: 'E1-3', queueId: 42, x: 990, y: 970 },
        { id: 43, name: 'E2-1-进', queueId: 43, x: 1400, y: 970 },
        { id: 44, name: 'E3-1', queueId: 44, x: 2170, y: 970 },
        { id: 45, name: 'E3-2', queueId: 45, x: 2640, y: 970 },
        { id: 46, name: 'E1-5', queueId: 46, x: 520, y: 1030 },
        { id: 47, name: 'E1-6', queueId: 47, x: 990, y: 1030 },
        { id: 48, name: 'E2-2-进', queueId: 48, x: 1400, y: 1030 },
        { id: 49, name: 'E3-4', queueId: 49, x: 2170, y: 1030 },
        { id: 50, name: 'E3-5', queueId: 50, x: 2640, y: 1030 },
        // { id: 51, name: 'A2-1-进', queueId: 51, x: 520, y: 1120 },
        { id: 52, name: 'A2-2-出', queueId: 52, x: 1600, y: 420 },
        { id: 53, name: 'B2-1-出', queueId: 53, x: 1600, y: 518 },
        { id: 54, name: 'B2-2-出', queueId: 54, x: 1600, y: 578 },
        { id: 55, name: 'C2-1-出', queueId: 55, x: 1600, y: 670 },
        { id: 56, name: 'C2-2-出', queueId: 56, x: 1600, y: 730 },
        { id: 57, name: 'D2-1-出', queueId: 57, x: 1600, y: 820 },
        { id: 58, name: 'D2-2-出', queueId: 58, x: 1600, y: 880 },
        { id: 59, name: 'E2-1-出', queueId: 59, x: 1600, y: 970 },
        { id: 60, name: 'E2-2-出', queueId: 60, x: 1600, y: 1030 }
      ],
      logId: 1000, // 添加一个日志ID计数器=
      // 输送线当前运行状态-读取PLC
      conveyorStatus: '',
      // A线电机运行信号-读取PLC
      aLineMotorRunning: {
        bit0: '0', // A1-1#电机运行信号
        bit1: '0', // A1-2#电机运行信号
        bit2: '0', // A1-3#电机运行信号
        bit3: '0', // A1-4#电机运行信号
        bit4: '0', // A1-5#电机运行信号
        bit5: '0', // A1-6#电机运行信号
        bit6: '0', // A3-1#电机运行信号
        bit7: '0', // A3-2#电机运行信号
        bit8: '0', // A3-3#电机运行信号
        bit9: '0', // A3-4#电机运行信号
        bit10: '0', // A3-5#电机运行信号
        bit11: '0' // A3-6#电机运行信号
      },
      // A线光电检测信号-读取PLC
      aLinePhotoelectricSignal: {
        bit0: '0', // A1-1#光电信号
        bit1: '0', // A1-2#光电信号
        bit2: '0', // A1-3#光电信号
        bit3: '0', // A1-4#光电信号
        bit4: '0', // A1-5#光电信号
        bit5: '0', // A1-6#光电信号
        bit6: '0', // A1-7#光电信号
        bit7: '0', // A1-8#光电信号
        bit8: '0', // A3-1#光电信号
        bit9: '0', // A3-2#光电信号
        bit10: '0', // A3-3#光电信号
        bit11: '0', // A3-4#光电信号
        bit12: '0', // A3-5#光电信号
        bit13: '0', // A3-6#光电信号
        bit14: '0', // A3-7#光电信号
        bit15: '0' // A3-8#光电信号
      },
      // 箭头指示器信号-读取PLC
      arrowIndicatorSignal: {
        bit0: '0', // 箭头1#指示信号
        bit1: '0', // 箭头2#指示信号
        bit2: '0', // 箭头3#指示信号
        bit3: '0', // 箭头4#指示信号
        bit4: '0', // 箭头5#指示信号
        bit5: '0', // 箭头6#指示信号
        bit6: '0', // 箭头7#指示信号
        bit7: '0', // 箭头8#指示信号
        bit8: '0', // 箭头9#指示信号
        bit9: '0', // 箭头10#指示信号
        bit10: '0', // 箭头11#指示信号
        bit11: '0', // 箭头12#指示信号
        bit12: '0', // 箭头13#指示信号
        bit13: '0', // 箭头14#指示信号
        bit14: '0', // 箭头15#指示信号
        bit15: '0' // 箭头16#指示信号
      },
      // B线电机运行信号-读取PLC
      bLineMotorRunning: {
        bit0: '0', // B1-1#电机运行信号
        bit1: '0', // B1-2#电机运行信号
        bit2: '0', // B1-3#电机运行信号
        bit3: '0', // B1-4#电机运行信号
        bit4: '0', // B1-5#电机运行信号
        bit5: '0', // B1-6#电机运行信号
        bit6: '0', // B3-1#电机运行信号
        bit7: '0', // B3-2#电机运行信号
        bit8: '0', // B1-3#电机运行信号
        bit9: '0', // B1-4#电机运行信号
        bit10: '0', // B2-5#电机运行信号
        bit11: '0' // B3-6#电机运行信号
      },
      // B线光电检测信号-读取PLC
      bLinePhotoelectricSignal: {
        bit0: '0', // B1-1#光电
        bit1: '0', // B1-2#光电
        bit2: '0', // B1-3#光电
        bit3: '0', // B1-4#光电
        bit4: '0', // B1-5#光电
        bit5: '0', // B1-6#光电
        bit6: '0', // B1-7#光电
        bit7: '0', // B1-8#光电
        bit8: '0', // B3-1#光电
        bit9: '0', // B3-2#光电
        bit10: '0', // B3-3#光电
        bit11: '0', // B3-4#光电
        bit12: '0', // B3-5#光电
        bit13: '0', // B3-6#光电
        bit14: '0', // B3-7#光电
        bit15: '0' // B3-8#光电
      },
      // C线电机运行信号-读取PLC
      cLineMotorRunning: {
        bit0: '0', // C1-1#电机运行信号
        bit1: '0', // C1-2#电机运行信号
        bit2: '0', // C1-3#电机运行信号
        bit3: '0', // C1-4#电机运行信号
        bit4: '0', // C1-5#电机运行信号
        bit5: '0', // C1-6#电机运行信号
        bit6: '0', // C3-1#电机运行信号
        bit7: '0', // C3-2#电机运行信号
        bit8: '0', // C3-3#电机运行信号
        bit9: '0', // C3-4#电机运行信号
        bit10: '0', // C3-5#电机运行信号
        bit11: '0' // C3-6#电机运行信号
      },
      // C线光电检测信号-读取PLC
      cLinePhotoelectricSignal: {
        bit0: '0', // C1-1#光电
        bit1: '0', // C1-2#光电
        bit2: '0', // C1-3#光电
        bit3: '0', // C1-4#光电
        bit4: '0', // C1-5#光电
        bit5: '0', // C1-6#光电
        bit6: '0', // C1-7#光电
        bit7: '0', // C1-8#光电
        bit8: '0', // C3-1#光电
        bit9: '0', // C3-2#光电
        bit10: '0', // C3-3#光电
        bit11: '0', // C3-4#光电
        bit12: '0', // C3-5#光电
        bit13: '0', // C3-6#光电
        bit14: '0', // C3-7#光电
        bit15: '0' // C3-8#光电
      },
      // D线电机运行信号-读取PLC
      dLineMotorRunning: {
        bit0: '0', // D1-1#电机运行信号
        bit1: '0', // D1-2#电机运行信号
        bit2: '0', // D1-3#电机运行信号
        bit3: '0', // D1-4#电机运行信号
        bit4: '0', // D1-5#电机运行信号
        bit5: '0', // D1-6#电机运行信号
        bit6: '0', // D3-1#电机运行信号
        bit7: '0', // D3-2#电机运行信号
        bit8: '0', // D3-3#电机运行信号
        bit9: '0', // D3-4#电机运行信号
        bit10: '0', // D3-5#电机运行信号
        bit11: '0' // D3-6#电机运行信号
      },
      // D线光电检测信号-读取PLC
      dLinePhotoelectricSignal: {
        bit0: '0', // D1-1#光电
        bit1: '0', // D1-2#光电
        bit2: '0', // D1-3#光电
        bit3: '0', // D1-4#光电
        bit4: '0', // D1-5#光电
        bit5: '0', // D1-6#光电
        bit6: '0', // D1-7#光电
        bit7: '0', // D1-8#光电
        bit8: '0', // D3-1#光电
        bit9: '0', // D3-2#光电
        bit10: '0', // D3-3#光电
        bit11: '0', // D3-4#光电
        bit12: '0', // D3-5#光电
        bit13: '0', // D3-6#光电
        bit14: '0', // D3-7#光电
        bit15: '0' // D3-8#光电
      },
      // E线电机运行信号-读取PLC
      eLineMotorRunning: {
        bit0: '0', // E1-1#电机运行信号
        bit1: '0', // E1-2#电机运行信号
        bit2: '0', // E1-3#电机运行信号
        bit3: '0', // E1-4#电机运行信号
        bit4: '0', // E1-5#电机运行信号
        bit5: '0', // E1-6#电机运行信号
        bit6: '0', // E3-1#电机运行信号
        bit7: '0', // E3-2#电机运行信号
        bit8: '0', // E3-3#电机运行信号
        bit9: '0', // E3-4#电机运行信号
        bit10: '0', // E3-5#电机运行信号
        bit11: '0' // E3-6#电机运行信号
      },
      // E线光电检测信号-读取PLC
      eLinePhotoelectricSignal: {
        bit0: '0', // E1-1#光电
        bit1: '0', // E1-2#光电
        bit2: '0', // E1-3#光电
        bit3: '0', // E1-4#光电
        bit4: '0', // E1-5#光电
        bit5: '0', // E1-6#光电
        bit6: '0', // E1-7#光电
        bit7: '0', // E1-8#光电
        bit8: '0', // E3-1#光电
        bit9: '0', // E3-2#光电
        bit10: '0', // E3-3#光电
        bit11: '0', // E3-4#光电
        bit12: '0', // E3-5#光电
        bit13: '0', // E3-6#光电
        bit14: '0', // E3-7#光电
        bit15: '0' // E3-8#光电
      },
      // 输送线故障反馈-读取PLC
      conveyorFaultFeedback: {
        bit0: '0', // A1预热故障
        bit1: '0', // A2灭菌故障
        bit2: '0', // A3解析故障
        bit3: '0', // B1预热故障
        bit4: '0', // B2灭菌故障
        bit5: '0', // B3解析故障
        bit6: '0', // C1预热故障
        bit7: '0', // C2灭菌故障
        bit8: '0', // C3解析故障
        bit9: '0', // D灭菌故障
        bit10: '0', // E灭菌故障
        bit11: '0', // 提升机故障
        bit12: '0', // 1#小车故障
        bit13: '0', // 2#小车故障
        bit14: '0', // 3#小车故障
        bit15: '0' // 主柜急停
      },
      // A线数量-读取PLC
      aLineQuantity: {
        a12: 0, // 预热房-1，序号1
        a13: 0, // 预热房-1，序号2
        a21in: 0, // 灭菌柜-1，序号3
        a21out: 0, // 灭菌柜-2，序号3
        a31: 0, // 解析房-1，序号4
        a32: 0, // 解析房-1，序号5
        a15: 0, // 预热房-2，序号1
        a16: 0, // 预热房-2，序号2
        a22in: 0, // 灭菌柜-2，序号3
        a22out: 0, // 解析房-2，序号4
        a34: 0, // 解析房-2，序号4
        a35: 0 // 解析房-2，序号5
      },
      // B线数量-读取PLC
      bLineQuantity: {
        b12: 0, // 预热房-1，序号1
        b13: 0, // 预热房-1，序号2
        b21in: 0, // 灭菌柜-1，序号3
        b21out: 0, // 灭菌柜-2，序号3
        b31: 0, // 解析房-1，序号4
        b32: 0, // 解析房-1，序号5
        b15: 0, // 预热房-2，序号1
        b16: 0, // 预热房-2，序号2
        b22in: 0, // 灭菌柜-2，序号3
        b22out: 0, // 灭菌柜-2，序号3
        b34: 0, // 解析房-2，序号4
        b35: 0 // 解析房-2，序号5
      },
      // C线数量-读取PLC
      cLineQuantity: {
        c12: 0, // 预热房-1，序号1
        c13: 0, // 预热房-1，序号2
        c21in: 0, // 灭菌柜-1，序号3
        c21out: 0, // 灭菌柜-2，序号3
        c31: 0, // 解析房-1，序号4
        c32: 0, // 解析房-1，序号5
        c15: 0, // 预热房-2，序号1
        c16: 0, // 预热房-2，序号2
        c22in: 0, // 灭菌柜-2，序号3
        c22out: 0, // 灭菌柜-2，序号3
        c34: 0, // 解析房-2，序号4
        c35: 0 // 解析房-2，序号5
      },
      // D线数量-读取PLC
      dLineQuantity: {
        d12: 0, // 预热房-1，序号1
        d13: 0, // 预热房-1，序号2
        d21in: 0, // 灭菌柜-1，序号3
        d21out: 0, // 灭菌柜-2，序号3
        d31: 0, // 解析房-1，序号4
        d32: 0, // 解析房-1，序号5
        d15: 0, // 预热房-2，序号1
        d16: 0, // 预热房-2，序号2
        d22in: 0, // 灭菌柜-2，序号3
        d22out: 0, // 灭菌柜-2，序号3
        d34: 0, // 解析房-2，序号4
        d35: 0 // 解析房-2，序号5
      },
      // E线数量-读取PLC
      eLineQuantity: {
        e12: 0, // 预热房-1，序号1
        e13: 0, // 预热房-1，序号2
        e21in: 0, // 灭菌柜-1，序号3
        e21out: 0, // 灭菌柜-2，序号3
        e31: 0, // 解析房-1，序号4
        e32: 0, // 解析房-1，序号5
        e15: 0, // 预热房-2，序号1
        e16: 0, // 预热房-2，序号2
        e22in: 0, // 灭菌柜-2，序号3
        e22out: 0, // 灭菌柜-2，序号3
        e34: 0, // 解析房-2，序号4
        e35: 0 // 解析房-2，序号5
      },
      // 小车位置数值-读取PLC
      cartPositionValues: {
        cart1: 0, // DBW88, 范围0-1010
        cart2: 0 // DBW90, 范围0-1010
      },
      // 扫码枪处光电信号-读取PLC
      scanPhotoelectricSignal: {
        bit0: '0', // A1-1#请求进货信号
        bit1: '0', // A1-4#请求进货信号
        bit2: '0', // B1-1#请求进货信号
        bit3: '0', // B1-4#请求进货信号
        bit4: '0', // C1-1#请求进货信号
        bit5: '0', // C1-4#请求进货信号
        bit6: '0', // D1-1#请求进货信号
        bit7: '0', // D1-4#请求进货信号
        bit8: '0', // E1-1#请求进货信号
        bit9: '0' // E1-4#请求进货信号
      },
      // 无码上货模式开关
      noCodeUpload: false,
      // 当前操作类型
      currentOperation: null,
      // 管理员密码验证相关
      adminPasswordDialogVisible: false,
      adminPasswordLoading: false,
      adminPasswordForm: {
        password: ''
      },
      adminPasswordRules: {
        password: [
          { required: true, message: '请输入管理员密码', trigger: 'blur' }
        ]
      }
    };
  },
  computed: {
    currentLogs() {
      return this.activeLogType === 'running'
        ? this.runningLogs
        : this.alarmLogs;
    },
    unreadAlarms() {
      return this.alarmLogs.filter((log) => log.unread).length;
    },
    filteredQueues() {
      return this.queues.filter((q) => q.id !== 15);
    },
    selectedQueue() {
      return this.queues[this.selectedQueueIndex];
    },
    // 超简单的数量映射
    quantityByQueueId() {
      return {
        6: this.aLineQuantity.a15, // A1-5
        7: this.aLineQuantity.a16, // A1-6
        8: this.aLineQuantity.a22in, // A2-2
        9: this.aLineQuantity.a34, // A3-4
        10: this.aLineQuantity.a35, // A3-5
        11: this.bLineQuantity.b12, // B1-2
        12: this.bLineQuantity.b13, // B1-3
        13: this.bLineQuantity.b21in, // B2-1
        14: this.bLineQuantity.b31, // B3-1
        15: this.bLineQuantity.b32, // B3-2
        16: this.bLineQuantity.b15, // B1-5
        17: this.bLineQuantity.b16, // B1-6
        18: this.bLineQuantity.b22in, // B2-2
        19: this.bLineQuantity.b34, // B3-4
        20: this.bLineQuantity.b35, // B3-5
        21: this.cLineQuantity.c12, // C1-2
        22: this.cLineQuantity.c13, // C1-3
        23: this.cLineQuantity.c21in, // C2-1
        24: this.cLineQuantity.c31, // C3-1
        25: this.cLineQuantity.c32, // C3-2
        26: this.cLineQuantity.c15, // C1-5
        27: this.cLineQuantity.c16, // C1-6
        28: this.cLineQuantity.c22in, // C2-2
        29: this.cLineQuantity.c34, // C3-4
        30: this.cLineQuantity.c35, // C3-5
        31: this.dLineQuantity.d12, // D1-2
        32: this.dLineQuantity.d13, // D1-3
        33: this.dLineQuantity.d21in, // D2-1
        34: this.dLineQuantity.d31, // D3-1
        35: this.dLineQuantity.d32, // D3-2
        36: this.dLineQuantity.d15, // D1-5
        37: this.dLineQuantity.d16, // D1-6
        38: this.dLineQuantity.d22in, // D2-2
        39: this.dLineQuantity.d34, // D3-4
        40: this.dLineQuantity.d35, // D3-5
        41: this.eLineQuantity.e12, // E1-2
        42: this.eLineQuantity.e13, // E1-3
        43: this.eLineQuantity.e21in, // E2-1
        44: this.eLineQuantity.e31, // E3-1
        45: this.eLineQuantity.e32, // E3-2
        46: this.eLineQuantity.e15, // E1-5
        47: this.eLineQuantity.e16, // E1-6
        48: this.eLineQuantity.e22in, // E2-2
        49: this.eLineQuantity.e34, // E3-4
        50: this.eLineQuantity.e35, // E3-5
        51: this.aLineQuantity.a21out, // A2-1-出
        52: this.aLineQuantity.a22out, // A2-1-出
        53: this.bLineQuantity.b21out, // B2-1-出
        54: this.bLineQuantity.b22out, // B2-1-出
        55: this.cLineQuantity.c21out, // C2-1-出
        56: this.cLineQuantity.c22out, // C2-1-出
        57: this.dLineQuantity.d21out, // D2-1-出
        58: this.dLineQuantity.d22out, // D2-1-出
        59: this.eLineQuantity.e21out, // E2-1-出
        60: this.eLineQuantity.e22out // E2-1-出
      };
    }
  },
  mounted() {
    this.initializeMarkers();
    this.loadQueueInfoFromDatabase();
    // 测试模式下，把上边注释，下面打开
    // if (!this.isDataReady) {
    //   this.isDataReady = true;
    // }
  },
  watch: {
    // ---- 新增：监听指定队列的 trayInfo 变化 ----
    'queues.0.trayInfo': {
      // 监听上货区 (ID: 1)
      deep: true,
      handler(newVal, oldVal) {
        this.updateQueueInfo(1);
      }
    },
    // ---- 新增：监听小车位置数值变化 ----
    'cartPositionValues.cart1'(newVal) {
      this.updateCartPositionByValue(1, newVal);
    },
    'cartPositionValues.cart2'(newVal) {
      this.updateCartPositionByValue(2, newVal);
    }
  },
  methods: {
    changeQueueExpanded() {
      this.isQueueExpanded = !this.isQueueExpanded;
      // 当展开面板时，刷新当前选中队列的托盘信息
      if (this.isQueueExpanded && this.selectedQueueIndex !== -1) {
        this.showTrays(this.selectedQueueIndex);
      }
    },
    // 显示订单查询对话框
    showOrderQueryDialog() {
      this.orderQueryDialogVisible = true;
    },
    // 显示订单选择弹窗
    showOrderDialog(line) {
      this.selectedLine = line;
      this.selectedOrderId = null;
      this.orderSelectDialogVisible = true;
    },
    // 选择订单
    selectOrder(order) {
      this.selectedOrderId = order.orderId;
    },
    // 获取当前选中的行（用于表格高亮）
    getCurrentRow() {
      if (!this.selectedOrderId) return null;
      return this.availableOrders.find(
        (order) => order.orderId === this.selectedOrderId
      );
    },
    // 确认订单选择
    confirmOrderSelection() {
      if (!this.selectedOrderId || !this.selectedLine) return;

      const selectedOrder = this.availableOrders.find(
        (order) => order.orderId === this.selectedOrderId
      );
      if (selectedOrder) {
        // 将订单分配给选中的生产线
        this.selectedLine.currentOrder = { ...selectedOrder, orderStatus: '1' };
        // 从可用订单列表中移除
        this.availableOrders = this.availableOrders.filter(
          (order) => order.orderId !== this.selectedOrderId
        );
        this.$message.success(
          `订单 ${selectedOrder.orderId} 已分配给生产线 ${this.selectedLine.letter}`
        );
      }

      this.orderSelectDialogVisible = false;
      this.selectedLine = null;
      this.selectedOrderId = null;
    },
    // 允许上货状态改变
    onAllowLoadingChange(line) {
      this.$message.info(
        `生产线 ${line.letter} 允许上货状态已${
          line.allowLoading ? '开启' : '关闭'
        }`
      );
    },
    // 获取进货口文本
    getInputText(input) {
      const inputMap = {
        1: '一楼进货',
        2: '二楼进货',
        3: '三楼进货'
      };
      return inputMap[input] || '未知';
    },
    // 获取出货口文本
    getOutputText(output) {
      const outputMap = {
        0: '不解析',
        1: '解析库',
        2: '立体库'
      };
      return outputMap[output] || '未知';
    },
    toggleButtonState(button) {
      if (button === 'start') {
        this.$confirm('确定要全线启动吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            ipcRenderer.send('writeValuesToPLC', 'DBW502', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW502', 0);
            }, 2000);
            this.buttonStates[button] = !this.buttonStates[button];
            this.$message.success('全线启动成功');
            this.addLog('全线启动成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'stop') {
        this.$confirm('确定要全线停止吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            ipcRenderer.send('writeValuesToPLC', 'DBW504', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW504', 0);
            }, 2000);
            this.buttonStates[button] = !this.buttonStates[button];
            this.$message.success('全线停止成功');
            this.addLog('全线停止成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'reset') {
        this.$confirm('确定要全线暂停吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.buttonStates = {
              start: false,
              stop: false,
              reset: false,
              fault_reset: false,
              clear: false
            };
            this.buttonStates[button] = !this.buttonStates[button];
            ipcRenderer.send('writeValuesToPLC', 'DBW506', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW506', 0);
            }, 2000);
            this.$message.success('全线暂停成功');
            this.addLog('全线暂停成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'fault_reset') {
        this.$confirm('确定要故障复位吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            ipcRenderer.send('writeValuesToPLC', 'DBW508', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW508', 0);
            }, 2000);
            this.$message.success('故障复位成功');
            this.addLog('故障复位成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      } else if (button === 'clear') {
        this.$confirm('确定要全线清空吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            // 把所有的队列，初试状态都清空
            this.queues.forEach((queue) => {
              queue.trayInfo = [];
            });
            this.nowScanTrayInfo = {};
            this.runningLogs = []; // 修改为空数组
            this.alarmLogs = []; // 修改为空数组
            this.nowTrays = [];
            this.$message.success('全线清空成功');
            this.addLog('全线清空成功');
          })
          .catch(() => {
            // 用户取消操作，不做任何处理
          });
      }
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    initializeMarkers() {
      this.$nextTick(() => {
        this.updateMarkerPositions();
        window.addEventListener('resize', this.updateMarkerPositions);
      });
    },
    updateMarkerPositions() {
      const images = document.querySelectorAll('.floor-image');
      images.forEach((image) => {
        const imageWrapper = image.parentElement;
        if (!imageWrapper) return;

        const markers = imageWrapper.querySelectorAll(
          '.marker, .marker-with-panel, .marker-with-button, .queue-marker, .motor-marker, .preheating-room-marker, .analysis-status-marker, .arrow-marker'
        );
        const carts = imageWrapper.querySelectorAll('.cart-container');
        const wrapperRect = imageWrapper.getBoundingClientRect();

        // 计算图片的实际显示区域
        const displayedWidth = image.width;
        const displayedHeight = image.height;
        const scaleX = displayedWidth / image.naturalWidth;
        const scaleY = displayedHeight / image.naturalHeight;

        // 计算图片在容器中的偏移量
        const imageOffsetX = (wrapperRect.width - displayedWidth) / 2;
        const imageOffsetY = (wrapperRect.height - displayedHeight) / 2;

        markers.forEach((marker) => {
          const x = parseFloat(marker.dataset.x);
          const y = parseFloat(marker.dataset.y);
          if (!isNaN(x) && !isNaN(y)) {
            marker.style.left = `${imageOffsetX + x * scaleX}px`;
            marker.style.top = `${imageOffsetY + y * scaleY}px`;
          }
        });

        // 更新小车位置和大小
        carts.forEach((cart) => {
          const x = parseFloat(cart.dataset.x);
          const y = parseFloat(cart.dataset.y);
          const width = parseFloat(cart.dataset.width);
          if (!isNaN(x) && !isNaN(y)) {
            cart.style.left = `${imageOffsetX + x * scaleX}px`;
            cart.style.top = `${imageOffsetY + y * scaleY}px`;
            if (!isNaN(width)) {
              cart.style.width = `${width * scaleX}px`;
            }
          }
        });
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.updateMarkerPositions);
    },
    // 根据PLC数值更新小车位置
    updateCartPositionByValue(cartId, value) {
      const cart = this.carts.find((c) => c.id === cartId);
      if (!cart) return;

      // 获取对应小车的y轴范围
      const yRange = this.cartYRanges[`cart${cartId}`];
      if (!yRange) return;

      // 获取PLC数值范围
      const plcRanges = {
        cart1: { min: 0, max: 1010 },
        cart2: { min: 0, max: 1010 }
      };

      const plcRange = plcRanges[`cart${cartId}`];
      if (!plcRange) return;

      // 计算比例（基于新的范围起点）
      const ratio = value / plcRange.max;

      // 根据比例计算y轴位置（PLC原点对应y轴最小值，PLC终点对应y轴最大值）
      const yPosition = yRange.min + (yRange.max - yRange.min) * ratio;

      // 更新小车位置
      cart.y = Math.round(yPosition);

      // 更新视图
      this.$nextTick(() => {
        this.updateMarkerPositions();
      });
    },
    showTrays(index) {
      if (index < 0 || index >= this.queues.length) {
        this.nowTrays = [];
        return;
      }

      this.selectedQueueIndex = index;
      const selectedQueue = this.queues[index];

      if (!selectedQueue) {
        this.nowTrays = [];
        return;
      }

      try {
        // 确保 trayInfo 是数组
        const trayInfo = Array.isArray(selectedQueue.trayInfo)
          ? selectedQueue.trayInfo
          : [];

        this.nowTrays = trayInfo
          .map((tray) => ({
            id: tray.trayCode || '',
            name: tray.trayCode ? `托盘 ${tray.trayCode}` : '未知托盘',
            time: tray.trayTime || '',
            isTerile: tray.isTerile,
            sendTo: tray.sendTo || '', // 添加sendTo属性
            state: tray.state || '', // 添加state属性
            sequenceNumber: tray.sequenceNumber || '', // 添加sequenceNumber属性
            orderId: tray.orderId || '', // 添加订单ID
            productCode: tray.productCode || '', // 添加物料编码
            productName: tray.productName || '', // 添加产品名称
            unit: tray.unit || '', // 添加规格
            batchNo: tray.batchNo || '' // 添加备注
          }))
          .filter((tray) => tray.id); // 过滤掉没有 id 的托盘
      } catch (error) {
        console.error('处理托盘信息时出错:', error);
        this.nowTrays = [];
      }
    },
    handleDragStart(event, tray, queueIndex) {
      if (!tray || queueIndex === undefined) return;

      this.isDragging = true;
      this.draggedTray = tray;
      this.dragSourceQueue = queueIndex;

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', tray.id);

      setTimeout(() => {
        event.target.classList.add('dragging');
      }, 0);
    },
    handleDragEnd(event) {
      this.isDragging = false;
      event.target.classList.remove('dragging');
    },
    async handleDrop(targetQueueIndex) {
      if (
        !this.draggedTray ||
        this.dragSourceQueue === null ||
        targetQueueIndex === null
      )
        return;
      if (this.dragSourceQueue === targetQueueIndex) return;

      const sourceQueue = this.queues[this.dragSourceQueue];
      const targetQueue = this.queues[targetQueueIndex];

      if (!sourceQueue || !targetQueue) {
        this.$message.error('队列不存在，无法移动托盘');
        return;
      }

      sourceQueue.trayInfo = Array.isArray(sourceQueue.trayInfo)
        ? sourceQueue.trayInfo
        : [];
      targetQueue.trayInfo = Array.isArray(targetQueue.trayInfo)
        ? targetQueue.trayInfo
        : [];

      try {
        // 确认移动操作
        await this.$confirm(
          `确认将托盘 ${this.draggedTray.id} 从 ${sourceQueue.queueName} 移动到 ${targetQueue.queueName}？`,
          '移动托盘确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        if (!this.draggedTray.id) {
          throw new Error('托盘信息无效');
        }

        const trayIndex = sourceQueue.trayInfo.findIndex(
          (t) => t.trayCode === this.draggedTray.id
        );
        if (trayIndex === -1) {
          throw new Error('找不到要移动的托盘');
        }

        const [movedTray] = sourceQueue.trayInfo.splice(trayIndex, 1);
        targetQueue.trayInfo.push(movedTray);

        // 更新队列数据
        this.updateQueueTrays(sourceQueue.id, sourceQueue.trayInfo);
        this.updateQueueTrays(targetQueue.id, targetQueue.trayInfo);

        const currentQueueIndex = this.selectedQueueIndex;
        if (
          currentQueueIndex === targetQueueIndex ||
          currentQueueIndex === this.dragSourceQueue
        ) {
          this.$nextTick(() => {
            this.showTrays(currentQueueIndex);
          });
        }

        // 添加托盘移动日志
        this.addLog(
          `托盘 ${movedTray.trayCode} 从 ${sourceQueue.queueName} 移动到 ${targetQueue.queueName}`
        );

        this.$message({
          type: 'success',
          message: `托盘 ${movedTray.trayCode} 已成功移动到 ${targetQueue.queueName}`,
          duration: 2000
        });
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return;
        }
        console.error('移动托盘时出错:', error);
        this.$message.error(error.message || '移动托盘失败，请重试');
      } finally {
        this.draggedTray = null;
        this.dragSourceQueue = null;
        this.isDragging = false;
      }
    },
    // 添加更新队列托盘的方法
    updateQueueTrays(queueId, trayInfo) {
      // 查找对应ID的队列
      const queueIndex = this.queues.findIndex((queue) => queue.id === queueId);
      if (queueIndex !== -1) {
        // 直接更新前端队列数据
        this.queues[queueIndex].trayInfo = trayInfo;
        // 添加日志
        this.addLog(`队列 ${this.queues[queueIndex].queueName} 数据已更新`);
      } else {
        this.$message.error('找不到队列ID: ' + queueId);
      }
    },
    async deleteTray(tray, index) {
      if (!this.selectedQueue) return;

      try {
        // 确认是否删除
        await this.$confirm(
          '确认要删除该托盘吗？删除后请注意是否需要同步修改PLC队列数据！',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 从队列中移除托盘，直接使用传递的index
        if (index >= 0 && index < this.selectedQueue.trayInfo.length) {
          this.selectedQueue.trayInfo.splice(index, 1);

          // 更新队列数据
          this.updateQueueTrays(
            this.selectedQueue.id,
            this.selectedQueue.trayInfo
          );

          // 刷新显示
          this.showTrays(this.selectedQueueIndex);

          // 添加删除托盘日志
          this.addLog(
            `托盘 ${tray.id} 已从 ${this.selectedQueue.queueName} 删除`
          );

          this.$message.success('托盘删除成功');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除托盘失败，请重试');
        }
      }
    },
    // 上移托盘
    async moveTrayUp(index) {
      if (!this.selectedQueue || index <= 0) return;

      try {
        // 获取当前队列的托盘信息
        const trayInfo = Array.isArray(this.selectedQueue.trayInfo)
          ? this.selectedQueue.trayInfo
          : [];

        const currentTray = trayInfo[index];
        const prevTray = trayInfo[index - 1];

        // 确认上移操作
        await this.$confirm(
          `确认将托盘 ${currentTray.trayCode} 上移一位（与 ${prevTray.trayCode} 交换位置）？`,
          '上移托盘确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 交换位置
        trayInfo[index] = prevTray;
        trayInfo[index - 1] = currentTray;

        // 更新队列数据
        this.updateQueueTrays(this.selectedQueue.id, trayInfo);

        // 刷新显示
        this.showTrays(this.selectedQueueIndex);

        // 添加操作日志
        this.addLog(
          `托盘 ${currentTray.trayCode} 在 ${this.selectedQueue.queueName} 中上移`
        );

        this.$message.success('托盘上移成功');
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return;
        }
        this.$message.error('托盘上移失败，请重试');
      }
    },
    // 下移托盘
    async moveTrayDown(index) {
      if (!this.selectedQueue || index >= this.nowTrays.length - 1) return;

      try {
        // 获取当前队列的托盘信息
        const trayInfo = Array.isArray(this.selectedQueue.trayInfo)
          ? this.selectedQueue.trayInfo
          : [];

        const currentTray = trayInfo[index];
        const nextTray = trayInfo[index + 1];

        // 确认下移操作
        await this.$confirm(
          `确认将托盘 ${currentTray.trayCode} 下移一位（与 ${nextTray.trayCode} 交换位置）？`,
          '下移托盘确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 交换位置
        trayInfo[index] = nextTray;
        trayInfo[index + 1] = currentTray;

        // 更新队列数据
        this.updateQueueTrays(this.selectedQueue.id, trayInfo);

        // 刷新显示
        this.showTrays(this.selectedQueueIndex);

        // 添加操作日志
        this.addLog(
          `托盘 ${currentTray.trayCode} 在 ${this.selectedQueue.queueName} 中下移`
        );

        this.$message.success('托盘下移成功');
      } catch (error) {
        if (error === 'cancel') {
          // 用户取消操作
          return;
        }
        this.$message.error('托盘下移失败，请重试');
      }
    },
    showAddTrayDialog() {
      this.addTrayDialogVisible = true;
      this.newTrayForm = {
        trayCode: '',
        batchId: '',
        isSterile: true
      };
    },
    // 显示托盘检索弹窗
    showTraySearchDialog() {
      this.traySearchDialogVisible = true;
      this.traySearchForm.trayCode = '';
      this.traySearchForm.orderId = '';
      this.traySearchForm.productCode = '';
      this.traySearchForm.productName = '';
      this.searchResults = [];
      this.hasSearched = false;
    },
    // 托盘检索方法
    async searchTray() {
      // 检查至少有一个查询条件
      const hasSearchCondition =
        this.traySearchForm.trayCode.trim() ||
        this.traySearchForm.orderId.trim() ||
        this.traySearchForm.productCode.trim() ||
        this.traySearchForm.productName.trim();

      if (!hasSearchCondition) {
        this.$message.warning('请至少输入一个查询条件');
        return;
      }

      this.searchLoading = true;
      this.hasSearched = true;
      this.searchResults = [];

      try {
        const searchCriteria = {
          trayCode: this.traySearchForm.trayCode.trim(),
          orderId: this.traySearchForm.orderId.trim(),
          productCode: this.traySearchForm.productCode.trim(),
          productName: this.traySearchForm.productName.trim()
        };

        // 在所有队列中查找符合条件的托盘
        const foundTrays = [];

        for (const queue of this.queues) {
          if (queue.trayInfo && Array.isArray(queue.trayInfo)) {
            for (const tray of queue.trayInfo) {
              // 检查是否符合所有输入的查询条件
              let matches = true;

              if (
                searchCriteria.trayCode &&
                String(tray.trayCode || '').trim() !==
                  String(searchCriteria.trayCode).trim()
              ) {
                matches = false;
              }
              if (
                searchCriteria.orderId &&
                (!tray.orderId ||
                  !String(tray.orderId).includes(searchCriteria.orderId))
              ) {
                matches = false;
              }
              if (
                searchCriteria.productCode &&
                (!tray.productCode ||
                  !String(tray.productCode).includes(
                    searchCriteria.productCode
                  ))
              ) {
                matches = false;
              }
              if (
                searchCriteria.productName &&
                (!tray.productName ||
                  !String(tray.productName).includes(
                    searchCriteria.productName
                  ))
              ) {
                matches = false;
              }

              if (matches) {
                foundTrays.push({
                  ...tray,
                  queueName: queue.queueName
                });
              }
            }
          }
        }

        if (foundTrays.length > 0) {
          this.searchResults = foundTrays;
          this.addLog(
            `托盘检索成功：找到 ${foundTrays.length} 个符合条件的托盘`
          );
        } else {
          this.searchResults = [];
          this.addLog('托盘检索：未找到符合条件的托盘');
        }
      } catch (error) {
        console.error('托盘检索失败:', error);
        this.$message.error('托盘检索失败，请重试');
        this.addLog(`托盘检索失败：${error.message}`);
      } finally {
        this.searchLoading = false;
      }
    },
    async submitAddTray() {
      if (!this.selectedQueue) return;

      try {
        // 表单验证
        await this.$refs.newTrayForm.validate();

        this.isSubmitting = true;
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const newTray = {
          trayCode: this.newTrayForm.trayCode,
          trayTime: currentTime,
          batchId: this.newTrayForm.batchId,
          isTerile: this.newTrayForm.isSterile ? 1 : 0,
          state: '0',
          sendTo: '',
          sequenceNumber: null
        };

        // 确保trayInfo是数组
        if (!Array.isArray(this.selectedQueue.trayInfo)) {
          this.selectedQueue.trayInfo = [];
        }

        // 添加新托盘
        this.selectedQueue.trayInfo.push(newTray);

        // 更新队列数据
        this.updateQueueTrays(
          this.selectedQueue.id,
          this.selectedQueue.trayInfo
        );

        // 刷新显示
        this.showTrays(this.selectedQueueIndex);

        // 添加新托盘日志
        this.addLog(
          `新托盘 ${newTray.trayCode} 已添加到 ${
            this.selectedQueue.queueName
          }，批次号：${newTray.batchId}，${
            newTray.isTerile === 1 ? '灭菌' : '不灭菌'
          }`
        );

        this.$message.success('托盘添加成功');
        this.addTrayDialogVisible = false;
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('添加托盘失败，请重试');
        }
      } finally {
        this.isSubmitting = false;
      }
    },
    // 点击队列标识
    handleQueueMarkerClick(queueId) {
      // 展开队列面板
      this.isQueueExpanded = true;

      // 找到队列在数组中的索引
      const queueIndex = this.queues.findIndex((q) => q.id === queueId);
      if (queueIndex !== -1) {
        // 选中并显示对应队列
        this.selectedQueueIndex = queueIndex;
        this.showTrays(queueIndex);
      }
    },
    // 添加新的日志方法
    addLog(message, type = 'running') {
      const log = {
        id: this.logId++,
        type,
        message,
        timestamp: new Date().getTime(),
        unread: type === 'alarm'
      };

      if (type === 'running') {
        this.runningLogs.unshift(log);
        // 保持日志数量在合理范围内
        if (this.runningLogs.length > 100) {
          this.runningLogs.pop();
        }
      } else {
        this.alarmLogs.unshift(log);
        if (this.alarmLogs.length > 100) {
          this.alarmLogs.pop();
        }
      }
      // 同时写入本地文件
      const logTypeText = type === 'running' ? '运行日志' : '报警日志';
      const logMessage = `[${logTypeText}] ${message}`;
      ipcRenderer.send('writeLogToLocal', logMessage);
    },
    toggleBitValue(obj, bit) {
      obj[bit] = obj[bit] === '1' ? '0' : '1';
    },
    convertToWord(value) {
      if (value < 0) {
        return (value & 0xffff) >>> 0; // 负数转换为无符号的16位整数
      } else {
        return value; // 非负数保持不变
      }
    },
    // 更新数据库队列信息
    updateQueueInfo(id) {
      const param = {
        id: id,
        trayInfo: JSON.stringify(this.queues[id - 1].trayInfo)
      };
      HttpUtil.post('/queue_info/update', param).catch((err) => {
        this.$message.error(err);
      });
    },
    // 从数据库加载队列信息
    loadQueueInfoFromDatabase() {
      HttpUtil.post('/queue_info/queryQueueList', {})
        .then((res) => {
          if (res.data && res.data.length > 0) {
            // 遍历数据库返回的队列信息
            res.data.forEach((queueData) => {
              const queueId = queueData.id;
              const queueIndex = queueId - 1; // 数组索引从0开始，队列ID从1开始

              // 确保队列索引有效
              if (queueIndex >= 0 && queueIndex < this.queues.length) {
                try {
                  // 解析托盘信息JSON字符串
                  const trayInfo = queueData.trayInfo
                    ? JSON.parse(queueData.trayInfo)
                    : [];
                  // 赋值给对应的队列
                  this.queues[queueIndex].trayInfo = Array.isArray(trayInfo)
                    ? trayInfo
                    : [];
                  this.addLog(
                    `已加载队列${queueData.queueName || queueId}的托盘信息，共${
                      this.queues[queueIndex].trayInfo.length
                    }个托盘`
                  );
                } catch (error) {
                  console.error(`解析队列${queueId}的托盘信息失败:`, error);
                  this.queues[queueIndex].trayInfo = [];
                  this.addLog(`队列${queueId}托盘信息解析失败，已重置为空`);
                }
              }
            });
            this.addLog('队列信息加载完成');
          } else {
            this.addLog('数据库中暂无队列信息');
          }
        })
        .catch((err) => {
          console.error('加载队列信息失败:', err);
          this.$message.error('加载队列信息失败: ' + err);
          this.addLog('队列信息加载失败');
        });
    },
    // 切换到报警日志时清除未读状态
    switchToAlarmLog() {
      this.activeLogType = 'alarm';
      // 清除所有报警日志的未读状态
      this.alarmLogs.forEach((log) => {
        log.unread = false;
      });
    },
    // 获取简化标签
    getSimpleLabel(line, key) {
      return `${line}${key.substring(1)}`;
    },
    // 增加数量
    increaseQuantity(lineType, key) {
      if (this[lineType][key] < 999) {
        this[lineType][key]++;
      }
    },
    // 减少数量
    decreaseQuantity(lineType, key) {
      if (this[lineType][key] > 0) {
        this[lineType][key]--;
      }
    },
    // 切换无码上货状态
    toggleNoCodeUpload() {
      // 显示管理员密码验证对话框
      this.currentOperation = 'toggleNoCodeUpload';
      this.adminPasswordDialogVisible = true;
      this.adminPasswordForm.password = '';

      // 聚焦到密码输入框
      this.$nextTick(() => {
        this.$refs.adminPasswordForm.$el
          .querySelector('input[type="password"]')
          .focus();
      });
    },

    // 验证管理员密码
    verifyAdminPassword() {
      this.$refs.adminPasswordForm.validate((valid) => {
        if (valid) {
          this.adminPasswordLoading = true;

          // 使用登录接口验证管理员账号密码
          const param = {
            userCode: 'admin',
            userPassword: this.adminPasswordForm.password
          };

          // 调用登录接口进行验证
          HttpUtil.post('/login/login', param)
            .then((res) => {
              if (res.data) {
                // 登录成功，允许修改

                // 处理无码模式切换
                if (this.currentOperation === 'toggleNoCodeUpload') {
                  this.noCodeUpload = !this.noCodeUpload;
                  if (this.noCodeUpload) {
                    this.$message.success(
                      '已启用无码上货模式，触发光电信号将直接添加托盘'
                    );
                    this.addLog('无码上货模式已启用，已给PLC，DBW562发送2');
                    // 无码模式发2
                    ipcRenderer.send('writeValuesToPLC', 'DBW562', 2);
                  } else {
                    this.$message.info(
                      '已关闭无码上货模式，已给PLC，DBW562发送1'
                    );
                    this.addLog('无码上货模式已关闭');
                    // 有码模式发1
                    ipcRenderer.send('writeValuesToPLC', 'DBW562', 1);
                  }
                }

                // 关闭对话框
                this.adminPasswordDialogVisible = false;
                this.currentOperation = null;
              } else {
                // 登录失败
                if (this.currentOperation === 'toggleNoCodeUpload') {
                  this.$message.error(
                    '管理员账号或密码错误，无法切换无码上货模式'
                  );
                  this.addLog('管理员权限验证失败，无码上货模式切换被拒绝');
                }
              }
            })
            .catch((err) => {
              // 接口调用失败
              this.$message.error('验证失败，请检查网络连接');
              if (this.currentOperation === 'toggleNoCodeUpload') {
                this.addLog(
                  '管理员权限验证接口调用失败，无码上货模式切换被拒绝'
                );
              }
            })
            .finally(() => {
              this.adminPasswordLoading = false;
            });
        }
      });
    },

    // 取消管理员密码验证
    cancelAdminPassword() {
      this.adminPasswordDialogVisible = false;
      this.currentOperation = null;
      this.adminPasswordForm.password = '';
      if (this.currentOperation === 'toggleNoCodeUpload') {
        this.$message.info('已取消无码上货模式切换');
      }
    }
  }
};
</script>
<style lang="less" scoped>
.smart-workshop {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, #83b3de, #ffffff);
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  overflow: hidden;
  box-sizing: border-box;
  user-select: none;
  .header {
    position: relative;
    width: 100%;
    height: 80px;
    overflow: hidden;
    flex-shrink: 0;
    .header-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .header-content {
      position: relative;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      z-index: 1;
      .title {
        font-size: 32px;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        letter-spacing: 2px;
      }

      .current-time {
        font-size: 24px;
        color: #fff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
      }
    }
  }
  .content-wrapper {
    flex: 1;
    display: flex;
    min-height: 0;
    overflow: hidden;
    .side-info-panel {
      width: 400px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 5px;
      box-sizing: border-box;
      flex-shrink: 0;
      overflow: hidden;
      .plc-info-section,
      .operation-panel,
      .production-cards-section {
        background: #052438;
        padding: 10px;
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        color: #f5f5f5;
        box-sizing: border-box;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 22px;
          color: #0ac5a8;
          font-weight: 900;
          margin-bottom: 5px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .el-button {
            background: rgba(10, 197, 168, 0.2);
            border: 1px solid rgba(10, 197, 168, 0.3);
            color: #0ac5a8;
            font-size: 12px;
          }
          .el-button:hover {
            background: rgba(10, 197, 168, 0.3);
            border-color: rgba(10, 197, 168, 0.5);
            color: #fff;
          }
        }
        .scrollable-content {
          overflow-y: auto;
        }
      }
      .plc-info-section {
        .scrollable-content {
          .status-overview {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            .data-card {
              box-sizing: border-box;
              height: 65px;
              width: 180px;
            }

            .data-card-border {
              width: 100%;
              height: 100%;
              border-radius: 20px;
              background: linear-gradient(135deg, #2b3d51, #3c4c63);
              box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
            }

            .data-card-border-borderTop {
              font-weight: 400;
              letter-spacing: 0px;
              color: rgba(189, 189, 189, 1);
              text-align: left;
              vertical-align: top;
              font-size: 13px;
              line-height: 34px;
              padding-left: 12px;
            }
            .granient-text {
              background-image: linear-gradient(
                to right,
                rgba(72, 146, 254, 1),
                rgba(71, 207, 245, 1)
              );
              background-clip: text;
              -webkit-background-clip: text;
              color: transparent;
            }

            .data-card-border-borderDown {
              font-weight: 700;
              letter-spacing: 0px;
              color: rgba(255, 255, 255, 1);
              text-align: left;
              vertical-align: top;
              font-size: 24px;
              line-height: 21px;
              padding-left: 12px;
              /* 添加省略号效果 */
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 100%;
              display: block;
            }
          }
        }
      }
      .log-section {
        background: #052438;
        padding: 10px;
        border-radius: 15px;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
        height: 257px;
        display: flex;
        flex-direction: column;
        flex: 1;
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0px 0px 8px 0px;
          color: #0ac5a8;
          font-size: 22px;
          font-weight: 900;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          .log-tabs {
            display: flex;
            gap: 5px;
          }
          .log-tab {
            position: relative;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            padding: 5px 15px;
            border-radius: 4px;
            transition: all 0.3s ease;
            .alarm-badge {
              position: absolute;
              top: -8px;
              right: -8px;
              background: #f56c6c;
              color: #fff;
              font-size: 12px;
              padding: 2px 6px;
              border-radius: 10px;
              min-width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
          }
          .log-tab.active {
            color: #fff;
            background: rgba(10, 197, 168, 0.2);
          }
          .log-tab:hover:not(.active) {
            color: #0ac5a8;
          }
        }
        .scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 10px 0;
          .log-list {
            padding: 0 10px;
            width: 100%;
            box-sizing: border-box;
            .log-item {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 4px;
              padding: 10px;
              margin-bottom: 8px;
              cursor: pointer;
              width: 100%;
              box-sizing: border-box;
              .log-time {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.4);
                margin-bottom: 6px;
              }
              .log-item-content {
                color: rgba(255, 255, 255, 0.9);
                font-size: 13px;
                line-height: 1.6;
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: normal;
                hyphens: auto;
                display: block;
                width: 100%;
                padding-right: 10px;
              }
            }
            .log-item:hover {
              background: rgba(255, 255, 255, 0.05);
            }

            .log-item.alarm {
              background: rgba(245, 108, 108, 0.05);
            }

            .log-item.alarm.unread {
              background: rgba(245, 108, 108, 0.1);
              border-left: 2px solid #f56c6c;
            }
            /* 添加空状态样式 */
            .empty-state {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 40px 0;
              color: rgba(255, 255, 255, 0.6);
              i {
                font-size: 48px;
                margin-bottom: 16px;
                color: rgba(255, 255, 255, 0.3);
              }
              p {
                font-size: 14px;
                margin: 0 0 16px 0;
              }
              .el-button {
                color: #0ac5a8;
                font-size: 14px;
                i {
                  font-size: 14px;
                  margin-right: 4px;
                  color: inherit;
                }
              }
              .el-button:hover {
                color: #0db196;
              }
            }
          }
        }
        .scrollable-content::-webkit-scrollbar {
          width: 4px;
        }

        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollable-content::-webkit-scrollbar-thumb {
          background: rgba(10, 197, 168, 0.2);
          border-radius: 2px;
        }

        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: rgba(10, 197, 168, 0.4);
        }
      }
      .operation-panel {
        .operation-buttons {
          display: flex;
          justify-content: flex-start;
          gap: 8px;
          margin-top: 5px;
          padding: 5px;
          button {
            width: 70px;
            height: 70px;
            font-size: 0.8em;
            color: #fff;
            background: linear-gradient(135deg, #0ac5a8, #0f6b58);
            border: none;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 8px;
            gap: 5px;
            i {
              font-size: 1.8em;
            }
            span {
              font-size: 12px;
              margin-top: 4px;
            }
          }
          button:hover {
            background: linear-gradient(135deg, #4caf50, #0f6b58);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
          }
          button.pressed {
            background: linear-gradient(135deg, #4caf50, #2e8b57);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            transform: scale(0.95);
          }
        }
      }
      .production-cards-section {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: auto;
        .production-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          padding-right: 5px;
          /* 自定义滚动条样式 */
          &::-webkit-scrollbar {
            width: 4px;
          }
          &::-webkit-scrollbar-track {
            background: transparent;
          }
          &::-webkit-scrollbar-thumb {
            background: rgba(10, 197, 168, 0.2);
            border-radius: 2px;
            &:hover {
              background: rgba(10, 197, 168, 0.4);
            }
          }
          .production-card {
            width: 100%;
            box-sizing: border-box;
            background: linear-gradient(
              90deg,
              rgba(30, 42, 56, 0.95) 0%,
              rgba(48, 65, 86, 0.85) 50%,
              rgba(48, 65, 86, 0.75) 100%
            );
            border-radius: 6px;
            padding: 12px 15px;
            transition: all 0.3s ease;
            position: relative;
            height: 80px;
            min-height: 80px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            gap: 15px;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

            &:hover {
              background: linear-gradient(
                90deg,
                rgba(30, 42, 56, 0.98) 0%,
                rgba(48, 65, 86, 0.9) 50%,
                rgba(48, 65, 86, 0.85) 100%
              );
              transform: translateX(4px);
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
            }

            &::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              width: 3px;
              height: 100%;
              background: transparent;
              transition: all 0.3s ease;
            }

            &.has-order::before {
              background: #409eff;
            }

            .line-identifier {
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #0ac5a8, #0f6b58);
              border-radius: 50%;
              flex-shrink: 0;
              .line-letter {
                font-size: 18px;
                font-weight: bold;
                color: #fff;
              }
            }

            .order-section {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 4px;
              min-width: 0;
              padding-right: 100px;

              .order-info {
                .order-header {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  margin: 0;
                  padding: 0;
                  border: none;
                  .order-id {
                    font-weight: 600;
                    color: #fff;
                    font-size: 14px;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                  }
                  .order-status {
                    font-size: 11px;
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: rgba(64, 158, 255, 0.15);
                    color: #409eff;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    i {
                      font-size: 12px;
                    }
                  }
                }
                .order-details {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  padding: 0;
                  .info-row {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                  }
                  .info-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    min-width: 0;
                    .info-label {
                      color: rgba(255, 255, 255, 0.45);
                      font-size: 12px;
                      white-space: nowrap;
                      width: 50px;
                      flex-shrink: 0;
                    }
                    .info-value {
                      color: rgba(255, 255, 255, 0.85);
                      font-size: 12px;
                      font-weight: 500;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      flex: 1;
                      min-width: 0;
                    }
                  }
                }
              }

              .no-order {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                .el-button {
                  background: rgba(255, 255, 255, 0.06);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  color: rgba(255, 255, 255, 0.85);
                  padding: 0 15px;
                  border-radius: 4px;
                  font-size: 12px;
                  height: 28px;
                  min-width: 85px;
                  transition: all 0.3s ease;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  cursor: pointer;
                  &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                  }
                }
              }
            }

            .allow-loading {
              position: absolute;
              right: 15px;
              top: 50%;
              transform: translateY(-50%);
              /deep/ .el-checkbox {
                .el-checkbox__label {
                  color: rgba(255, 255, 255, 0.85);
                  font-size: 12px;
                }
                .el-checkbox__input.is-checked .el-checkbox__inner {
                  background-color: #0ac5a8;
                  border-color: #0ac5a8;
                }
              }
            }
          }
        }
      }
    }
    .main-content {
      flex: 1;
      display: flex;
      padding: 5px 5px 5px 0px;
      box-sizing: border-box;
      overflow: hidden;
      height: 100%;
      .floor-container {
        display: flex;
        gap: 10px;
        height: 100%;
        width: 100%;
        min-height: 0;

        .floor-left {
          .floor-image-container {
            flex: 1;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(255, 255, 255, 0.1);
            min-height: 0;
            height: calc(100% - 50px);
            position: relative;
            .image-wrapper {
              position: relative;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              .floor-image {
                display: block;
                max-width: 100%;
                max-height: 100%;
                width: auto;
                height: auto;
                object-fit: contain;
              }
              /* --- 光电点位样式 --- */
              .marker {
                position: absolute;
                width: 12px;
                height: 12px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: auto;
                .marker-label {
                  position: absolute;
                  white-space: nowrap;
                  background: #0ac5a8;
                  color: #fff;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  /* 默认定位在下方 */
                  top: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  opacity: 0;
                  transition: opacity 0.3s;
                  pointer-events: none; /* 添加此行 */
                }
              }
              .marker::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: rgba(128, 128, 128, 0.8); /* 默认灰色核心 */
              }
              /* 扫描状态 (红色) */
              .marker.scanning::before {
                background: rgba(255, 0, 0, 0.8); /* 红色核心 */
              }

              /* 默认隐藏标签，hover时显示 */
              .marker:hover .marker-label {
                opacity: 1;
                box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); /* 灰色辉光 */
              }
              /* 始终显示标签的点位 */
              .marker-show-label .marker-label {
                opacity: 1;
              }
              /* 控制标签位置的样式 */
              .marker.label-top .marker-label {
                top: auto; /* 重置默认 top */
                bottom: calc(100% + 5px); /* 定位到上方 */
                left: 50%;
                transform: translateX(-50%);
              }
              .marker.label-left .marker-label {
                top: 50%; /* 垂直居中 */
                left: auto; /* 重置默认 left */
                right: calc(100% + 5px); /* 定位到左方 */
                transform: translateY(-50%); /* 垂直居中 */
              }
              .marker.label-right .marker-label {
                top: 50%; /* 垂直居中 */
                left: calc(100% + 5px); /* 定位到右方 */
                transform: translateY(-50%); /* 垂直居中 */
              }
              /* --- 光电点位样式结束 --- */

              /* --- 箭头指示器样式开始 --- */
              .arrow-marker {
                position: absolute;
                width: 28px;
                height: 18px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: none;
                .marker-label {
                  position: absolute;
                  white-space: nowrap;
                  background: #0ac5a8;
                  color: #fff;
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 12px;
                  opacity: 0;
                  transition: opacity 0.3s ease;
                  pointer-events: none;
                  /* 默认标签在右侧 */
                  top: 50%;
                  left: calc(100% + 5px);
                  transform: translateY(-50%);
                }
              }

              .arrow-marker::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 19px;
                height: 3px;
                background: rgba(128, 128, 128, 0.8);
                pointer-events: auto;
                cursor: pointer;
              }

              .arrow-marker::after {
                content: '';
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 0;
                height: 0;
                border-left: 9px solid rgba(128, 128, 128, 0.8);
                border-top: 7px solid transparent;
                border-bottom: 7px solid transparent;
                pointer-events: auto;
                cursor: pointer;
              }

              /* 箭头激活状态 (红色) */
              .arrow-marker.active::before {
                background: rgba(255, 0, 0, 0.8);
              }

              .arrow-marker.active::after {
                border-left-color: rgba(255, 0, 0, 0.8);
              }

              /* 默认隐藏标签，hover时显示 */
              .arrow-marker:hover .marker-label {
                opacity: 1;
              }

              /* 控制标签位置的样式 */
              .arrow-marker.label-top .marker-label {
                top: auto;
                bottom: calc(100% + 5px);
                left: 50%;
                transform: translateX(-50%);
              }
              /* --- 箭头指示器样式结束 --- */

              /* --- 新增电机点位样式 --- */
              .motor-marker {
                position: absolute;
                width: 12px;
                height: 12px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                pointer-events: none;
                .marker-label {
                  position: absolute;
                  white-space: nowrap;
                  background: rgba(0, 0, 0, 0.8);
                  color: #fff;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                  pointer-events: none;
                  /* 默认定位在下方 */
                  top: calc(100% + 5px);
                  left: 50%;
                  transform: translateX(-50%);
                  opacity: 0; /* 默认隐藏 */
                  transition: opacity 0.3s;
                }
              }

              .motor-marker::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                background: rgba(128, 128, 128, 0.8); /* 默认灰色方块 */
                /* 无 border-radius，保持方形 */
                pointer-events: auto;
                cursor: pointer;
              }

              .motor-marker.running::before {
                background: #00ff3f; /* 运行状态绿色方块 */
              }

              /* 始终显示电机标签 */
              .motor-marker.marker-show-label .marker-label {
                opacity: 1;
              }
              /* 悬停显示电机标签 */
              .motor-marker:hover .marker-label {
                opacity: 1;
              }

              /* 控制电机标签位置的样式 (复制并适配) */
              .motor-marker.label-top .marker-label {
                top: auto;
                bottom: calc(100% + 5px);
                left: 50%;
                transform: translateX(-50%);
              }
              .motor-marker.label-left .marker-label {
                top: 50%;
                left: auto;
                right: calc(100% + 5px);
                transform: translateY(-50%);
              }
              .motor-marker.label-right .marker-label {
                top: 50%;
                left: calc(100% + 5px);
                transform: translateY(-50%);
              }
              /* --- 电机点位样式结束 --- */

              /* 带数据面板的标识点样式 */
              .marker-with-panel {
                position: absolute;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                .data-panel {
                  position: absolute;
                  background: #ffffff;
                  border: 1px solid #e8e8e8;
                  border-radius: 12px;
                  padding: 12px;
                  width: 170px;
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                  opacity: 0;
                  transition: all 0.3s ease;
                  pointer-events: none;
                  overflow: hidden;
                  .data-panel-header {
                    font-size: 14px;
                    color: #1a1a1a;
                    font-weight: 600;
                    margin-bottom: 6px;
                    padding-bottom: 6px;
                    border-bottom: 2px solid #f0f0f0;
                  }
                  .data-panel-content {
                    font-size: 12px;
                    .data-panel-row {
                      display: flex;
                      justify-content: space-between;
                      color: #333333;
                      .data-panel-label {
                        color: #666666;
                        font-size: 12px;
                      }
                    }

                    /* 扫码分组网格布局 */
                    .scan-groups-grid {
                      display: flex;
                      flex-direction: column;
                      gap: 16px;
                    }

                    .scan-group-row {
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 12px;
                    }

                    .scan-group {
                      background: linear-gradient(
                        135deg,
                        #e9f4ff 0%,
                        #ffffff 100%
                      );
                      border: 1px solid #e8e8e8;
                      border-left: 3px solid #4a90e2;
                      border-radius: 8px;
                      padding: 10px;
                      transition: all 0.2s ease;

                      &:hover {
                        border-left-color: #357abd;
                        box-shadow: 0 2px 8px rgba(74, 144, 226, 0.12);
                      }
                    }

                    .group-header {
                      font-size: 12px;
                      font-weight: 600;
                      color: #4a90e2;
                      margin-bottom: 8px;
                      text-align: center;
                      border-bottom: 1px solid #f0f0f0;
                      padding-bottom: 6px;
                    }

                    .group-items {
                      display: flex;
                      flex-direction: column;
                      gap: 4px;
                    }

                    .scan-item {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding: 2px 0;
                    }

                    .scan-label {
                      font-size: 11px;
                      color: #666666;
                      flex: 1;
                    }

                    .scan-value {
                      font-size: 11px;
                      color: #1a1a1a;
                      font-weight: 500;
                      text-align: right;
                      flex: 1;
                    }
                  }
                }

                /* 管理员密码对话框样式 */
                .admin-password-content {
                  padding: 20px 0;
                }

                .admin-password-content .el-form-item {
                  margin-bottom: 20px;
                }

                .admin-password-content .el-input {
                  width: 100%;
                }

                .dialog-footer {
                  text-align: right;
                  padding-top: 20px;
                }
                /* 面板位置样式 */
                .data-panel.position-right {
                  left: calc(100% + 15px);
                  top: 50%;
                  transform: translateY(-50%);
                }
                .data-panel.position-left {
                  right: calc(100% + 15px);
                  top: 50%;
                  transform: translateY(-50%);
                }
                .data-panel.position-top {
                  bottom: calc(100% + 15px);
                  left: 50%;
                  transform: translateX(-50%);
                }
                .data-panel.position-bottom {
                  top: calc(100% + 15px);
                  left: 50%;
                  transform: translateX(-50%);
                }
                /* 始终显示的面板 */
                .data-panel.always-show {
                  opacity: 1;
                  pointer-events: auto; /* 重新启用指针事件 */
                }
                /* 上货面板背景文字 */
                .data-panel.upload-panel::before {
                  content: '上货信息';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 72px;
                  font-weight: bold;
                  color: rgba(255, 193, 7, 0.15);
                  z-index: 0;
                  pointer-events: none;
                  white-space: nowrap;
                }
                /* 下货面板背景文字 */
                .data-panel.download-panel::before {
                  content: '下货信息';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  font-size: 72px;
                  font-weight: bold;
                  color: rgba(40, 167, 69, 0.15);
                  z-index: 0;
                  pointer-events: none;
                  white-space: nowrap;
                }
                /* 竖向布局样式 */
                .data-panel.vertical-layout {
                  width: 110px;
                  padding: 8px;
                  .data-panel-row {
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #f0f0f0;
                  }
                  .data-panel-label {
                    margin-bottom: 2px;
                  }
                }
              }
              /* 悬停时显示面板 */
              .marker-with-panel:hover .data-panel:not(.always-show) {
                opacity: 1;
              }

              /* 带按钮的标识点样式 */
              .marker-with-button {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 5;
                cursor: pointer;
              }
              .marker-with-button .warehouse-btn {
                background: linear-gradient(135deg, #0e1a27, #3c4c63);
                color: white;
                font-weight: bold;
                border: none;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
                border-radius: 4px;
                padding: 10px 15px;
                transition: all 0.3s ease;
              }
              .marker-with-button .warehouse-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
              }

              /* 预热房选择样式 */
              .preheating-room-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 10;
                background: linear-gradient(135deg, #005aff 0%, #000000 100%);
                border-radius: 5px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                width: 80px;
                .preheating-room-content {
                  display: flex;
                  flex-direction: column;
                  width: 100%;
                  .preheating-room-header {
                    width: 100%;
                    text-align: center;
                    padding: 4px 0;
                    font-size: 11px;
                    color: white;
                    background-color: rgba(0, 0, 0, 0.2);
                    font-weight: bold;
                  }
                  .preheating-room-body {
                    padding: 6px 8px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                  }
                }
              }
              .preheating-room-marker :deep(.el-select) {
                width: 100%;
              }
              .preheating-room-marker :deep(.el-input__inner) {
                background-color: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.2);
                color: #fff;
                height: 24px;
                line-height: 24px;
                font-size: 11px;
                border-radius: 3px;
                padding: 0 8px;
              }

              /* 解析状态标签样式 */
              .analysis-status-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 15;
              }

              /* 自定义状态标签样式，让绿色更突出 */
              .analysis-status-marker :deep(.el-tag) {
                background-color: #00cc44;
                border: 1px solid #00aa33;
                color: #ffffff;
              }
            }
          }
        }
        .floor-left {
          flex: 1;
          background: #07293e;
          padding: 10px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
          color: #f5f5f5;
          display: flex;
          flex-direction: column;
          min-height: 0;
          height: 100%;
          overflow: hidden;
          box-sizing: border-box;
          .floor-title {
            font-size: 22px;
            color: #0ac5a8;
            font-weight: 900;
            padding-bottom: 10px;
            flex-shrink: 0;
          }
          .floor-image-container {
            .image-wrapper {
              .queue-marker {
                position: absolute;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 10;
                background: rgba(10, 30, 50, 0.85);
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid rgba(64, 158, 255, 0.5);
                transition: all 0.3s ease;
                text-align: center;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                color: #ffffff;
                .queue-marker-content {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: center;
                  color: #fff;
                  font-size: 12px;
                  gap: 4px;
                  .queue-marker-name {
                    color: #fff;
                  }

                  .queue-marker-count {
                    font-weight: bold;
                    color: #409eff;
                  }
                }
              }
              .queue-marker:hover {
                background: rgba(24, 61, 97, 0.9);
                border-color: rgba(64, 158, 255, 0.6);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
              }

              /* 特殊队列标记样式 - 上货1、上货2、缓存区1、缓存区2 */
              .special-queue {
                background: rgba(0, 123, 191, 0.9) !important;
                border: 1px solid rgba(0, 123, 191, 0.7) !important;
              }

              .special-queue .queue-marker-count {
                color: #ffffff !important;
              }

              .special-queue .queue-marker-name {
                color: #ffffff !important;
              }

              .special-queue:hover {
                background: rgba(0, 123, 191, 0.95) !important;
                border-color: rgba(40, 167, 235, 0.8) !important;
              }

              /* 添加小车样式 */
              .cart-container {
                position: absolute;
                transform: translate(-50%, -50%);
                z-index: 3;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              }

              .cart-image {
                width: 100%;
                height: auto;
                object-fit: contain;
              }
            }
          }
        }
      }
    }
  }
  .side-info-panel-queue {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    padding: 0;
    box-sizing: border-box;
    transition: all 0.3s ease;
    pointer-events: auto;
    /* 基础样式 */
    .queue-section {
      background: rgba(30, 42, 56);
      border-radius: 15px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
      color: #f5f5f5;
      box-sizing: border-box;
      border: 1px solid rgba(255, 255, 255, 0.1);
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        transition: color 0.3s ease;
        font-size: 20px;
        color: #0ac5a8;
        font-weight: 900;
        padding-bottom: 12px;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
      }
      .expandable-content-queue {
        flex: 1;
        min-height: 0;
        display: flex;
        overflow: hidden;
        height: calc(100% - 50px);
        .queue-container {
          flex: 1;
          display: flex;
          background: rgba(30, 42, 56, 0.9);
          border-radius: 12px;
          padding: 15px;
          gap: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          height: 100%;
          min-height: 0;
          box-sizing: border-box;
          .queue-container-left {
            width: 280px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            padding-right: 15px;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            height: 100%;
            min-height: 0;
            /* 队列项样式 */
            .queue {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: rgba(48, 65, 85, 0.9);
              border-radius: 8px;
              padding: 12px 15px;
              margin-bottom: 8px;
              cursor: pointer;
              transition: all 0.3s ease;
              border: 1px solid rgba(255, 255, 255, 0.15);
              .tray-count {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 10px;
                min-width: 24px;
                text-align: center;
              }
            }

            .queue:hover {
              background: rgba(48, 65, 85, 1);
              border-color: rgba(10, 197, 168, 0.5);
              transform: translateX(2px);
            }

            .queue.active {
              background: rgba(10, 197, 168, 0.15);
              border-color: rgba(10, 197, 168, 0.5);
            }
          }
          /* 滚动条样式 */
          .queue-container-left::-webkit-scrollbar,
          .tray-list::-webkit-scrollbar {
            width: 4px;
          }

          .queue-container-left::-webkit-scrollbar-track,
          .tray-list::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
          }

          .queue-container-left::-webkit-scrollbar-thumb,
          .tray-list::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }

          .queue-container-left::-webkit-scrollbar-thumb:hover,
          .tray-list::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .queue-container-right {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            padding: 0 15px;
            height: 100%;
            min-height: 0;
            .selected-queue-header {
              flex-shrink: 0;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid rgba(255, 255, 255, 0.1);
              display: flex;
              justify-content: space-between;
              align-items: center;
              h3 {
                margin: 0;
                color: rgba(255, 255, 255, 0.9);
                font-size: 16px;
              }
              .queue-header-actions {
                display: flex;
                align-items: center;
                gap: 12px;
                .el-button {
                  background: rgba(10, 197, 168, 0.2);
                  border: 1px solid rgba(10, 197, 168, 0.3);
                  color: #0ac5a8;
                }
                .el-button:hover:not(:disabled) {
                  background: rgba(10, 197, 168, 0.3);
                  border-color: rgba(10, 197, 168, 0.5);
                  color: #fff;
                }
                .tray-total {
                  background: rgba(255, 255, 255, 0.1);
                  color: rgba(255, 255, 255, 0.7);
                  font-size: 13px;
                  padding: 4px 12px;
                  border-radius: 15px;
                  cursor: pointer;
                }
              }
            }
            .tray-list {
              flex: 1;
              overflow-y: auto;
              min-height: 0;
              padding-right: 5px;

              /* 托盘项样式 */
              .tray-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(48, 65, 85, 0.9);
                margin: 0 0 8px 0;
                padding: 12px 15px;
                border-radius: 8px;
                cursor: move;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.15);
                position: relative;

                .tray-info {
                  display: flex;
                  flex-direction: column;
                  gap: 4px;
                  width: 100%;
                  .tray-info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 8px;
                    .tray-name {
                      font-weight: 500;
                      color: rgba(255, 255, 255, 0.9);
                      font-size: 14px;
                    }

                    .tray-batch-group {
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      flex-wrap: wrap;
                      justify-content: flex-end;
                    }

                    .tray-batch {
                      font-size: 12px;
                      color: #0ac5a8;
                      background: rgba(10, 197, 168, 0.1);
                      padding: 2px 8px;
                      border-radius: 4px;
                      white-space: nowrap;

                      .sequence-number {
                        color: #ffa500;
                        font-weight: bold;
                        margin-left: 4px;
                      }
                    }

                    .tray-detail {
                      font-size: 11px;
                      color: rgba(255, 255, 255, 0.7);
                      word-break: break-word;
                      line-height: 1.4;
                      flex: 1;
                      text-align: left;
                    }
                  }
                  .tray-time {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                  }
                }
                .tray-actions {
                  display: flex;
                  gap: 4px;
                  position: absolute;
                  right: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  opacity: 0;
                  transition: opacity 0.3s ease;
                }

                .move-btn {
                  width: 24px;
                  height: 24px;
                  padding: 0;
                  border-radius: 50%;

                  &:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                  }

                  &:not(.is-disabled):hover {
                    background-color: #409eff;
                    border-color: #409eff;
                  }
                }

                .el-button {
                  &:not(.move-btn) {
                    width: 24px;
                    height: 24px;
                    padding: 0;
                    border-radius: 50%;
                  }
                }
              }
              .tray-item:hover {
                background: rgba(48, 65, 85, 1);
                border-color: rgba(10, 197, 168, 0.5);
                transform: translateX(2px);
                .tray-actions {
                  opacity: 1;
                }
              }
              .tray-item:last-child {
                margin-bottom: 0;
              }
              .tray-item.dragging {
                opacity: 0.6;
                transform: scale(0.98);
                border: 1px dashed rgba(255, 255, 255, 0.3);
              }
              /* 添加空状态样式 */
              .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px 0;
                color: rgba(255, 255, 255, 0.6);
                i {
                  font-size: 48px;
                  margin-bottom: 16px;
                  color: rgba(255, 255, 255, 0.3);
                }
                p {
                  font-size: 14px;
                  margin: 0 0 16px 0;
                }
                .el-button {
                  color: #0ac5a8;
                  font-size: 14px;
                  i {
                    font-size: 14px;
                    margin-right: 4px;
                    color: inherit;
                  }
                }
                .el-button:hover {
                  color: #0db196;
                }
              }
            }
          }
        }
      }
    }
    /* 展开状态的样式 */
    .queue-section.expanded {
      padding: 15px;
      width: 850px;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    /* 收起状态的样式 */
    .queue-section:not(.expanded) {
      width: 40px;
      height: 40px;
      padding: 0;
      background: none;
      box-shadow: none;
      border: none;
      .section-header {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #0ac5a8;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        padding: 0;
        span {
          display: none;
        }
        i {
          color: #fff;
          font-size: 20px;
          animation: rotate 10s linear infinite;
        }
      }
      .section-header:hover {
        transform: scale(1.1);
        background: #0db196;
      }
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

/* 添加新的测试面板样式 */
.test-panel-container {
  position: absolute; /* 修改位置，为测试按钮留出空间 */
  right: 80px; /* 修改位置，为队列按钮留出空间 */
  top: 20px;
  z-index: 1000;
}

.test-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0ac5a8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.test-toggle-btn:hover {
  transform: scale(1.1);
  background: #0db196;
}

.test-toggle-btn i {
  color: #fff;
  font-size: 20px;
  animation: rotate 10s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.test-panel {
  position: absolute;
  right: 50px;
  top: 0;
  width: 300px;
  max-height: 80vh; /* 限制最大高度为视窗高度的80% */
  background: rgba(30, 42, 56, 0.98);
  border: 1px solid rgba(10, 197, 168, 0.3);
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  transform-origin: top right;
  opacity: 1;
  transform: scale(1);
  display: flex;
  flex-direction: column;
}

.test-panel.collapsed {
  opacity: 0;
  transform: scale(0);
  pointer-events: none;
}

.test-panel-header {
  padding: 15px;
  background: rgba(10, 197, 168, 0.3);
  border-radius: 15px 15px 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #0ac5a8;
  font-weight: bold;
  pointer-events: auto;
  flex-shrink: 0;
}

.test-panel-content {
  padding: 15px;
  overflow-y: auto;
  pointer-events: auto;
  flex: 1;
}

/* 添加滚动条样式 */
.test-panel-content::-webkit-scrollbar {
  width: 4px;
}

.test-panel-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.test-panel-content::-webkit-scrollbar-thumb {
  background: rgba(10, 197, 168, 0.3);
  border-radius: 2px;
}

.test-panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 197, 168, 0.5);
}

.test-panel-header i {
  cursor: pointer;
  transition: all 0.3s ease;
}

.test-panel-header i:hover {
  color: #ff4d4f;
}

.test-section {
  margin-bottom: 20px;
  background: rgba(0, 0, 0, 0.4);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(10, 197, 168, 0.1);
}

.test-label {
  display: block;
  color: #0ac5a8;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: bold;
}

.position-buttons {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  pointer-events: auto;
}

.position-btn {
  padding: 6px 12px;
  background: rgba(10, 197, 168, 0.3);
  border: 1px solid rgba(10, 197, 168, 0.5);
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.position-btn:hover {
  background: rgba(10, 197, 168, 0.5);
}

.position-btn:active {
  transform: scale(0.95);
}

/* 小车位置滑块样式 */
.cart-position-test-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.cart-position-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-position-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cart-value {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  min-width: 50px;
  text-align: center;
}

.cart-position-slider-container {
  padding: 5px 0;
}

.cart-position-slider {
  width: 100%;
}

.cart-position-slider :deep(.el-slider__runway) {
  background-color: rgba(255, 255, 255, 0.1);
  height: 6px;
}

.cart-position-slider :deep(.el-slider__bar) {
  background-color: #0ac5a8;
  height: 6px;
}

.cart-position-slider :deep(.el-slider__button) {
  border: 2px solid #0ac5a8;
  background-color: #fff;
  width: 20px;
  height: 20px;
}

.cart-position-slider :deep(.el-slider__button:hover) {
  border-color: #0ac5a8;
  box-shadow: 0 0 5px rgba(10, 197, 168, 0.5);
}

/* 数量控制模块样式 */
.quantity-control-container {
  margin-top: 10px;

  .quantity-line-group {
    margin-bottom: 8px;
    padding: 3px;
    border: 1px solid #333;

    .quantity-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px;

      .quantity-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 2px 5px;
        border: 1px solid #444;

        .quantity-label {
          font-size: 11px;
          color: #ccc;
          min-width: 30px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 2px;

          .quantity-btn {
            width: 18px;
            height: 18px;
            border: 1px solid #666;
            background: #333;
            color: #fff;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              background: #555;
            }

            &.minus {
              color: #ff6b6b;
            }

            &.plus {
              color: #0ac5a8;
            }
          }

          .quantity-value {
            min-width: 20px;
            text-align: center;
            font-size: 11px;
            color: #fff;
          }
        }
      }
    }
  }
}

/* 测试添加结束 */

/* 添加队列移动相关样式 */
.queue-move-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.queue-select-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.queue-move-label {
  width: 60px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.queue-move-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.upload-area-actions {
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.upload-area-actions .el-button {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
  width: 100%;
}

.upload-area-actions .el-button:hover:not(:disabled) {
  background: rgba(10, 197, 168, 0.3);
  border-color: rgba(10, 197, 168, 0.5);
  color: #fff;
}

.upload-area-actions .el-button:disabled {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  cursor: not-allowed;
}

/* 添加新的测试面板样式 */
.task-test-container {
  margin-top: 10px;

  .task-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}

/* 托盘检索弹窗样式 */
.tray-search-form {
  .search-result {
    margin-top: 20px;
  }

  .no-result {
    margin-top: 20px;

    .no-result-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30px 20px;
      background: rgba(30, 42, 56, 0.8);
      border-radius: 8px;
      border: 1px solid rgba(255, 193, 7, 0.3);

      i {
        font-size: 48px;
        color: #ffc107;
        margin-bottom: 15px;
      }

      p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        margin: 0;
        text-align: center;
      }
    }
  }
}

/* 队列信息标题操作按钮样式 */
.header-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;

  .arrow-icon {
    cursor: pointer;
    transition: all 0.3s ease;
    color: #0ac5a8;
    font-size: 16px;

    &:hover {
      color: #fff;
      transform: scale(1.1);
    }
  }
}
</style>
