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
            <div class="section-title">
              <span>订单设置</span>
              <div class="title-actions">
                <div
                  class="add-order-btn"
                  @click="showAddOrderDialog"
                  title="新建订单"
                >
                  <i class="el-icon-plus"></i>
                </div>
              </div>
            </div>
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
                    <el-button
                      type="text"
                      size="small"
                      style="padding: 0px"
                      @click="cancelCurrentOrder(line)"
                    >
                      取消
                    </el-button>
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
                  class="motor-marker label-top"
                  :class="{ running: aLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">A1-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: aLineMotorRunning.bit4 === '1' }"
                  data-x="481"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">A1-5#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: aLineMotorRunning.bit5 === '1' }"
                  data-x="930"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">A1-6#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: aLineMotorRunning.bit9 === '1' }"
                  data-x="2130"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">A3-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: aLineMotorRunning.bit10 === '1' }"
                  data-x="2570"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">A3-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: aLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="423"
                  @click="toggleBitValue(aLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">A3-6#</div>
                </div>
                <!-- A线光电检测信号 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit1 === '1' }"
                  data-x="150"
                  data-y="423"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">A1-4#请求</div>
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
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">B1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit1 === '1' }"
                  data-x="481"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">B1-2#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit2 === '1' }"
                  data-x="930"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">B1-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">B1-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit4 === '1' }"
                  data-x="481"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">B1-5#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit5 === '1' }"
                  data-x="930"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">B1-6#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit6 === '1' }"
                  data-x="2130"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">B3-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit7 === '1' }"
                  data-x="2570"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">B3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: bLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="520"
                  @click="toggleBitValue(bLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">B3-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit9 === '1' }"
                  data-x="2130"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">B3-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: bLineMotorRunning.bit10 === '1' }"
                  data-x="2570"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">B3-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: bLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="575"
                  @click="toggleBitValue(bLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">B3-6#</div>
                </div>
                <!-- B线光电检测信号 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit2 === '1' }"
                  data-x="150"
                  data-y="525"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">B1-1#请求</div>
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
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit3 === '1' }"
                  data-x="150"
                  data-y="572"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">B1-4#请求</div>
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
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">C1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit1 === '1' }"
                  data-x="481"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">C1-2#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit2 === '1' }"
                  data-x="930"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">C1-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">C1-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit4 === '1' }"
                  data-x="481"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">C1-5#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit5 === '1' }"
                  data-x="930"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">C1-6#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit6 === '1' }"
                  data-x="2130"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">C3-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit7 === '1' }"
                  data-x="2570"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">C3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: cLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="671"
                  @click="toggleBitValue(cLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">C3-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit9 === '1' }"
                  data-x="2130"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">C3-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: cLineMotorRunning.bit10 === '1' }"
                  data-x="2570"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">C3-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: cLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="723"
                  @click="toggleBitValue(cLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">C3-6#</div>
                </div>
                <!-- C线光电检测信号 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit4 === '1' }"
                  data-x="150"
                  data-y="673"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">C1-1#请求</div>
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
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit5 === '1' }"
                  data-x="150"
                  data-y="718"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">C1-4#请求</div>
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
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">D1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit1 === '1' }"
                  data-x="481"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">D1-2#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit2 === '1' }"
                  data-x="930"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">D1-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">D1-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit4 === '1' }"
                  data-x="481"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">D1-5#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit5 === '1' }"
                  data-x="930"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">D1-6#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit6 === '1' }"
                  data-x="2130"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">D3-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit7 === '1' }"
                  data-x="2570"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">D3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: dLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="820"
                  @click="toggleBitValue(dLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">D3-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit9 === '1' }"
                  data-x="2130"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">D3-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: dLineMotorRunning.bit10 === '1' }"
                  data-x="2570"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">D3-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: dLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="872"
                  @click="toggleBitValue(dLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">D3-6#</div>
                </div>
                <!-- D线光电检测信号 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit6 === '1' }"
                  data-x="150"
                  data-y="820"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">D1-1#请求</div>
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
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit7 === '1' }"
                  data-x="150"
                  data-y="867"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">D1-4#请求</div>
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
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit0 === '1' }"
                  data-x="180"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label" style="width: 36px">E1-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit1 === '1' }"
                  data-x="481"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label" style="width: 36px">E1-2#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit2 === '1' }"
                  data-x="930"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label" style="width: 36px">E1-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit3 === '1' }"
                  data-x="180"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label" style="width: 36px">E1-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit4 === '1' }"
                  data-x="481"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label" style="width: 36px">E1-5#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit5 === '1' }"
                  data-x="930"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label" style="width: 36px">E1-6#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit6 === '1' }"
                  data-x="2130"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label" style="width: 36px">E3-1#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit7 === '1' }"
                  data-x="2570"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label" style="width: 36px">E3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: eLineMotorRunning.bit8 === '1' }"
                  data-x="2750"
                  data-y="969"
                  @click="toggleBitValue(eLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label" style="width: 36px">E3-3#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit9 === '1' }"
                  data-x="2130"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label" style="width: 36px">E3-4#</div>
                </div>
                <div
                  class="motor-marker label-top"
                  :class="{ running: eLineMotorRunning.bit10 === '1' }"
                  data-x="2570"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label" style="width: 36px">E3-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: eLineMotorRunning.bit11 === '1' }"
                  data-x="2750"
                  data-y="1020"
                  @click="toggleBitValue(eLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label" style="width: 36px">E3-6#</div>
                </div>
                <!-- E线光电检测信号 -->
                <div
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit8 === '1' }"
                  data-x="150"
                  data-y="970"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">E1-1#请求</div>
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
                  class="marker label-right"
                  :class="{ scanning: scanPhotoelectricSignal.bit9 === '1' }"
                  data-x="150"
                  data-y="1015"
                  @click="toggleBitValue(scanPhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">E1-4#请求</div>
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
                  :class="{ active: lineAllowLoadingStatus['A1-5'] }"
                  data-x="100"
                  data-y="423"
                >
                  <div class="marker-label">A1-4#进货</div>
                </div>
                <!-- A1-4#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="423">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.A14 }}
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 上货口需进货信息 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['B1-2'] }"
                  data-x="100"
                  data-y="520"
                >
                  <div class="marker-label">B1-1#进货</div>
                </div>
                <!-- B1-1#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="520">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.B11 }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['B1-5'] }"
                  data-x="100"
                  data-y="575"
                >
                  <div class="marker-label">B1-4#进货</div>
                </div>
                <!-- B1-4#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="575">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.B14 }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['C1-2'] }"
                  data-x="100"
                  data-y="671"
                >
                  <div class="marker-label">C1-1#进货</div>
                </div>
                <!-- C1-1#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="671">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.C11 }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['C1-5'] }"
                  data-x="100"
                  data-y="723"
                >
                  <div class="marker-label">C1-4#进货</div>
                </div>
                <!-- C1-4#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="723">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.C14 }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['D1-2'] }"
                  data-x="100"
                  data-y="820"
                >
                  <div class="marker-label">D1-1#进货</div>
                </div>
                <!-- D1-1#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="820">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.D11 }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['D1-5'] }"
                  data-x="100"
                  data-y="872"
                >
                  <div class="marker-label">D1-4#进货</div>
                </div>
                <!-- D1-4#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="872">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.D14 }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['E1-2'] }"
                  data-x="100"
                  data-y="969"
                >
                  <div class="marker-label">E1-1#进货</div>
                </div>
                <!-- E1-1#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="969">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.E11 }}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  class="arrow-marker label-top"
                  :class="{ active: lineAllowLoadingStatus['E1-5'] }"
                  data-x="100"
                  data-y="1020"
                >
                  <div class="marker-label">E1-4#进货</div>
                </div>
                <!-- E1-4#需进货信息卡片 -->
                <div class="marker-with-panel" data-x="100" data-y="1020">
                  <div
                    class="data-panel"
                    :class="['position-left', { 'always-show': true }]"
                    style="
                      width: 40px;
                      padding: 3px;
                      border-radius: 5px;
                      text-align: center;
                      font-weight: bold;
                      box-shadow: none;
                    "
                  >
                    <div class="data-panel-content">
                      <div class="data-panel-row" style="color: #293849">
                        需进:{{ stockRequiredInfo.E14 }}
                      </div>
                    </div>
                  </div>
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
                                <span class="scan-value">{{
                                  uploadScanInfo.A14
                                }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- B组 -->
                          <div class="scan-group">
                            <div class="group-header">B线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">B1-1：</span>
                                <span class="scan-value">{{
                                  uploadScanInfo.B11
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">B1-4：</span>
                                <span class="scan-value">{{
                                  uploadScanInfo.B14
                                }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- C组 -->
                          <div class="scan-group">
                            <div class="group-header">C线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">C1-1：</span>
                                <span class="scan-value">{{
                                  uploadScanInfo.C11
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">C1-4：</span>
                                <span class="scan-value">{{
                                  uploadScanInfo.C14
                                }}</span>
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
                                <span class="scan-value">{{
                                  uploadScanInfo.D11
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">D1-4：</span>
                                <span class="scan-value">{{
                                  uploadScanInfo.D14
                                }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- E组 -->
                          <div class="scan-group">
                            <div class="group-header">E线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">E1-1：</span>
                                <span class="scan-value">{{
                                  uploadScanInfo.E11
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">E1-4：</span>
                                <span class="scan-value">{{
                                  uploadScanInfo.E14
                                }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 出货箭头指示器 -->
                <!-- A3-5#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['A3-5'] }"
                  data-x="2840"
                  data-y="423"
                >
                  <div class="marker-label">A3-5#出货</div>
                </div>
                <!-- B3-2#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['B3-2'] }"
                  data-x="2840"
                  data-y="520"
                >
                  <div class="marker-label">B3-2#出货</div>
                </div>
                <!-- B3-5#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['B3-5'] }"
                  data-x="2840"
                  data-y="575"
                >
                  <div class="marker-label">B3-5#出货</div>
                </div>
                <!-- C3-2#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['C3-2'] }"
                  data-x="2840"
                  data-y="671"
                >
                  <div class="marker-label">C3-2#出货</div>
                </div>
                <!-- C3-5#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['C3-5'] }"
                  data-x="2840"
                  data-y="723"
                >
                  <div class="marker-label">C3-5#出货</div>
                </div>
                <!-- D3-2#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['D3-2'] }"
                  data-x="2840"
                  data-y="820"
                >
                  <div class="marker-label">D3-2#出货</div>
                </div>
                <!-- D3-5#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['D3-5'] }"
                  data-x="2840"
                  data-y="872"
                >
                  <div class="marker-label">D3-5#出货</div>
                </div>
                <!-- E3-2#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['E3-2'] }"
                  data-x="2840"
                  data-y="969"
                >
                  <div class="marker-label">E3-2#出货</div>
                </div>
                <!-- E3-5#出货箭头 -->
                <div
                  class="arrow-marker label-top"
                  :class="{ active: outWarehouseArrowStatus['E3-5'] }"
                  data-x="2840"
                  data-y="1020"
                >
                  <div class="marker-label">E3-5#出货</div>
                </div>
                <!-- 预热/灭菌完成信号组（通过配置数组渲染） -->
                <div
                  v-for="marker in preheatDisinfectMarkers"
                  :key="marker.key"
                  class="analysis-status-marker"
                  :data-x="marker.x"
                  :data-y="marker.y"
                >
                  <el-tag
                    v-show="getMarkerVisible(marker)"
                    type="success"
                    size="small"
                  >
                    {{ marker.label }}
                  </el-tag>
                </div>
                <!-- 解析完成信号组（通过配置数组渲染） -->
                <div
                  v-for="marker in analysisMarkers"
                  :key="marker.key"
                  class="analysis-status-marker"
                  :data-x="marker.x"
                  :data-y="marker.y"
                >
                  <el-tag
                    v-show="getMarkerVisible(marker)"
                    type="success"
                    size="small"
                  >
                    {{ marker.label }}
                  </el-tag>
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
                                <span class="scan-label">A3-5：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.A35 || '--'
                                }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- B组 -->
                          <div class="scan-group">
                            <div class="group-header">B线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">B3-2：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.B32 || '--'
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">B3-5：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.B35 || '--'
                                }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- C组 -->
                          <div class="scan-group">
                            <div class="group-header">C线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">C3-2：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.C32 || '--'
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">C3-5：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.C35 || '--'
                                }}</span>
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
                                <span class="scan-label">D3-2：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.D32 || '--'
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">D3-5：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.D35 || '--'
                                }}</span>
                              </div>
                            </div>
                          </div>
                          <!-- E组 -->
                          <div class="scan-group">
                            <div class="group-header">E线</div>
                            <div class="group-items">
                              <div class="scan-item">
                                <span class="scan-label">E3-2：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.E32 || '--'
                                }}</span>
                              </div>
                              <div class="scan-item">
                                <span class="scan-label">E3-5：</span>
                                <span class="scan-value">{{
                                  outWarehouseTrayCode.E35 || '--'
                                }}</span>
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
                  style="width: 180px"
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
                  style="width: 180px"
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
                      <div class="line-container">
                        <div
                          class="line-item"
                          v-for="line in ['A', 'B', 'C', 'D', 'E']"
                          :key="line"
                        >
                          <div class="line-label">{{ line }}</div>
                          <div class="line-buttons">
                            <el-button
                              type="primary"
                              size="mini"
                              @click="sendToWarehouse(line)"
                              :loading="outWarehouseLoading[line]"
                              style="width: 100%; margin-bottom: 4px"
                            >
                              执行
                            </el-button>
                            <el-button
                              v-if="outWarehouseExecuting[line]"
                              type="danger"
                              size="mini"
                              @click="cancelOutWarehouse(line)"
                              style="width: 100%; margin-left: 0px"
                            >
                              取消
                            </el-button>
                          </div>
                          <div class="line-status">
                            <span
                              v-if="outWarehouseExecuting[line]"
                              style="
                                font-size: 10px;
                                color: greenyellow;
                                display: block;
                                margin-bottom: 2px;
                              "
                            >
                              执行中：{{ outWarehouseExecutingTrayCode[line] }}
                            </span>
                            <div
                              style="
                                font-size: 12px;
                                color: #9fe3d3;
                                text-align: left;
                              "
                            >
                              需出货：<b>{{ outNeedQty[line] || 0 }}</b>
                            </div>
                          </div>
                        </div>
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
                v-for="(queue, index) in queues"
                :key="'queue-' + queue.id + '-' + index"
                class="queue"
                :class="{ active: selectedQueueIndex === index }"
                @click="showTrays(index)"
                @dragover.prevent
                @drop="handleDrop(index)"
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
                  <span>小车1 (1000-2910):</span>
                  <span class="cart-value">{{ cartPositionValues.cart1 }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues.cart1"
                    :min="1000"
                    :max="2910"
                    :step="1"
                    class="cart-position-slider"
                  ></el-slider>
                </div>
              </div>
              <div class="cart-position-group">
                <div class="cart-position-label">
                  <span>小车2 (1000-2857):</span>
                  <span class="cart-value">{{ cartPositionValues.cart2 }}</span>
                </div>
                <div class="cart-position-slider-container">
                  <el-slider
                    v-model="cartPositionValues.cart2"
                    :min="1000"
                    :max="2857"
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
            <el-table-column
              label="操作"
              width="100"
              align="center"
              fixed="right"
            >
              <template slot-scope="{ row }">
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click.stop="deleteOrder(row)"
                  :loading="row.isDeleting"
                >
                  删除
                </el-button>
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

    <!-- 新建订单弹窗 -->
    <el-dialog
      title="新建订单"
      :visible.sync="addOrderDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
      class="add-order-dialog"
    >
      <div class="form-container">
        <el-form
          ref="newOrderForm"
          :model="newOrderForm"
          :rules="orderFormRules"
          label-width="120px"
          size="small"
        >
          <el-form-item label="生产总订单号" prop="orderId">
            <el-input
              v-model="newOrderForm.orderId"
              placeholder="请输入生产总订单号"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="产品编号" prop="productCode">
            <el-input
              v-model="newOrderForm.productCode"
              placeholder="请输入产品编号"
              maxlength="50"
            />
          </el-form-item>

          <el-form-item label="产品名称" prop="productName">
            <el-input
              v-model="newOrderForm.productName"
              placeholder="请输入产品名称"
              maxlength="100"
            />
          </el-form-item>

          <el-form-item
            label="托盘码"
            prop="trayCodes"
            class="tray-codes-section"
          >
            <div class="tray-codes-container">
              <div class="tray-input-section">
                <el-input
                  v-model="newOrderForm.currentTrayCode"
                  placeholder="请输入托盘码"
                  maxlength="50"
                  @keyup.enter="addTrayCode"
                />
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-plus"
                  @click="addTrayCode"
                  :disabled="!newOrderForm.currentTrayCode.trim()"
                >
                  添加
                </el-button>
              </div>

              <div
                class="tray-codes-display"
                v-if="newOrderForm.trayCodes.length > 0"
              >
                <div class="tray-codes-list">
                  <div
                    v-for="(code, index) in newOrderForm.trayCodes"
                    :key="index"
                    class="tray-code-tag"
                  >
                    <span class="tray-code-text">{{ code }}</span>
                    <el-button
                      type="text"
                      icon="el-icon-close"
                      @click="removeTrayCode(index)"
                      class="remove-btn"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddOrder">取消</el-button>
        <el-button
          type="primary"
          @click="submitAddOrder"
          :loading="isSubmittingOrder"
        >
          确定
        </el-button>
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
      // 上货扫码信息面板数据
      uploadScanInfo: {
        A14: '--', // A1-4
        B11: '--', // B1-1
        B14: '--', // B1-4
        C11: '--', // C1-1
        C14: '--', // C1-4
        D11: '--', // D1-1
        D14: '--', // D1-4
        E11: '--', // E1-1
        E14: '--' // E1-4
      },
      // 需进货信息数据
      stockRequiredInfo: {
        A14: 0, // A1-4
        B11: 0, // B1-1
        B14: 0, // B1-4
        C11: 0, // C1-1
        C14: 0, // C1-4
        D11: 0, // D1-1
        D14: 0, // D1-4
        E11: 0, // E1-1
        E14: 0 // E1-4
      },
      // 各线允许上货状态映射
      lineAllowLoadingStatus: {
        'A1-5': false, // A1-4
        'B1-2': false, // B1-1
        'B1-5': false, // B1-4
        'C1-2': false, // C1-1
        'C1-5': false, // C1-4
        'D1-2': false, // D1-1
        'D1-5': false, // D1-4
        'E1-2': false, // E1-1
        'E1-5': false // E1-4
      },
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
      availableOrders: [],
      // 新建订单相关
      addOrderDialogVisible: false,
      isSubmittingOrder: false,
      newOrderForm: {
        orderId: '',
        productCode: '',
        productName: '',
        currentTrayCode: '', // 当前输入的托盘码
        trayCodes: [] // 已添加的托盘码列表
      },
      orderFormRules: {
        orderId: [
          { required: true, message: '请输入生产总订单号', trigger: 'blur' }
        ],
        productCode: [
          { required: true, message: '请输入产品编号', trigger: 'blur' }
        ],
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        trayCodes: [
          {
            required: true,
            message: '请至少添加一个托盘码',
            trigger: 'change',
            validator: (rule, value, callback) => {
              if (!value || value.length === 0) {
                callback(new Error('请至少添加一个托盘码'));
              } else {
                callback();
              }
            }
          }
        ]
      },
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
          width: 118,
          image: require('@/assets/pingan-wenjian-img/cart1.png')
        },
        {
          id: 2,
          name: '小车2',
          x: 1773,
          y: 388, // 对应PLC值0的位置（y轴最小值）
          width: 90,
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
        // {
        //   id: 1,
        //   queueName: 'A1-2',
        //   trayInfo: []
        // },
        // {
        //   id: 2,
        //   queueName: 'A1-3',
        //   trayInfo: []
        // },
        // {
        //   id: 3,
        //   queueName: 'A2-1-进',
        //   trayInfo: []
        // },
        // {
        //   id: 4,
        //   queueName: 'A3-1',
        //   trayInfo: []
        // },
        // {
        //   id: 5,
        //   queueName: 'A3-2',
        //   trayInfo: []
        // },
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
        { id: 6, name: 'A1-5', queueId: 6, x: 330, y: 420 },
        { id: 7, name: 'A1-6', queueId: 7, x: 810, y: 420 },
        { id: 8, name: 'A2-2-进', queueId: 8, x: 1400, y: 420 },
        { id: 9, name: 'A3-4', queueId: 9, x: 1970, y: 420 },
        { id: 10, name: 'A3-5', queueId: 10, x: 2440, y: 420 },
        { id: 11, name: 'B1-2', queueId: 11, x: 330, y: 518 },
        { id: 12, name: 'B1-3', queueId: 12, x: 810, y: 518 },
        { id: 13, name: 'B2-1-进', queueId: 13, x: 1400, y: 518 },
        { id: 14, name: 'B3-1', queueId: 14, x: 1970, y: 518 },
        { id: 15, name: 'B3-2', queueId: 15, x: 2440, y: 518 },
        { id: 16, name: 'B1-5', queueId: 16, x: 330, y: 578 },
        { id: 17, name: 'B1-6', queueId: 17, x: 810, y: 578 },
        { id: 18, name: 'B2-2-进', queueId: 18, x: 1400, y: 578 },
        { id: 19, name: 'B3-4', queueId: 19, x: 1970, y: 578 },
        { id: 20, name: 'B3-5', queueId: 20, x: 2440, y: 578 },
        { id: 21, name: 'C1-2', queueId: 21, x: 330, y: 670 },
        { id: 22, name: 'C1-3', queueId: 22, x: 810, y: 670 },
        { id: 23, name: 'C2-1-进', queueId: 23, x: 1400, y: 670 },
        { id: 24, name: 'C3-1', queueId: 24, x: 1970, y: 670 },
        { id: 25, name: 'C3-2', queueId: 25, x: 2440, y: 670 },
        { id: 26, name: 'C1-5', queueId: 26, x: 330, y: 730 },
        { id: 27, name: 'C1-6', queueId: 27, x: 810, y: 730 },
        { id: 28, name: 'C2-2-进', queueId: 28, x: 1400, y: 730 },
        { id: 29, name: 'C3-4', queueId: 29, x: 1970, y: 730 },
        { id: 30, name: 'C3-5', queueId: 30, x: 2440, y: 730 },
        { id: 31, name: 'D1-2', queueId: 31, x: 330, y: 820 },
        { id: 32, name: 'D1-3', queueId: 32, x: 810, y: 820 },
        { id: 33, name: 'D2-1-进', queueId: 33, x: 1400, y: 820 },
        { id: 34, name: 'D3-1', queueId: 34, x: 1970, y: 820 },
        { id: 35, name: 'D3-2', queueId: 35, x: 2440, y: 820 },
        { id: 36, name: 'D1-5', queueId: 36, x: 330, y: 880 },
        { id: 37, name: 'D1-6', queueId: 37, x: 810, y: 880 },
        { id: 38, name: 'D2-2-进', queueId: 38, x: 1400, y: 880 },
        { id: 39, name: 'D3-4', queueId: 39, x: 1970, y: 880 },
        { id: 40, name: 'D3-5', queueId: 40, x: 2440, y: 880 },
        { id: 41, name: 'E1-2', queueId: 41, x: 330, y: 970 },
        { id: 42, name: 'E1-3', queueId: 42, x: 810, y: 970 },
        { id: 43, name: 'E2-1-进', queueId: 43, x: 1400, y: 970 },
        { id: 44, name: 'E3-1', queueId: 44, x: 1970, y: 970 },
        { id: 45, name: 'E3-2', queueId: 45, x: 2440, y: 970 },
        { id: 46, name: 'E1-5', queueId: 46, x: 330, y: 1030 },
        { id: 47, name: 'E1-6', queueId: 47, x: 810, y: 1030 },
        { id: 48, name: 'E2-2-进', queueId: 48, x: 1400, y: 1030 },
        { id: 49, name: 'E3-4', queueId: 49, x: 1970, y: 1030 },
        { id: 50, name: 'E3-5', queueId: 50, x: 2440, y: 1030 },
        // { id: 51, name: 'A2-1-进', queueId: 51, x: 330, y: 1120 },
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
      },
      // 预热到灭菌柜相关
      disinfectionRoomSelectedFrom: null, // 选择的预热房
      disinfectionRoomSelectedTo: null, // 选择的灭菌柜
      disinfectionRoomLoading: false,
      disinfectionExecuting: false,
      disinfectionTrayCode: '',
      disinfectionNeedQty: 0,
      // 预热到灭菌的目标总数量（起始地队列数量+目的地已有队列数量）
      disinfectionTargetTotal: 0,
      // 灭菌柜到解析房相关
      warehouseSelectedFrom: null, // 选择的灭菌柜
      warehouseSelectedTo: null, // 选择的解析房
      analysisRoomLoading: false,
      analysisExecuting: false,
      analysisTrayCode: '',
      analysisNeedQty: 0,
      // 灭菌到解析的目标总数量（起始地队列数量+目的地已有队列数量）
      analysisTargetTotal: 0,
      // 出库相关 - 每条线独立管理
      outWarehouseLoading: {
        A: false,
        B: false,
        C: false,
        D: false,
        E: false
      },
      outWarehouseExecuting: {
        A: false,
        B: false,
        C: false,
        D: false,
        E: false
      },
      outWarehouseTrayCode: {
        A35: '', // A线只有1条出库线
        B32: '', // B线第1条出库线
        B35: '', // B线第2条出库线
        C32: '', // C线第1条出库线
        C35: '', // C线第2条出库线
        D32: '', // D线第1条出库线
        D35: '', // D线第2条出库线
        E32: '', // E线第1条出库线
        E35: '' // E线第2条出库线
      },
      // 出库执行中的托盘号
      outWarehouseExecutingTrayCode: {
        A: '',
        B: '',
        C: '',
        D: '',
        E: ''
      },
      // 出货箭头状态管理
      outWarehouseArrowStatus: {
        'A3-2': false, // A3-2#允许出货信号
        'A3-5': false, // A3-5#允许出货信号
        'B3-2': false, // B3-2#允许出货信号
        'B3-5': false, // B3-5#允许出货信号
        'C3-2': false, // C3-2#允许出货信号
        'C3-5': false, // C3-5#允许出货信号
        'D3-2': false, // D3-2#允许出货信号
        'D3-5': false, // D3-5#允许出货信号
        'E3-2': false, // E3-2#允许出货信号
        'E3-5': false // E3-5#允许出货信号
      },
      outNeedQty: {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0
      },
      // 预热、灭菌完成信号
      disinfectionCompleted: {
        bit0: '0', // YR1-1预热完成
        bit1: '0', // YR1-2预热完成
        bit2: '0', // YR2-1预热完成
        bit3: '0', // YR2-1预热完成
        bit4: '0', // YR3-1预热完成
        bit5: '0', // YR3-2预热完成
        bit6: '0', // YR4-1预热完成
        bit7: '0', // YR4-2预热完成
        bit8: '0', // YR5-1预热完成
        bit9: '0', // YR5-2预热完成
        bit10: '0', // MJ-1灭菌完成
        bit11: '0', // MJ-2灭菌完成
        bit12: '0', // MJ-3灭菌完成
        bit13: '0', // MJ-4灭菌完成
        bit14: '0' // MJ-5灭菌完成
      },
      // 解析完成信号
      analysisCompleted: {
        bit0: '0', // JX1-1解析完成
        bit1: '0', // JX1-2解析完成
        bit2: '0', // JX2-1解析完成
        bit3: '0', // JX2-2解析完成
        bit4: '0', // JX3-1解析完成
        bit5: '0', // JX3-2解析完成
        bit6: '0', // JX4-1解析完成
        bit7: '0', // JX4-2解析完成
        bit8: '0', // JX5-1解析完成
        bit9: '0' // JX5-2解析完成
      },
      // 预热/灭菌完成 - 配置化渲染（位置可直接在此设置）
      preheatDisinfectMarkers: [
        // {
        //   key: 'dis_bit0',
        //   source: 'disinfectionCompleted',
        //   bit: 'bit0',
        //   label: 'YR1-1预热完成',
        //   x: 160,
        //   y: 170
        // },
        {
          key: 'dis_bit1',
          source: 'disinfectionCompleted',
          bit: 'bit1',
          label: '预热完成',
          x: 1015,
          y: 420
        },
        {
          key: 'dis_bit2',
          source: 'disinfectionCompleted',
          bit: 'bit2',
          label: '预热完成',
          x: 1015,
          y: 515
        },
        {
          key: 'dis_bit3',
          source: 'disinfectionCompleted',
          bit: 'bit3',
          label: '预热完成',
          x: 1015,
          y: 567
        },
        {
          key: 'dis_bit4',
          source: 'disinfectionCompleted',
          bit: 'bit4',
          label: '预热完成',
          x: 1015,
          y: 667
        },
        {
          key: 'dis_bit5',
          source: 'disinfectionCompleted',
          bit: 'bit5',
          label: '预热完成',
          x: 1015,
          y: 717
        },
        {
          key: 'dis_bit6',
          source: 'disinfectionCompleted',
          bit: 'bit6',
          label: '预热完成',
          x: 1015,
          y: 817
        },
        {
          key: 'dis_bit7',
          source: 'disinfectionCompleted',
          bit: 'bit7',
          label: '预热完成',
          x: 1015,
          y: 872
        },
        {
          key: 'dis_bit8',
          source: 'disinfectionCompleted',
          bit: 'bit8',
          label: '预热完成',
          x: 1015,
          y: 965
        },
        {
          key: 'dis_bit9',
          source: 'disinfectionCompleted',
          bit: 'bit9',
          label: '预热完成',
          x: 1015,
          y: 1020
        },
        {
          key: 'dis_bit10',
          source: 'disinfectionCompleted',
          bit: 'bit10',
          label: 'MJ-1灭菌完成',
          x: 1500,
          y: 470
        },
        {
          key: 'dis_bit11',
          source: 'disinfectionCompleted',
          bit: 'bit11',
          label: 'MJ-2灭菌完成',
          x: 1500,
          y: 622
        },
        {
          key: 'dis_bit12',
          source: 'disinfectionCompleted',
          bit: 'bit12',
          label: 'MJ-3灭菌完成',
          x: 1500,
          y: 772
        },
        {
          key: 'dis_bit13',
          source: 'disinfectionCompleted',
          bit: 'bit13',
          label: 'MJ-4灭菌完成',
          x: 1500,
          y: 925
        },
        {
          key: 'dis_bit14',
          source: 'disinfectionCompleted',
          bit: 'bit14',
          label: 'MJ-5灭菌完成',
          x: 1500,
          y: 1080
        }
      ],
      // 解析完成 - 配置化渲染（位置可直接在此设置）
      analysisMarkers: [
        // {
        //   key: 'ana_bit0',
        //   source: 'analysisCompleted',
        //   bit: 'bit0',
        //   label: 'JX1-1解析完成',
        //   x: 0,
        //   y: 0
        // },
        {
          key: 'ana_bit1',
          source: 'analysisCompleted',
          bit: 'bit1',
          label: '解析完成',
          x: 2660,
          y: 420
        },
        {
          key: 'ana_bit2',
          source: 'analysisCompleted',
          bit: 'bit2',
          label: '解析完成',
          x: 2660,
          y: 515
        },
        {
          key: 'ana_bit3',
          source: 'analysisCompleted',
          bit: 'bit3',
          label: '解析完成',
          x: 2660,
          y: 567
        },
        {
          key: 'ana_bit4',
          source: 'analysisCompleted',
          bit: 'bit4',
          label: '解析完成',
          x: 2660,
          y: 667
        },
        {
          key: 'ana_bit5',
          source: 'analysisCompleted',
          bit: 'bit5',
          label: '解析完成',
          x: 2660,
          y: 717
        },
        {
          key: 'ana_bit6',
          source: 'analysisCompleted',
          bit: 'bit6',
          label: '解析完成',
          x: 2660,
          y: 817
        },
        {
          key: 'ana_bit7',
          source: 'analysisCompleted',
          bit: 'bit7',
          label: '解析完成',
          x: 2660,
          y: 872
        },
        {
          key: 'ana_bit8',
          source: 'analysisCompleted',
          bit: 'bit8',
          label: '解析完成',
          x: 2660,
          y: 965
        },
        {
          key: 'ana_bit9',
          source: 'analysisCompleted',
          bit: 'bit9',
          label: '解析完成',
          x: 2660,
          y: 1020
        }
      ]
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
  async mounted() {
    this.initializeMarkers();
    await this.loadQueueInfoFromDatabase();
    // 数据加载完成后创建监听
    this.$nextTick(() => {
      this.queues.forEach((queue, index) => {
        this.$watch(`queues.${index}.trayInfo`, {
          handler(newVal, oldVal) {
            this.updateQueueInfo(queue.id);
          },
          deep: true
        });
      });
    });
    // ipcRenderer.on('receivedMsg', (event, values, values2) => {
    //   // 使用位运算优化赋值
    //   const getBit = (word, bitIndex) => ((word >> bitIndex) & 1).toString();

    //   // A线电机运行信号 (DBW6)
    //   let word6 = this.convertToWord(values.DBW6);
    //   this.aLineMotorRunning.bit0 = getBit(word6, 8);
    //   this.aLineMotorRunning.bit1 = getBit(word6, 9);
    //   this.aLineMotorRunning.bit2 = getBit(word6, 10);
    //   this.aLineMotorRunning.bit3 = getBit(word6, 11);
    //   this.aLineMotorRunning.bit4 = getBit(word6, 12);
    //   this.aLineMotorRunning.bit5 = getBit(word6, 13);
    //   this.aLineMotorRunning.bit6 = getBit(word6, 14);
    //   this.aLineMotorRunning.bit7 = getBit(word6, 15);
    //   this.aLineMotorRunning.bit8 = getBit(word6, 0);
    //   this.aLineMotorRunning.bit9 = getBit(word6, 1);
    //   this.aLineMotorRunning.bit10 = getBit(word6, 2);
    //   this.aLineMotorRunning.bit11 = getBit(word6, 3);

    //   // A线光电检测信号 (DBW8)
    //   let word8 = this.convertToWord(values.DBW8);
    //   this.aLinePhotoelectricSignal.bit0 = getBit(word8, 8);
    //   this.aLinePhotoelectricSignal.bit1 = getBit(word8, 9);
    //   this.aLinePhotoelectricSignal.bit2 = getBit(word8, 10);
    //   this.aLinePhotoelectricSignal.bit3 = getBit(word8, 11);
    //   this.aLinePhotoelectricSignal.bit4 = getBit(word8, 12);
    //   this.aLinePhotoelectricSignal.bit5 = getBit(word8, 13);
    //   this.aLinePhotoelectricSignal.bit6 = getBit(word8, 14);
    //   this.aLinePhotoelectricSignal.bit7 = getBit(word8, 15);
    //   this.aLinePhotoelectricSignal.bit8 = getBit(word8, 0);
    //   this.aLinePhotoelectricSignal.bit9 = getBit(word8, 1);
    //   this.aLinePhotoelectricSignal.bit10 = getBit(word8, 2);
    //   this.aLinePhotoelectricSignal.bit11 = getBit(word8, 3);
    //   this.aLinePhotoelectricSignal.bit12 = getBit(word8, 4);
    //   this.aLinePhotoelectricSignal.bit13 = getBit(word8, 5);
    //   this.aLinePhotoelectricSignal.bit14 = getBit(word8, 6);
    //   this.aLinePhotoelectricSignal.bit15 = getBit(word8, 7);

    //   // B线电机运行信号 (DBW10)
    //   let word10 = this.convertToWord(values.DBW10);
    //   this.bLineMotorRunning.bit0 = getBit(word10, 8);
    //   this.bLineMotorRunning.bit1 = getBit(word10, 9);
    //   this.bLineMotorRunning.bit2 = getBit(word10, 10);
    //   this.bLineMotorRunning.bit3 = getBit(word10, 11);
    //   this.bLineMotorRunning.bit4 = getBit(word10, 12);
    //   this.bLineMotorRunning.bit5 = getBit(word10, 13);
    //   this.bLineMotorRunning.bit6 = getBit(word10, 14);
    //   this.bLineMotorRunning.bit7 = getBit(word10, 15);
    //   this.bLineMotorRunning.bit8 = getBit(word10, 0);
    //   this.bLineMotorRunning.bit9 = getBit(word10, 1);
    //   this.bLineMotorRunning.bit10 = getBit(word10, 2);
    //   this.bLineMotorRunning.bit11 = getBit(word10, 3);

    //   // B线光电检测信号 (DBW12)
    //   let word12 = this.convertToWord(values.DBW12);
    //   this.bLinePhotoelectricSignal.bit0 = getBit(word12, 8);
    //   this.bLinePhotoelectricSignal.bit1 = getBit(word12, 9);
    //   this.bLinePhotoelectricSignal.bit2 = getBit(word12, 10);
    //   this.bLinePhotoelectricSignal.bit3 = getBit(word12, 11);
    //   this.bLinePhotoelectricSignal.bit4 = getBit(word12, 12);
    //   this.bLinePhotoelectricSignal.bit5 = getBit(word12, 13);
    //   this.bLinePhotoelectricSignal.bit6 = getBit(word12, 14);
    //   this.bLinePhotoelectricSignal.bit7 = getBit(word12, 15);
    //   this.bLinePhotoelectricSignal.bit8 = getBit(word12, 0);
    //   this.bLinePhotoelectricSignal.bit9 = getBit(word12, 1);
    //   this.bLinePhotoelectricSignal.bit10 = getBit(word12, 2);
    //   this.bLinePhotoelectricSignal.bit11 = getBit(word12, 3);
    //   this.bLinePhotoelectricSignal.bit12 = getBit(word12, 4);
    //   this.bLinePhotoelectricSignal.bit13 = getBit(word12, 5);
    //   this.bLinePhotoelectricSignal.bit14 = getBit(word12, 6);
    //   this.bLinePhotoelectricSignal.bit15 = getBit(word12, 7);

    //   // C线电机运行信号 (DBW14)
    //   let word14 = this.convertToWord(values.DBW14);
    //   this.cLineMotorRunning.bit0 = getBit(word14, 8);
    //   this.cLineMotorRunning.bit1 = getBit(word14, 9);
    //   this.cLineMotorRunning.bit2 = getBit(word14, 10);
    //   this.cLineMotorRunning.bit3 = getBit(word14, 11);
    //   this.cLineMotorRunning.bit4 = getBit(word14, 12);
    //   this.cLineMotorRunning.bit5 = getBit(word14, 13);
    //   this.cLineMotorRunning.bit6 = getBit(word14, 14);
    //   this.cLineMotorRunning.bit7 = getBit(word14, 15);
    //   this.cLineMotorRunning.bit8 = getBit(word14, 0);
    //   this.cLineMotorRunning.bit9 = getBit(word14, 1);
    //   this.cLineMotorRunning.bit10 = getBit(word14, 2);
    //   this.cLineMotorRunning.bit11 = getBit(word14, 3);
    //   // C线光电检测信号 (DBW16)
    //   let word16 = this.convertToWord(values.DBW16);
    //   this.cLinePhotoelectricSignal.bit0 = getBit(word16, 8);
    //   this.cLinePhotoelectricSignal.bit1 = getBit(word16, 9);
    //   this.cLinePhotoelectricSignal.bit2 = getBit(word16, 10);
    //   this.cLinePhotoelectricSignal.bit3 = getBit(word16, 11);
    //   this.cLinePhotoelectricSignal.bit4 = getBit(word16, 12);
    //   this.cLinePhotoelectricSignal.bit5 = getBit(word16, 13);
    //   this.cLinePhotoelectricSignal.bit6 = getBit(word16, 14);
    //   this.cLinePhotoelectricSignal.bit7 = getBit(word16, 15);
    //   this.cLinePhotoelectricSignal.bit8 = getBit(word16, 0);
    //   this.cLinePhotoelectricSignal.bit9 = getBit(word16, 1);
    //   this.cLinePhotoelectricSignal.bit10 = getBit(word16, 2);
    //   this.cLinePhotoelectricSignal.bit11 = getBit(word16, 3);
    //   this.cLinePhotoelectricSignal.bit12 = getBit(word16, 4);
    //   this.cLinePhotoelectricSignal.bit13 = getBit(word16, 5);
    //   this.cLinePhotoelectricSignal.bit14 = getBit(word16, 6);
    //   this.cLinePhotoelectricSignal.bit15 = getBit(word16, 7);
    //   // D线电机运行信号-读取PLC
    //   let word18 = this.convertToWord(values.DBW18);
    //   this.dLineMotorRunning.bit0 = getBit(word18, 8);
    //   this.dLineMotorRunning.bit1 = getBit(word18, 9);
    //   this.dLineMotorRunning.bit2 = getBit(word18, 10);
    //   this.dLineMotorRunning.bit3 = getBit(word18, 11);
    //   this.dLineMotorRunning.bit4 = getBit(word18, 12);
    //   this.dLineMotorRunning.bit5 = getBit(word18, 13);
    //   this.dLineMotorRunning.bit6 = getBit(word18, 14);
    //   this.dLineMotorRunning.bit7 = getBit(word18, 15);
    //   this.dLineMotorRunning.bit8 = getBit(word18, 0);
    //   this.dLineMotorRunning.bit9 = getBit(word18, 1);
    //   this.dLineMotorRunning.bit10 = getBit(word18, 2);
    //   this.dLineMotorRunning.bit11 = getBit(word18, 3);
    //   // D线光电检测信号-读取PLC
    //   let word20 = this.convertToWord(values.DBW20);
    //   this.dLinePhotoelectricSignal.bit1 = getBit(word20, 9);
    //   this.dLinePhotoelectricSignal.bit2 = getBit(word20, 10);
    //   this.dLinePhotoelectricSignal.bit3 = getBit(word20, 11);
    //   this.dLinePhotoelectricSignal.bit4 = getBit(word20, 12);
    //   this.dLinePhotoelectricSignal.bit5 = getBit(word20, 13);
    //   this.dLinePhotoelectricSignal.bit6 = getBit(word20, 14);
    //   this.dLinePhotoelectricSignal.bit7 = getBit(word20, 15);
    //   this.dLinePhotoelectricSignal.bit8 = getBit(word20, 0);
    //   this.dLinePhotoelectricSignal.bit9 = getBit(word20, 1);
    //   this.dLinePhotoelectricSignal.bit10 = getBit(word20, 2);
    //   this.dLinePhotoelectricSignal.bit11 = getBit(word20, 3);
    //   this.dLinePhotoelectricSignal.bit12 = getBit(word20, 4);
    //   this.dLinePhotoelectricSignal.bit13 = getBit(word20, 5);
    //   this.dLinePhotoelectricSignal.bit14 = getBit(word20, 6);
    //   this.dLinePhotoelectricSignal.bit15 = getBit(word20, 7);
    //   // E线电机运行信号-读取PLC
    //   let word22 = this.convertToWord(values.DBW22);
    //   this.eLineMotorRunning.bit0 = getBit(word22, 8);
    //   this.eLineMotorRunning.bit1 = getBit(word22, 9);
    //   this.eLineMotorRunning.bit2 = getBit(word22, 10);
    //   this.eLineMotorRunning.bit3 = getBit(word22, 11);
    //   this.eLineMotorRunning.bit4 = getBit(word22, 12);
    //   this.eLineMotorRunning.bit5 = getBit(word22, 13);
    //   this.eLineMotorRunning.bit6 = getBit(word22, 14);
    //   this.eLineMotorRunning.bit7 = getBit(word22, 15);
    //   this.eLineMotorRunning.bit8 = getBit(word22, 0);
    //   this.eLineMotorRunning.bit9 = getBit(word22, 1);
    //   this.eLineMotorRunning.bit10 = getBit(word22, 2);
    //   this.eLineMotorRunning.bit11 = getBit(word22, 3);
    //   // E线光电检测信号-读取PLC
    //   let word24 = this.convertToWord(values.DBW24);
    //   this.eLinePhotoelectricSignal.bit1 = getBit(word24, 9);
    //   this.eLinePhotoelectricSignal.bit2 = getBit(word24, 10);
    //   this.eLinePhotoelectricSignal.bit3 = getBit(word24, 11);
    //   this.eLinePhotoelectricSignal.bit4 = getBit(word24, 12);
    //   this.eLinePhotoelectricSignal.bit5 = getBit(word24, 13);
    //   this.eLinePhotoelectricSignal.bit6 = getBit(word24, 14);
    //   this.eLinePhotoelectricSignal.bit7 = getBit(word24, 15);
    //   this.eLinePhotoelectricSignal.bit8 = getBit(word24, 0);
    //   this.eLinePhotoelectricSignal.bit9 = getBit(word24, 1);
    //   this.eLinePhotoelectricSignal.bit10 = getBit(word24, 2);
    //   this.eLinePhotoelectricSignal.bit11 = getBit(word24, 3);
    //   this.eLinePhotoelectricSignal.bit12 = getBit(word24, 4);
    //   this.eLinePhotoelectricSignal.bit13 = getBit(word24, 5);
    //   this.eLinePhotoelectricSignal.bit14 = getBit(word24, 6);
    //   this.eLinePhotoelectricSignal.bit15 = getBit(word24, 7);

    //   // A线数量-读取PLC
    //   this.aLineQuantity.a12 = Number(values.DBW28 ?? 0);
    //   this.aLineQuantity.a13 = Number(values.DBW30 ?? 0);
    //   this.aLineQuantity.a21in = Number(values.DBW32 ?? 0);
    //   this.aLineQuantity.a21out = Number(values.DBW140 ?? 0);
    //   this.aLineQuantity.a31 = Number(values.DBW34 ?? 0);
    //   this.aLineQuantity.a32 = Number(values.DBW36 ?? 0);
    //   this.aLineQuantity.a15 = Number(values.DBW38 ?? 0);
    //   this.aLineQuantity.a16 = Number(values.DBW40 ?? 0);
    //   this.aLineQuantity.a22in = Number(values.DBW42 ?? 0);
    //   this.aLineQuantity.a22out = Number(values.DBW142 ?? 0);
    //   this.aLineQuantity.a34 = Number(values.DBW44 ?? 0);
    //   this.aLineQuantity.a35 = Number(values.DBW46 ?? 0);

    //   // B线数量-读取PLC
    //   this.bLineQuantity.b12 = Number(values.DBW48 ?? 0);
    //   this.bLineQuantity.b13 = Number(values.DBW50 ?? 0);
    //   this.bLineQuantity.b21in = Number(values.DBW52 ?? 0);
    //   this.bLineQuantity.b21out = Number(values.DBW144 ?? 0);
    //   this.bLineQuantity.b31 = Number(values.DBW54 ?? 0);
    //   this.bLineQuantity.b32 = Number(values.DBW56 ?? 0);
    //   this.bLineQuantity.b15 = Number(values.DBW58 ?? 0);
    //   this.bLineQuantity.b16 = Number(values.DBW60 ?? 0);
    //   this.bLineQuantity.b22in = Number(values.DBW62 ?? 0);
    //   this.bLineQuantity.b22out = Number(values.DBW146 ?? 0);
    //   this.bLineQuantity.b34 = Number(values.DBW64 ?? 0);
    //   this.bLineQuantity.b35 = Number(values.DBW66 ?? 0);

    //   // C线数量-读取PLC
    //   this.cLineQuantity.c12 = Number(values.DBW68 ?? 0);
    //   this.cLineQuantity.c13 = Number(values.DBW70 ?? 0);
    //   this.cLineQuantity.c21in = Number(values.DBW72 ?? 0);
    //   this.cLineQuantity.c21out = Number(values.DBW148 ?? 0);
    //   this.cLineQuantity.c31 = Number(values.DBW74 ?? 0);
    //   this.cLineQuantity.c32 = Number(values.DBW76 ?? 0);
    //   this.cLineQuantity.c15 = Number(values.DBW78 ?? 0);
    //   this.cLineQuantity.c16 = Number(values.DBW80 ?? 0);
    //   this.cLineQuantity.c22in = Number(values.DBW82 ?? 0);
    //   this.cLineQuantity.c22out = Number(values.DBW150 ?? 0);
    //   this.cLineQuantity.c34 = Number(values.DBW84 ?? 0);
    //   this.cLineQuantity.c35 = Number(values.DBW86 ?? 0);

    //   // D线数量-读取PLC
    //   this.dLineQuantity.d12 = Number(values.DBW88 ?? 0);
    //   this.dLineQuantity.d13 = Number(values.DBW90 ?? 0);
    //   this.dLineQuantity.d21in = Number(values.DBW92 ?? 0);
    //   this.dLineQuantity.d21out = Number(values.DBW152 ?? 0);
    //   this.dLineQuantity.d31 = Number(values.DBW94 ?? 0);
    //   this.dLineQuantity.d32 = Number(values.DBW96 ?? 0);
    //   this.dLineQuantity.d15 = Number(values.DBW98 ?? 0);
    //   this.dLineQuantity.d16 = Number(values.DBW100 ?? 0);
    //   this.dLineQuantity.d22in = Number(values.DBW102 ?? 0);
    //   this.dLineQuantity.d22out = Number(values.DBW154 ?? 0);
    //   this.dLineQuantity.d34 = Number(values.DBW104 ?? 0);
    //   this.dLineQuantity.d35 = Number(values.DBW106 ?? 0);

    //   // E线数量-读取PLC
    //   this.eLineQuantity.e12 = Number(values.DBW108 ?? 0);
    //   this.eLineQuantity.e13 = Number(values.DBW110 ?? 0);
    //   this.eLineQuantity.e21in = Number(values.DBW112 ?? 0);
    //   this.eLineQuantity.e21out = Number(values.DBW156 ?? 0);
    //   this.eLineQuantity.e31 = Number(values.DBW114 ?? 0);
    //   this.eLineQuantity.e32 = Number(values.DBW116 ?? 0);
    //   this.eLineQuantity.e15 = Number(values.DBW118 ?? 0);
    //   this.eLineQuantity.e16 = Number(values.DBW120 ?? 0);
    //   this.eLineQuantity.e22in = Number(values.DBW122 ?? 0);
    //   this.eLineQuantity.e22out = Number(values.DBW158 ?? 0);
    //   this.eLineQuantity.e34 = Number(values.DBW124 ?? 0);
    //   this.eLineQuantity.e35 = Number(values.DBW126 ?? 0);

    //   // 上货区请求进货信号scanPhotoelectricSignal
    //   let word128 = this.convertToWord(values.DBW128);
    //   this.scanPhotoelectricSignal.bit0 = getBit(word128, 8);
    //   this.scanPhotoelectricSignal.bit1 = getBit(word128, 9);
    //   this.scanPhotoelectricSignal.bit2 = getBit(word128, 10);
    //   this.scanPhotoelectricSignal.bit3 = getBit(word128, 11);
    //   this.scanPhotoelectricSignal.bit4 = getBit(word128, 12);
    //   this.scanPhotoelectricSignal.bit5 = getBit(word128, 13);
    //   this.scanPhotoelectricSignal.bit6 = getBit(word128, 14);
    //   this.scanPhotoelectricSignal.bit7 = getBit(word128, 15);
    //   this.scanPhotoelectricSignal.bit8 = getBit(word128, 0);
    //   this.scanPhotoelectricSignal.bit9 = getBit(word128, 1);

    //   // 预热、灭菌完成信号
    //   let word160 = this.convertToWord(values.DBW160);
    //   this.disinfectionCompleted.bit0 = getBit(word160, 8);
    //   this.disinfectionCompleted.bit1 = getBit(word160, 9);
    //   this.disinfectionCompleted.bit2 = getBit(word160, 10);
    //   this.disinfectionCompleted.bit3 = getBit(word160, 11);
    //   this.disinfectionCompleted.bit4 = getBit(word160, 12);
    //   this.disinfectionCompleted.bit5 = getBit(word160, 13);
    //   this.disinfectionCompleted.bit6 = getBit(word160, 14);
    //   this.disinfectionCompleted.bit7 = getBit(word160, 15);
    //   this.disinfectionCompleted.bit8 = getBit(word160, 0);
    //   this.disinfectionCompleted.bit9 = getBit(word160, 1);
    //   this.disinfectionCompleted.bit10 = getBit(word160, 2);
    //   this.disinfectionCompleted.bit11 = getBit(word160, 3);
    //   this.disinfectionCompleted.bit12 = getBit(word160, 4);
    //   this.disinfectionCompleted.bit13 = getBit(word160, 5);
    //   this.disinfectionCompleted.bit14 = getBit(word160, 6);

    //   // 解析完成信号
    //   let word162 = this.convertToWord(values.DBW162);
    //   this.analysisCompleted.bit0 = getBit(word162, 8);
    //   this.analysisCompleted.bit1 = getBit(word162, 9);
    //   this.analysisCompleted.bit2 = getBit(word162, 10);
    //   this.analysisCompleted.bit3 = getBit(word162, 11);
    //   this.analysisCompleted.bit4 = getBit(word162, 12);
    //   this.analysisCompleted.bit5 = getBit(word162, 13);
    //   this.analysisCompleted.bit6 = getBit(word162, 14);
    //   this.analysisCompleted.bit7 = getBit(word162, 15);
    //   this.analysisCompleted.bit8 = getBit(word162, 0);
    //   this.analysisCompleted.bit9 = getBit(word162, 1);

    //   // 灭菌前1#小车位置值
    //   this.cartPositionValues.cart1 = Number(values.DBW134 ?? 0);
    //   // 灭菌前2#小车位置值
    //   this.cartPositionValues.cart2 = Number(values.DBW136 ?? 0);
    // });
    // 给PLC数据加载时间
    setTimeout(() => {
      this.addLog('isDataReady数据加载完成');
      this.isDataReady = true;
    }, 3000);
  },
  watch: {
    // ---- 新增：监听小车位置数值变化 ----
    'cartPositionValues.cart1'(newVal) {
      this.updateCartPositionByValue(1, newVal);
    },
    'cartPositionValues.cart2'(newVal) {
      this.updateCartPositionByValue(2, newVal);
    },
    // ---- 新增：监听各线体上货请求变量 ----
    'scanPhotoelectricSignal.bit0'(newVal, oldVal) {
      // A线上货请求 - bit0
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('A', '1-2');
      }
    },
    'scanPhotoelectricSignal.bit1'(newVal, oldVal) {
      // A线上货请求 - bit1
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('A', '1-5');
      }
    },
    'scanPhotoelectricSignal.bit2'(newVal, oldVal) {
      // B线上货请求 - bit2
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('B', '1-2');
      }
    },
    'scanPhotoelectricSignal.bit3'(newVal, oldVal) {
      // B线上货请求 - bit3
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('B', '1-5');
      }
    },
    'scanPhotoelectricSignal.bit4'(newVal, oldVal) {
      // C线上货请求 - bit4
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('C', '1-2');
      }
    },
    'scanPhotoelectricSignal.bit5'(newVal, oldVal) {
      // C线上货请求 - bit5
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('C', '1-5');
      }
    },
    'scanPhotoelectricSignal.bit6'(newVal, oldVal) {
      // D线上货请求 - bit6
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('D', '1-2');
      }
    },
    'scanPhotoelectricSignal.bit7'(newVal, oldVal) {
      // D线上货请求 - bit7
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('D', '1-5');
      }
    },
    'scanPhotoelectricSignal.bit8'(newVal, oldVal) {
      // E线上货请求 - bit8
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('E', '1-2');
      }
    },
    'scanPhotoelectricSignal.bit9'(newVal, oldVal) {
      // E线上货请求 - bit9
      if (newVal === '1' && oldVal === '0') {
        this.handleLoadingRequest('E', '1-5');
      }
    },
    // a16增加：从A1-5移动托盘到A1-6（不需要判断卡片，预热房内部）
    'aLineQuantity.a16'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // 从队列索引5(A1-5)移动到队列索引6(A1-6)
        this.moveTraysWithinRoom('A', 5, 6, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'A' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    // b13增加：从B1-2移动托盘到B1-3（不需要判断卡片）
    'bLineQuantity.b13'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('B', 10, 11, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'B' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    // b16增加：从B1-5移动托盘到B1-6（不需要判断卡片）
    'bLineQuantity.b16'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('B', 15, 16, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'B' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    'cLineQuantity.c13'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('C', 20, 21, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'C' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    'cLineQuantity.c16'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('C', 25, 26, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'C' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    'dLineQuantity.d13'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('D', 30, 31, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'D' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    'dLineQuantity.d16'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('D', 35, 36, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'D' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    'eLineQuantity.e13'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('E', 40, 41, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'E' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    'eLineQuantity.e16'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('E', 45, 46, increaseCount);
      }
      if (
        this.disinfectionRoomSelectedFrom === 'E' &&
        this.disinfectionExecuting
      ) {
        this.updateDisinfectionNeedAndWrite();
      }
    },
    // 监听灭菌柜入口数量变化 - 需要判断卡片（跨房间）
    'aLineQuantity.a22in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'A'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'a22in',
          newVal - oldVal
        );
      }
      // 检查是否需要停止执行：如果目的地队列数量等于目标总数量
      if (
        this.disinfectionRoomSelectedTo === 'A' &&
        this.disinfectionExecuting
      ) {
        const currentTotal = this.getSterilizeCountFor('A');
        if (currentTotal === this.disinfectionTargetTotal) {
          this.cancelDisinfectionRoom();
          this.addLog(
            `预热房到灭菌柜执行完成，目的地A2队列数量达到目标总数量${this.disinfectionTargetTotal}，已自动停止执行`
          );
        }
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'A') {
        this.checkDestinationLimit();
      }
    },
    'bLineQuantity.b21in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'B'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'b21in',
          newVal - oldVal
        );
      }
      // 检查是否需要停止执行：如果目的地队列数量等于目标总数量
      if (
        this.disinfectionRoomSelectedTo === 'B' &&
        this.disinfectionExecuting
      ) {
        const currentTotal = this.getSterilizeCountFor('B');
        if (currentTotal === this.disinfectionTargetTotal) {
          this.cancelDisinfectionRoom();
          this.addLog(
            `预热房到灭菌柜执行完成，目的地B2队列数量达到目标总数量${this.disinfectionTargetTotal}，已自动停止执行`
          );
        }
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'B') {
        this.checkDestinationLimit();
      }
    },
    'bLineQuantity.b22in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'B'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'b22in',
          newVal - oldVal
        );
      }
      // 检查是否需要停止执行：如果目的地队列数量等于目标总数量
      if (
        this.disinfectionRoomSelectedTo === 'B' &&
        this.disinfectionExecuting
      ) {
        const currentTotal = this.getSterilizeCountFor('B');
        if (currentTotal === this.disinfectionTargetTotal) {
          this.cancelDisinfectionRoom();
          this.addLog(
            `预热房到灭菌柜执行完成，目的地B2队列数量达到目标总数量${this.disinfectionTargetTotal}，已自动停止执行`
          );
        }
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'B') {
        this.checkDestinationLimit();
      }
    },
    'cLineQuantity.c21in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'C'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'c21in',
          newVal - oldVal
        );
      }
      // 检查是否需要停止执行：如果目的地队列数量等于目标总数量
      if (
        this.disinfectionRoomSelectedTo === 'C' &&
        this.disinfectionExecuting
      ) {
        const currentTotal = this.getSterilizeCountFor('C');
        if (currentTotal === this.disinfectionTargetTotal) {
          this.cancelDisinfectionRoom();
          this.addLog(
            `预热房到灭菌柜执行完成，目的地C2队列数量达到目标总数量${this.disinfectionTargetTotal}，已自动停止执行`
          );
        }
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'C') {
        this.checkDestinationLimit();
      }
    },
    'cLineQuantity.c22in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'C'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'c22in',
          newVal - oldVal
        );
      }
      // 检查是否需要停止执行：如果目的地队列数量等于目标总数量
      if (
        this.disinfectionRoomSelectedTo === 'C' &&
        this.disinfectionExecuting
      ) {
        const currentTotal = this.getSterilizeCountFor('C');
        if (currentTotal === this.disinfectionTargetTotal) {
          this.cancelDisinfectionRoom();
          this.addLog(
            `预热房到灭菌柜执行完成，目的地C2队列数量达到目标总数量${this.disinfectionTargetTotal}，已自动停止执行`
          );
        }
      }
    },
    'dLineQuantity.d21in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'D'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'd21in',
          newVal - oldVal
        );
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'D') {
        this.checkDestinationLimit();
      }
    },
    'dLineQuantity.d22in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'D'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'd22in',
          newVal - oldVal
        );
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'D') {
        this.checkDestinationLimit();
      }
    },
    'eLineQuantity.e21in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'E'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'e21in',
          newVal - oldVal
        );
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'E') {
        this.checkDestinationLimit();
      }
    },
    'eLineQuantity.e22in'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.disinfectionExecuting &&
        this.disinfectionRoomSelectedTo === 'E'
      ) {
        this.moveTrays(
          this.disinfectionRoomSelectedFrom,
          'e22in',
          newVal - oldVal
        );
      }
      // 检查目的地限制 - 只有当当前选择的灭菌房目的地是A时才检查
      if (this.disinfectionRoomSelectedTo === 'E') {
        this.checkDestinationLimit();
      }
    },
    // 监听灭菌柜出队列数量变化 - 类似DE队列规则
    'aLineQuantity.a22out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      // A灭菌柜出货数量从0增加，移动所有进货队列托盘到出货队列
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('A');
      }
      // 更新相关需进货数量
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'A') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'bLineQuantity.b21out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('B');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'B') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'bLineQuantity.b22out'(newVal, oldVal) {
      if (oldVal === 0 && newVal > 0) {
        if (!this.isDataReady) return;
        this.moveDisinfectionTraysToOut('B');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'B') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'cLineQuantity.c21out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('C');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'C') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'cLineQuantity.c22out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('C');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'C') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'dLineQuantity.d21out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('D');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'D') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'dLineQuantity.d22out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('D');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'D') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'eLineQuantity.e21out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('E');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'E') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    'eLineQuantity.e22out'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (oldVal === 0 && newVal > 0) {
        this.moveDisinfectionTraysToOut('E');
      }
      if (this.analysisExecuting && this.warehouseSelectedFrom === 'E') {
        this.updateAnalysisNeedAndWrite();
      }
    },
    // 监听解析房数量变化 - A线
    // a34增加：从A22-OUT移动托盘到A3-4（需要判断卡片，跨房间）
    'aLineQuantity.a34'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'A'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'a34',
          newVal - oldVal
        );
        const currentTotal = this.getAnalysisCountFor('A');
        if (currentTotal === this.analysisTargetTotal) {
          this.cancelAnalysisRoom();
          this.addLog(
            `灭菌柜到解析房执行完成，目的地A3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
          );
        }
        this.checkDestinationLimit();
      }
    },
    'aLineQuantity.b31'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'B'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'b31',
          newVal - oldVal
        );
        const currentTotal = this.getAnalysisCountFor('B');
        if (currentTotal === this.analysisTargetTotal) {
          this.cancelAnalysisRoom();
          this.addLog(
            `灭菌柜到解析房执行完成，目的地B3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
          );
        }
        this.checkDestinationLimit();
      }
    },
    'bLineQuantity.b34'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'B'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'b34',
          newVal - oldVal
        );
      }
      const currentTotal = this.getAnalysisCountFor('B');
      if (currentTotal === this.analysisTargetTotal) {
        this.cancelAnalysisRoom();
        this.addLog(
          `灭菌柜到解析房执行完成，目的地B3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
        );
      }
      this.checkDestinationLimit();
    },
    'cLineQuantity.c31'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'C'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'c31',
          newVal - oldVal
        );
      }
      const currentTotal = this.getAnalysisCountFor('C');
      if (currentTotal === this.analysisTargetTotal) {
        this.cancelAnalysisRoom();
        this.addLog(
          `灭菌柜到解析房执行完成，目的地C3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
        );
      }
      this.checkDestinationLimit();
    },
    'cLineQuantity.c34'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'C'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'c34',
          newVal - oldVal
        );
      }
      const currentTotal = this.getAnalysisCountFor('C');
      if (currentTotal === this.analysisTargetTotal) {
        this.cancelAnalysisRoom();
        this.addLog(
          `灭菌柜到解析房执行完成，目的地C3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
        );
      }
      this.checkDestinationLimit();
    },
    'dLineQuantity.d31'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'D'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'd31',
          newVal - oldVal
        );
      }
      const currentTotal = this.getAnalysisCountFor('D');
      if (currentTotal === this.analysisTargetTotal) {
        this.cancelAnalysisRoom();
        this.addLog(
          `灭菌柜到解析房执行完成，目的地C3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
        );
      }
      this.checkDestinationLimit();
    },
    'dLineQuantity.d34'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'D'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'd34',
          newVal - oldVal
        );
      }
      const currentTotal = this.getAnalysisCountFor('D');
      if (currentTotal === this.analysisTargetTotal) {
        this.cancelAnalysisRoom();
        this.addLog(
          `灭菌柜到解析房执行完成，目的地D3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
        );
      }
      this.checkDestinationLimit();
    },
    'eLineQuantity.e31'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'E'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'e31',
          newVal - oldVal
        );
      }
      const currentTotal = this.getAnalysisCountFor('E');
      if (currentTotal === this.analysisTargetTotal) {
        this.cancelAnalysisRoom();
        this.addLog(
          `灭菌柜到解析房执行完成，目的地E3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
        );
      }
      this.checkDestinationLimit();
    },
    'eLineQuantity.e34'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (
        newVal > oldVal &&
        this.analysisExecuting &&
        this.warehouseSelectedTo === 'E'
      ) {
        this.moveTraysFromDisinfectionToAnalysis(
          this.warehouseSelectedFrom,
          'e34',
          newVal - oldVal
        );
      }
      const currentTotal = this.getAnalysisCountFor('E');
      if (currentTotal === this.analysisTargetTotal) {
        this.cancelAnalysisRoom();
        this.addLog(
          `灭菌柜到解析房执行完成，目的地E3队列数量达到目标总数量${this.analysisTargetTotal}，已自动停止执行`
        );
      }
      this.checkDestinationLimit();
    },
    // a35增加：从A3-4移动托盘到A3-5（不需要判断卡片）
    // a35减少：出库（需要判断outWarehouseExecuting['A']）
    'aLineQuantity.a35'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        this.moveTraysWithinRoom('A', 8, 9, increaseCount);
      } else if (newVal < oldVal) {
        // A线出库
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.A) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 9; // A3-5队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`A35托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.A35 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('A');
            } else {
              this.addLog('A3-5队列空，无法出库');
              break;
            }
          }
        } else {
          this.addLog('未设置A线出库，但A35却减少了，程序错误！报警！');
        }
      }
    },
    // 监听解析房数量变化 - B/C/D/E线
    // b32增加：从B3-1移动托盘到B3-2
    // b32减少：B线第一条出库线
    'bLineQuantity.b32'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // B3-1（索引13）→ B3-2（索引14）
        this.moveTraysWithinRoom('B', 13, 14, increaseCount);
      } else if (newVal < oldVal) {
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.B) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 14; // B3-2队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`B32托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.B32 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('B');
            } else {
              this.addLog('B3-2队列空，无法出库');
              break;
            }
          }
          // 检查B3-2队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.bLineQuantity.b32 === 0 && this.outWarehouseExecuting.B) {
            this.addLog('B3-2队列数量为0，取消B3-2#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT2', false);
            this.outWarehouseArrowStatus['B3-2'] = false;
          }
        } else {
          this.addLog('未设置B线出库，但B32却减少了，程序错误！报警！');
        }
      }
    },
    'bLineQuantity.b35'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // B3-4（索引18）→ B3-5（索引19）
        this.moveTraysWithinRoom('B', 18, 19, increaseCount);
      } else if (newVal < oldVal) {
        // B线第二条出库线
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.B) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 19; // B3-5队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`B35托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.B35 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('B');
            } else {
              this.addLog('B3-5队列空，无法出库');
              break;
            }
          }
          // 检查B3-5队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.bLineQuantity.b35 === 0 && this.outWarehouseExecuting.B) {
            this.addLog('B3-5队列数量为0，取消B3-5#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT3', false);
            this.outWarehouseArrowStatus['B3-5'] = false;
          }
        } else {
          this.addLog('未设置B线出库，但B35却减少了，程序错误！报警！');
        }
      }
    },
    // c32增加：从C3-1移动托盘到C3-2
    // c32减少：C线第一条出库线
    'cLineQuantity.c32'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // C3-1（索引23）→ C3-2（索引24）
        this.moveTraysWithinRoom('C', 23, 24, increaseCount);
      } else if (newVal < oldVal) {
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.C) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 24; // C3-2队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`C32托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.C32 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('C');
            } else {
              this.addLog('C3-2队列空，无法出库');
              break;
            }
          }
          // 检查C3-2队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.cLineQuantity.c32 === 0 && this.outWarehouseExecuting.C) {
            this.addLog('C3-2队列数量为0，取消C3-2#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT4', false);
            this.outWarehouseArrowStatus['C3-2'] = false;
          }
        } else {
          this.addLog('未设置C线出库，但C32却减少了，程序错误！报警！');
        }
      }
    },
    'cLineQuantity.c35'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // C3-4（索引28）→ C3-5（索引29）
        this.moveTraysWithinRoom('C', 28, 29, increaseCount);
      } else if (newVal < oldVal) {
        // C线第二条出库线
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.C) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 29; // C3-5队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`C35托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.C35 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('C');
            } else {
              this.addLog('C3-5队列空，无法出库');
              break;
            }
          }
          // 检查C3-5队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.cLineQuantity.c35 === 0 && this.outWarehouseExecuting.C) {
            this.addLog('C3-5队列数量为0，取消C3-5#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT5', false);
            this.outWarehouseArrowStatus['C3-5'] = false;
          }
        } else {
          this.addLog('未设置C线出库，但C35却减少了，程序错误！报警！');
        }
      }
    },
    // d32增加：从D3-1移动托盘到D3-2
    // d32减少：D线第一条出库线
    'dLineQuantity.d32'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // D3-1（索引33）→ D3-2（索引34）
        this.moveTraysWithinRoom('D', 33, 34, increaseCount);
      } else if (newVal < oldVal) {
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.D) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 34; // D3-2队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`D32托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.D32 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('D');
            } else {
              this.addLog('D3-2队列空，无法出库');
              break;
            }
          }
          // 检查D3-2队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.dLineQuantity.d32 === 0 && this.outWarehouseExecuting.D) {
            this.addLog('D3-2队列数量为0，取消D3-2#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT6', false);
            this.outWarehouseArrowStatus['D3-2'] = false;
          }
        } else {
          this.addLog('未设置D线出库，但D32却减少了，程序错误！报警！');
        }
      }
    },
    'dLineQuantity.d35'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // D3-4（索引38）→ D3-5（索引39）
        this.moveTraysWithinRoom('D', 38, 39, increaseCount);
      } else if (newVal < oldVal) {
        // D线第二条出库线
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.D) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 39; // D3-5队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`D35托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.D35 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('D');
            } else {
              this.addLog('D3-5队列空，无法出库');
              break;
            }
          }
          // 检查D3-5队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.dLineQuantity.d35 === 0 && this.outWarehouseExecuting.D) {
            this.addLog('D3-5队列数量为0，取消D3-5#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT7', false);
            this.outWarehouseArrowStatus['D3-5'] = false;
          }
        } else {
          this.addLog('未设置D线出库，但D35却减少了，程序错误！报警！');
        }
      }
    },
    // e32增加：从E3-1移动托盘到E3-2
    // e32减少：E线第一条出库线
    'eLineQuantity.e32'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // E3-1（索引43）→ E3-2（索引44）
        this.moveTraysWithinRoom('E', 43, 44, increaseCount);
      } else if (newVal < oldVal) {
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.E) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 44; // E3-2队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`E32托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.E32 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('E');
            } else {
              this.addLog('E3-2队列空，无法出库');
              break;
            }
          }
          // 检查E3-2队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.eLineQuantity.e32 === 0 && this.outWarehouseExecuting.E) {
            this.addLog('E3-2队列数量为0，取消E3-2#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT8', false);
            this.outWarehouseArrowStatus['E3-2'] = false;
          }
        } else {
          this.addLog('未设置E线出库，但E32却减少了，程序错误！报警！');
        }
      }
    },
    'eLineQuantity.e35'(newVal, oldVal) {
      if (!this.isDataReady) return;
      if (newVal > oldVal) {
        const increaseCount = newVal - oldVal;
        // E3-4（索引48）→ E3-5（索引49）
        this.moveTraysWithinRoom('E', 48, 49, increaseCount);
      } else if (newVal < oldVal) {
        // E线第二条出库线
        const decreaseCount = oldVal - newVal;
        if (this.outWarehouseExecuting.E) {
          for (let i = 0; i < decreaseCount; i++) {
            const queueIndex = 49; // E3-5队列索引
            if (this.queues[queueIndex].trayInfo.length > 0) {
              const tray = this.queues[queueIndex].trayInfo[0];
              this.addLog(`E35托盘信息：${tray.trayCode} 出库`);
              this.outWarehouseTrayCode.E35 = tray.trayCode;
              this.queues[queueIndex].trayInfo.shift();
              this.updateOutNeedAndWrite('E');
            } else {
              this.addLog('E3-5队列空，无法出库');
              break;
            }
          }
          // 检查E3-5队列是否为0，如果为0则取消该条线的允许出货信号
          if (this.eLineQuantity.e35 === 0 && this.outWarehouseExecuting.E) {
            this.addLog('E3-5队列数量为0，取消E3-5#允许出货信号');
            ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT9', false);
            this.outWarehouseArrowStatus['E3-5'] = false;
          }
        } else {
          this.addLog('未设置E线出库，但E35却减少了，程序错误！报警！');
        }
      }
    },
    // 监听预热房到灭菌柜选择变化，自动更新需进货数量
    disinfectionRoomSelectedFrom(newVal) {
      if (!this.isDataReady) return;
      if (!newVal) {
        this.cancelDisinfectionRoom();
      }
    },
    // 监听灭菌柜到解析房选择变化，自动更新需进货数量
    warehouseSelectedFrom(newVal) {
      if (!newVal) {
        this.cancelAnalysisRoom();
      }

      // 检查灭菌到解析来源冲突：灭菌到解析的灭菌选择A，预热到灭菌的灭菌就不能选择A
      if (newVal && this.disinfectionRoomSelectedTo === newVal) {
        this.warehouseSelectedFrom = null;
        this.addLog(
          `灭菌房${newVal}已被选择为预热到灭菌的目的地，不能同时设置为灭菌到解析的来源，已自动取消灭菌到解析来源设置`
        );
        this.$message({
          message: `⚠️ 灭菌房${newVal}已被选择为预热到灭菌的目的地，不能同时设置为灭菌到解析的来源，已自动取消灭菌到解析来源设置`,
          type: 'warning',
          duration: 5000,
          showClose: true
        });
      }
    },
    // 监听灭菌房目的地选择变化
    disinfectionRoomSelectedTo(newVal) {
      if (!this.isDataReady) return;

      // 检查预热到灭菌目的地冲突：预热到灭菌的灭菌选择A，灭菌到解析的灭菌就不能选择A
      if (newVal && this.warehouseSelectedFrom === newVal) {
        this.disinfectionRoomSelectedTo = null;
        this.addLog(
          `灭菌房${newVal}已被选择为灭菌到解析的来源，不能同时设置为预热到灭菌的目的地，已自动取消预热到灭菌目的地设置`
        );
        this.$message({
          message: `⚠️ 灭菌房${newVal}已被选择为灭菌到解析的来源，不能同时设置为预热到灭菌的目的地，已自动取消预热到灭菌目的地设置`,
          type: 'warning',
          duration: 5000,
          showClose: true
        });
      }
    },
    // 监听解析库目的地选择变化
    warehouseSelectedTo(newVal) {
      if (!this.isDataReady) return;

      // 检查灭菌到解析目的地冲突：灭菌到解析的解析选择A，出库就不能选择A
      if (newVal && this.outWarehouseSelected === newVal) {
        this.warehouseSelectedTo = null;
        this.addLog(
          `解析库${newVal}已被选择为出库来源，不能同时设置为灭菌到解析的目的地，已自动取消灭菌到解析目的地设置`
        );
        this.$message({
          message: `⚠️ 解析库${newVal}已被选择为出库来源，不能同时设置为灭菌到解析的目的地，已自动取消灭菌到解析目的地设置`,
          type: 'warning',
          duration: 5000,
          showClose: true
        });
      }
    }
  },
  methods: {
    // 配置化完成信号可见性判断
    getMarkerVisible(marker) {
      const sourceName = marker && marker.source;
      const bitKey = marker && marker.bit;
      if (!sourceName || !bitKey) return false;
      const sourceObj =
        sourceName === 'disinfectionCompleted'
          ? this.disinfectionCompleted
          : this.analysisCompleted;
      return sourceObj && sourceObj[bitKey] === '1';
    },
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
    async showOrderDialog(line) {
      this.selectedLine = line;
      this.selectedOrderId = null;
      // 打开弹窗前刷新订单列表
      await this.refreshAvailableOrders();
      this.orderSelectDialogVisible = true;
    },
    // 刷新可用订单列表
    async refreshAvailableOrders() {
      try {
        const res = await HttpUtil.post('/order/queryOrderList', {});
        if (res.code === '200' && res.data) {
          // 处理订单数据，确保包含trays数组（根据trayCode字段解析）
          this.availableOrders = res.data.map((order) => {
            // 如果订单有trayCode字段，解析成托盘数组
            let trays = [];
            if (order.trayCode) {
              const trayCodes = order.trayCode
                .split(',')
                .filter((code) => code.trim());
              // 格式化insertTime为字符串
              const currentTime = order.insertTime
                ? typeof order.insertTime === 'string'
                  ? order.insertTime
                  : moment(order.insertTime).format('YYYY-MM-DD HH:mm:ss')
                : moment().format('YYYY-MM-DD HH:mm:ss');
              trays = trayCodes.map((trayCode, index) => {
                return {
                  id: `${order.orderId}-TRAY-${index + 1}`,
                  name: `托盘${index + 1}`,
                  orderId: order.orderId,
                  productName: order.productName || '',
                  productCode: order.productCode || '',
                  batchNo: order.batchNo || '', // 批号/备注，从订单中获取
                  unit: order.unit || '', // 规格，从订单中获取
                  isTerile: order.isTerile || 0, // 是否消毒
                  time: currentTime,
                  trayCode: trayCode.trim(),
                  receiptOrderCode: order.receiptOrderCode || '',
                  state: '0', // 未执行
                  sendTo: '',
                  receivedPkgQuantity: order.receivedPkgQuantity || 1, // 从订单中获取
                  sequenceNumber: index + 1
                };
              });
            }

            // 格式化insertTime为字符串（如果后端返回的是Date对象）
            const formattedInsertTime = order.insertTime
              ? typeof order.insertTime === 'string'
                ? order.insertTime
                : moment(order.insertTime).format('YYYY-MM-DD HH:mm:ss')
              : '';

            // 返回订单对象，保持原有结构
            return {
              ...order,
              insertTime: formattedInsertTime, // 确保insertTime是字符串格式
              isPrint3: order.isPrint3 || null, // 如果后端没有返回isPrint3，设置为null（前端会处理）
              trays: trays,
              currentTrayIndex: 0
            };
          });
        } else {
          this.availableOrders = [];
        }
      } catch (err) {
        console.error('刷新订单列表失败：', err);
        this.$message.error('刷新订单列表失败，请重试');
        this.availableOrders = [];
      }
    },
    // 显示新建订单弹窗
    showAddOrderDialog() {
      this.addOrderDialogVisible = true;
      // 重置表单
      this.newOrderForm = {
        orderId: '',
        productCode: '',
        productName: '',
        currentTrayCode: '',
        trayCodes: []
      };
      // 清除表单验证
      this.$nextTick(() => {
        if (this.$refs.newOrderForm) {
          this.$refs.newOrderForm.clearValidate();
        }
      });
    },
    // 添加托盘码
    addTrayCode() {
      const code = this.newOrderForm.currentTrayCode.trim();
      if (!code) {
        this.$message.warning('请输入托盘码');
        return;
      }

      // 检查是否已存在
      if (this.newOrderForm.trayCodes.includes(code)) {
        this.$message.warning('该托盘码已存在');
        return;
      }

      // 添加到列表
      this.newOrderForm.trayCodes.push(code);
      // 清空输入框
      this.newOrderForm.currentTrayCode = '';
      // 触发表单验证
      this.$nextTick(() => {
        if (this.$refs.newOrderForm) {
          this.$refs.newOrderForm.validateField('trayCodes');
        }
      });
    },
    // 删除托盘码
    removeTrayCode(index) {
      this.newOrderForm.trayCodes.splice(index, 1);
      // 触发表单验证
      this.$nextTick(() => {
        if (this.$refs.newOrderForm) {
          this.$refs.newOrderForm.validateField('trayCodes');
        }
      });
    },
    // 提交新建订单
    async submitAddOrder() {
      try {
        // 表单验证
        await this.$refs.newOrderForm.validate();

        // 验证至少有一个托盘码
        if (this.newOrderForm.trayCodes.length === 0) {
          this.$message.error('请至少添加一个托盘码');
          return;
        }

        this.isSubmittingOrder = true;

        // 获取当前时间
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

        // 根据托盘码列表生成托盘对象数组（只保留页面用到的字段）
        // 注意：这个trays数组只是前端使用，不会提交给后端
        const trays = this.newOrderForm.trayCodes.map((trayCode, index) => {
          return {
            id: `${this.newOrderForm.orderId}-TRAY-${index + 1}`,
            name: `托盘${index + 1}`,
            orderId: this.newOrderForm.orderId,
            productName: this.newOrderForm.productName,
            productCode: this.newOrderForm.productCode,
            batchNo: '', // 批号/备注，新建时为空
            unit: '', // 规格，新建时为空
            isTerile: 0, // 是否消毒，默认不消毒
            time: currentTime,
            trayCode: trayCode,
            receiptOrderCode: '',
            state: '0', // 未执行
            sendTo: '',
            receivedPkgQuantity: 1, // 默认值
            sequenceNumber: index + 1
          };
        });

        // 构建订单数据（提交给后端，只包含后端需要的字段）
        const orderData = {
          orderId: this.newOrderForm.orderId,
          productCode: this.newOrderForm.productCode,
          productName: this.newOrderForm.productName,
          trayCode: this.newOrderForm.trayCodes.join(','), // 托盘码用逗号分隔
          orderStatus: 0, // 待执行
          invalidFlag: 0 // 未作废
        };

        // 调用保存接口
        const res = await HttpUtil.post('/order/insert', orderData);
        if (res.code === '200' || res.data) {
          this.$message.success('订单创建成功');
          // 关闭弹窗
          this.addOrderDialogVisible = false;
          // 刷新订单列表
          await this.refreshAvailableOrders();
        } else {
          this.$message.error('创建订单失败：' + (res.message || '请重试'));
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('表单验证失败，请检查输入');
        }
      } finally {
        this.isSubmittingOrder = false;
      }
    },
    // 取消新建订单
    cancelAddOrder() {
      this.addOrderDialogVisible = false;
      // 重置表单
      this.newOrderForm = {
        orderId: '',
        productCode: '',
        productName: '',
        currentTrayCode: '',
        trayCodes: []
      };
      // 清除表单验证
      if (this.$refs.newOrderForm) {
        this.$refs.newOrderForm.clearValidate();
      }
    },
    // 删除订单
    async deleteOrder(order) {
      try {
        await this.$confirm('确认要删除该订单吗？删除后无法恢复。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        // 设置删除加载状态
        this.$set(order, 'isDeleting', true);
        const param = {
          id: order.id,
          invalidFlag: 1
        };

        const res = await HttpUtil.post('/order/update', param);
        if (res.code === '200') {
          this.$message.success('订单删除成功');
          // 重新查询订单列表
          await this.refreshAvailableOrders();
        } else {
          this.$message.error('删除订单失败，请重试');
        }
      } catch (err) {
        // 用户取消操作，不做处理
        if (err !== 'cancel') {
          this.$message.error('删除订单失败：' + err);
        }
      } finally {
        this.$set(order, 'isDeleting', false);
      }
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
    // 出库选择相关方法
    sendToWarehouse(line) {
      if (!line) {
        this.$message.warning('请选择出库线体');
        return;
      }

      // 判断起始地数量是否大于0（系统队列数量和PLC出库队列数量都要大于0）
      const systemQueueCount = this.getOutWarehouseCountFor(line);
      let plcOutCount = 0;
      if (line === 'A') {
        plcOutCount = this.aLineQuantity.a35 || 0;
      } else if (line === 'B') {
        plcOutCount =
          (this.bLineQuantity.b32 || 0) + (this.bLineQuantity.b35 || 0);
      } else if (line === 'C') {
        plcOutCount =
          (this.cLineQuantity.c32 || 0) + (this.cLineQuantity.c35 || 0);
      } else if (line === 'D') {
        plcOutCount =
          (this.dLineQuantity.d32 || 0) + (this.dLineQuantity.d35 || 0);
      } else if (line === 'E') {
        plcOutCount =
          (this.eLineQuantity.e32 || 0) + (this.eLineQuantity.e35 || 0);
      }

      if (systemQueueCount <= 0 || plcOutCount <= 0) {
        this.$message.warning(
          `${line}出库队列中没有可用的托盘，请检查起始地数量`
        );
        return;
      }

      if (systemQueueCount !== plcOutCount) {
        this.$message.warning(
          `${line}出库队列中系统数量和PLC数量不一致，请检查起始地数量`
        );
        this.addLog(
          `${line}出库队列中系统数量和PLC数量不一致，请检查起始地数量`
        );
        return;
      }

      this.outWarehouseLoading[line] = true;
      this.outWarehouseExecuting[line] = true;

      // 发送允许出货信号到DBW1056
      if (line === 'A') {
        // A线只有A3-5一条出货线，发送BIT1信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT1', true);
        this.outWarehouseArrowStatus['A3-5'] = true;
        this.addLog('A线出货执行：发送A3-5#允许出货信号 DBW1056_BIT1: true');

        ipcRenderer.send('writeSingleValueToPLC', 'DBW534', 1);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW534');
        }, 2000);
        this.outWarehouseExecutingTrayCode.A =
          this.queues[9].trayInfo[0].trayCode;
      } else if (line === 'B') {
        // B线有B3-2和B3-5两条出货线，发送BIT2和BIT3信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT2', true);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT3', true);
        this.outWarehouseArrowStatus['B3-2'] = true;
        this.outWarehouseArrowStatus['B3-5'] = true;
        this.addLog(
          'B线出货执行：发送B3-2#和B3-5#允许出货信号 DBW1056_BIT2/BIT3: true'
        );

        ipcRenderer.send('writeSingleValueToPLC', 'DBW534', 2);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW534');
        }, 500);
        this.outWarehouseExecutingTrayCode.B =
          this.queues[14].trayInfo[0].trayCode +
          '/' +
          this.queues[19].trayInfo[0].trayCode;
      } else if (line === 'C') {
        // C线有C3-2和C3-5两条出货线，发送BIT4和BIT5信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT4', true);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT5', true);
        this.outWarehouseArrowStatus['C3-2'] = true;
        this.outWarehouseArrowStatus['C3-5'] = true;
        this.addLog(
          'C线出货执行：发送C3-2#和C3-5#允许出货信号 DBW1056_BIT4/BIT5: true'
        );

        ipcRenderer.send('writeSingleValueToPLC', 'DBW534', 3);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW534');
        }, 2000);
        this.outWarehouseExecutingTrayCode.C =
          this.queues[24].trayInfo[0].trayCode +
          '/' +
          this.queues[29].trayInfo[0].trayCode;
      } else if (line === 'D') {
        // D线有D3-2和D3-5两条出货线，发送BIT6和BIT7信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT6', true);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT7', true);
        this.outWarehouseArrowStatus['D3-2'] = true;
        this.outWarehouseArrowStatus['D3-5'] = true;
        this.addLog(
          'D线出货执行：发送D3-2#和D3-5#允许出货信号 DBW1056_BIT6/BIT7: true'
        );

        ipcRenderer.send('writeSingleValueToPLC', 'DBW536', 1);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW536');
        }, 2000);
        this.outWarehouseExecutingTrayCode.D =
          this.queues[34].trayInfo[0].trayCode +
          '/' +
          this.queues[39].trayInfo[0].trayCode;
      } else if (line === 'E') {
        // E线有E3-2和E3-5两条出货线，发送BIT8和BIT9信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT8', true);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT9', true);
        this.outWarehouseArrowStatus['E3-2'] = true;
        this.outWarehouseArrowStatus['E3-5'] = true;
        this.addLog(
          'E线出货执行：发送E3-2#和E3-5#允许出货信号 DBW1056_BIT8/BIT9: true'
        );

        ipcRenderer.send('writeSingleValueToPLC', 'DBW536', 2);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW536');
        }, 2000);
        this.outWarehouseExecutingTrayCode.E =
          this.queues[44].trayInfo[0].trayCode +
          '/' +
          this.queues[49].trayInfo[0].trayCode;
      }
      console.log(this.outWarehouseExecutingTrayCode);
      // 计算需进货数量（只计算出库队列的数量）
      this.updateOutNeedAndWrite(line);
      this.addLog(`出库${line}开始执行，需进货：${this.outNeedQty[line]}`);
    },
    cancelOutWarehouse(line) {
      this.outWarehouseExecuting[line] = false;
      this.outWarehouseLoading[line] = false;
      this.outNeedQty[line] = 0;
      // 清空执行中的托盘号
      this.outWarehouseExecutingTrayCode[line] = '';

      // 取消允许出货信号
      if (line === 'A') {
        // 取消A3-5允许出货信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT1', false);
        this.outWarehouseArrowStatus['A3-5'] = false;
        this.addLog(
          'A线取消出货执行：取消A3-5#允许出货信号 DBW1056_BIT1: false'
        );

        this.outWarehouseTrayCode.A35 = '';
        // 取消A线PLC写入
        ipcRenderer.send('cancelWriteToPLC', 'DBW534');
      } else if (line === 'B') {
        // 取消B3-2和B3-5允许出货信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT2', false);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT3', false);
        this.outWarehouseArrowStatus['B3-2'] = false;
        this.outWarehouseArrowStatus['B3-5'] = false;
        this.addLog(
          'B线取消出货执行：取消B3-2#和B3-5#允许出货信号 DBW1056_BIT2/BIT3: false'
        );

        this.outWarehouseTrayCode.B32 = '';
        this.outWarehouseTrayCode.B35 = '';
        // 取消B线PLC写入
        ipcRenderer.send('cancelWriteToPLC', 'DBW534');
      } else if (line === 'C') {
        // 取消C3-2和C3-5允许出货信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT4', false);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT5', false);
        this.outWarehouseArrowStatus['C3-2'] = false;
        this.outWarehouseArrowStatus['C3-5'] = false;
        this.addLog(
          'C线取消出货执行：取消C3-2#和C3-5#允许出货信号 DBW1056_BIT4/BIT5: false'
        );

        this.outWarehouseTrayCode.C32 = '';
        this.outWarehouseTrayCode.C35 = '';
        // 取消C线PLC写入
        ipcRenderer.send('cancelWriteToPLC', 'DBW534');
      } else if (line === 'D') {
        // 取消D3-2和D3-5允许出货信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT6', false);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT7', false);
        this.outWarehouseArrowStatus['D3-2'] = false;
        this.outWarehouseArrowStatus['D3-5'] = false;
        this.addLog(
          'D线取消出货执行：取消D3-2#和D3-5#允许出货信号 DBW1056_BIT6/BIT7: false'
        );

        this.outWarehouseTrayCode.D32 = '';
        this.outWarehouseTrayCode.D35 = '';
        // 取消D线PLC写入
        ipcRenderer.send('cancelWriteToPLC', 'DBW536');
      } else if (line === 'E') {
        // 取消E3-2和E3-5允许出货信号
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT8', false);
        ipcRenderer.send('writeValuesToPLC', 'DBW1056_BIT9', false);
        this.outWarehouseArrowStatus['E3-2'] = false;
        this.outWarehouseArrowStatus['E3-5'] = false;
        this.addLog(
          'E线取消出货执行：取消E3-2#和E3-5#允许出货信号 DBW1056_BIT8/BIT9: false'
        );

        this.outWarehouseTrayCode.E32 = '';
        this.outWarehouseTrayCode.E35 = '';
        // 取消E线PLC写入
        ipcRenderer.send('cancelWriteToPLC', 'DBW536');
      }

      // 根据不同的线写入对应的PLC地址并清零
      let plcAddress = '';
      switch (line) {
        case 'A':
          plcAddress = 'DB101.DBW1046';
          break;
        case 'B':
          plcAddress = 'DB101.DBW1048';
          break;
        case 'C':
          plcAddress = 'DB101.DBW1050';
          break;
        case 'D':
          plcAddress = 'DB101.DBW1052';
          break;
        case 'E':
          plcAddress = 'DB101.DBW1054';
          break;
        default:
          this.addLog(`未知的线：${line}`);
          return;
      }

      // 写入PLC出库需进货数量为0
      this.writeWordWithCancel(plcAddress, 0);
      this.addLog(`出库${line}执行已取消，写入PLC ${plcAddress}: 0`);
      this.$message.info(`已取消出库${line}执行`);
    },
    // 取消当前订单
    async cancelCurrentOrder(line) {
      try {
        await this.$confirm(
          `确认要取消生产线 ${line.letter} 的当前订单吗？取消后订单将停止执行。`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        const orderId = line.currentOrder?.orderId || '未知订单';
        const lineLetter = line.letter;

        // 如果正在出库，先取消出库操作
        if (this.outWarehouseExecuting[lineLetter]) {
          this.cancelOutWarehouse(lineLetter);
        }

        // 清空当前订单
        line.currentOrder = null;

        // 添加日志
        this.addLog(`生产线 ${lineLetter} 的订单 ${orderId} 已取消`);

        // 显示成功消息
        this.$message.success(`已取消生产线 ${lineLetter} 的订单 ${orderId}`);
      } catch (err) {
        // 用户取消操作，不做处理
        if (err !== 'cancel') {
          this.$message.error('取消订单失败：' + err);
        }
      }
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
    // 检查对应线的队列容量是否已满（最大容量13）
    checkQueueCapacity(line) {
      const MAX_CAPACITY = 13;

      // 定义各线对应的队列索引映射
      const queueIndexMap = {
        A: [5], // A1-5 (A15)
        B: [10, 15], // B1-2 (B12), B1-5 (B15)
        C: [20, 25], // C1-2 (C12), C1-5 (C15)
        D: [30, 35], // D1-2 (D12), D1-5 (D15)
        E: [40, 45] // E1-2 (E12), E1-5 (E15)
      };

      const queueIndexes = queueIndexMap[line.letter] || [];

      // 检查每个队列是否已满
      for (const queueIndex of queueIndexes) {
        const queue = this.queues[queueIndex];
        if (queue && queue.trayInfo.length >= MAX_CAPACITY) {
          this.addLog(
            `${line.letter}线队列${queue.queueName}已满（${queue.trayInfo.length}/${MAX_CAPACITY}），不允许开启上货`
          );
          return false;
        }
      }

      return true;
    },
    // 计算并更新预热需进货数量
    updatePreheatNeedQuantity(lineLetter, witchLine) {
      const MAX_CAPACITY = 13;

      // 根据线体和子线获取对应的队列索引
      let queueIndex;
      if (lineLetter === 'A') {
        queueIndex = 5; // A1-5
      } else if (lineLetter === 'B') {
        queueIndex = witchLine === '1-2' ? 10 : 15; // B1-2 或 B1-5
      } else if (lineLetter === 'C') {
        queueIndex = witchLine === '1-2' ? 20 : 25; // C1-2 或 C1-5
      } else if (lineLetter === 'D') {
        queueIndex = witchLine === '1-2' ? 30 : 35; // D1-2 或 D1-5
      } else if (lineLetter === 'E') {
        queueIndex = witchLine === '1-2' ? 40 : 45; // E1-2 或 E1-5
      }

      if (!this.queues[queueIndex]) {
        this.addLog(`未找到队列索引：${queueIndex}`);
        return;
      }

      // 计算当前队列数量
      const currentCount = this.queues[queueIndex].trayInfo.length;

      // 计算需进货数量：13 - 当前数量
      const needQuantity = Math.max(0, MAX_CAPACITY - currentCount);

      // 更新对应的需进货信息
      const fieldKeyMap = {
        'A1-5': 'A14', // A1-4
        'B1-2': 'B11', // B1-1
        'B1-5': 'B14', // B1-4
        'C1-2': 'C11', // C1-1
        'C1-5': 'C14', // C1-4
        'D1-2': 'D11', // D1-1
        'D1-5': 'D14', // D1-4
        'E1-2': 'E11', // E1-1
        'E1-5': 'E14' // E1-4
      };

      const fieldKey = fieldKeyMap[lineLetter + witchLine];
      if (fieldKey) {
        this.stockRequiredInfo[fieldKey] = needQuantity;
        this.addLog(
          `${lineLetter}${witchLine}需进货数量更新为：${needQuantity}（当前队列：${currentCount}/${MAX_CAPACITY}）`
        );

        // 写入PLC
        this.writePreheatNeedQuantityToPLC(lineLetter, witchLine, needQuantity);

        // 如果需进货数量为0，停止对应线的允许进货信号
        if (needQuantity === 0) {
          this.stopLoadingSignalForLine(lineLetter, witchLine);
        }
      }
    },
    // 将预热需进货数量写入PLC
    writePreheatNeedQuantityToPLC(lineLetter, witchLine, needQuantity) {
      // PLC地址映射
      const plcAddressMap = {
        'A1-5': 'DB101.DBW1022', // A1-4数量
        'B1-2': 'DB101.DBW1024', // B1-1数量
        'B1-5': 'DB101.DBW1026', // B1-4数量
        'C1-2': 'DB101.DBW1028', // C1-1数量
        'C1-5': 'DB101.DBW1030', // C1-4数量
        'D1-2': 'DB101.DBW1032', // D1-1数量
        'D1-5': 'DB101.DBW1034', // D1-4数量
        'E1-2': 'DB101.DBW1036', // E1-1数量
        'E1-5': 'DB101.DBW1038' // E1-4数量
      };

      const plcAddress = plcAddressMap[lineLetter + witchLine];
      if (plcAddress) {
        this.writeWordWithCancel(plcAddress, needQuantity);
        this.addLog(
          `写入PLC ${plcAddress}（${lineLetter}${witchLine}需进货数量）: ${needQuantity}`
        );
      }
    },
    // 停止对应线的允许进货信号
    stopLoadingSignalForLine(lineLetter, witchLine) {
      // 根据线体和子线确定对应的PLC位地址
      const bitAddressMap = {
        'A1-5': 'DBW1010_BIT1', // A1-4#允许进货信号
        'B1-2': 'DBW1010_BIT2', // B1-1#允许进货信号
        'B1-5': 'DBW1010_BIT3', // B1-4#允许进货信号
        'C1-2': 'DBW1010_BIT4', // C1-1#允许进货信号
        'C1-5': 'DBW1010_BIT5', // C1-4#允许进货信号
        'D1-2': 'DBW1010_BIT6', // D1-1#允许进货信号
        'D1-5': 'DBW1010_BIT7', // D1-4#允许进货信号
        'E1-2': 'DBW1010_BIT8', // E1-1#允许进货信号
        'E1-5': 'DBW1010_BIT9' // E1-4#允许进货信号
      };

      const bitAddress = bitAddressMap[lineLetter + witchLine];
      if (bitAddress) {
        // 发送false信号停止允许进货
        ipcRenderer.send('writeValuesToPLC', bitAddress, false);
        this.addLog(
          `${lineLetter}${witchLine}需进货数量为0，停止允许进货信号 ${bitAddress}: false`
        );

        // 更新对应子线的允许上货状态
        this.lineAllowLoadingStatus[lineLetter + witchLine] = false;

        // 检查该线的所有子线是否都为false，如果是则取消勾选主线的允许上货按钮
        this.checkAndUncheckMainLineButton(lineLetter);
      }
    },
    // 检查并取消勾选主线的允许上货按钮
    checkAndUncheckMainLineButton(lineLetter) {
      // 定义各线的子线映射
      const subLineMap = {
        A: ['A1-5'],
        B: ['B1-2', 'B1-5'],
        C: ['C1-2', 'C1-5'],
        D: ['D1-2', 'D1-5'],
        E: ['E1-2', 'E1-5']
      };

      const subLines = subLineMap[lineLetter] || [];

      // 检查所有子线是否都为false
      const allSubLinesFalse = subLines.every(
        (subLine) => !this.lineAllowLoadingStatus[subLine]
      );

      if (allSubLinesFalse) {
        // 找到对应的生产线并取消勾选
        const line = this.productionLines.find((l) => l.letter === lineLetter);
        if (line && line.allowLoading) {
          line.allowLoading = false;
          this.addLog(
            `${lineLetter}线所有子线允许上货状态都为false，自动取消勾选主线的允许上货按钮`
          );
        }
      }
    },
    // 允许上货状态改变
    onAllowLoadingChange(line) {
      // 如果要开启上货，先检查队列容量
      if (line.allowLoading && !this.checkQueueCapacity(line)) {
        // 队列已满，不允许开启上货
        line.allowLoading = false;
        this.$message.warning(`${line.letter}线队列已满，不允许开启上货`);
        return;
      }

      // 根据A-E线设置给PLC发送命令
      // 'DBW1010_BIT0',
      // 'DBW1010_BIT1',
      // 'DBW1010_BIT2',
      // 'DBW1010_BIT3',
      // 'DBW1010_BIT4',
      // 'DBW1010_BIT5',
      // 'DBW1010_BIT6',
      // 'DBW1010_BIT7',
      // 'DBW1010_BIT8',
      // 'DBW1010_BIT9',
      // 更新各子线的允许上货状态
      if (line.letter === 'A') {
        this.lineAllowLoadingStatus['A1-5'] = line.allowLoading;
        // ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT0', line.allowLoading);
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT1', line.allowLoading);
        this.addLog(
          `生产线 ${line.letter} 允许上货状态已${
            line.allowLoading ? '开启' : '关闭'
          },DBW1010_BIT1发送命令:${line.allowLoading}`
        );
      } else if (line.letter === 'B') {
        this.lineAllowLoadingStatus['B1-2'] = line.allowLoading;
        this.lineAllowLoadingStatus['B1-5'] = line.allowLoading;
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT2', line.allowLoading);
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT3', line.allowLoading);
        this.addLog(
          `生产线 ${line.letter} 允许上货状态已${
            line.allowLoading ? '开启' : '关闭'
          },给DBW1010_BIT2,DBW1010_BIT3发送命令:${line.allowLoading}`
        );
      } else if (line.letter === 'C') {
        this.lineAllowLoadingStatus['C1-2'] = line.allowLoading;
        this.lineAllowLoadingStatus['C1-5'] = line.allowLoading;
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT4', line.allowLoading);
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT5', line.allowLoading);
        this.addLog(
          `生产线 ${line.letter} 允许上货状态已${
            line.allowLoading ? '开启' : '关闭'
          },给DBW1010_BIT4,DBW1010_BIT5发送命令:${line.allowLoading}`
        );
      } else if (line.letter === 'D') {
        this.lineAllowLoadingStatus['D1-2'] = line.allowLoading;
        this.lineAllowLoadingStatus['D1-5'] = line.allowLoading;
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT6', line.allowLoading);
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT7', line.allowLoading);
        this.addLog(
          `生产线 ${line.letter} 允许上货状态已${
            line.allowLoading ? '开启' : '关闭'
          },给DBW1010_BIT6,DBW1010_BIT7发送命令:${line.allowLoading}`
        );
      } else if (line.letter === 'E') {
        this.lineAllowLoadingStatus['E1-2'] = line.allowLoading;
        this.lineAllowLoadingStatus['E1-5'] = line.allowLoading;
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT8', line.allowLoading);
        ipcRenderer.send('writeValuesToPLC', 'DBW1010_BIT9', line.allowLoading);
        this.addLog(
          `生产线 ${line.letter} 允许上货状态已${
            line.allowLoading ? '开启' : '关闭'
          },给DBW1010_BIT8,DBW1010_BIT9发送命令:${line.allowLoading}`
        );
      }
    },
    // 处理上货请求
    handleLoadingRequest(lineLetter, witchLine) {
      this.addLog(`线体${lineLetter}${witchLine}触发上货请求`);

      // 先校验对应线体是否勾选了“允许上货”
      // A线只有一个实际受控子线：A1-5，因此无论witchLine传入什么，都统一校验A1-5
      const allowKey =
        lineLetter === 'A' ? 'A1-5' : `${lineLetter}${witchLine}`;
      const isAllowed = this.lineAllowLoadingStatus[allowKey] === true;
      if (!isAllowed) {
        this.addLog(
          `线体${lineLetter}${witchLine}未“允许上货”，拦截本次上货请求`,
          'alarm'
        );
        this.$message.warning(
          `线体${lineLetter}${witchLine}未“允许上货”，无法上货`
        );
        return;
      }

      // 无码上货模式
      if (this.noCodeUpload) {
        this.addLog(`${lineLetter}线触发上货请求，无码上货模式启用`);
        this.addNoCodeTrayToQueue(lineLetter, witchLine);
        return;
      }

      // 找到对应的生产线
      const line = this.productionLines.find((l) => l.letter === lineLetter);
      if (!line) {
        this.addLog(`未找到线体${lineLetter}`);
        return;
      }

      // 检查是否有当前订单
      if (!line.currentOrder) {
        this.addLog(`线体${lineLetter}没有设置订单`);
        this.$message.warning(`线体${lineLetter}没有设置订单，无法上货`);
        return;
      }

      // 检查订单是否有托盘数据
      if (!line.currentOrder.trays || line.currentOrder.trays.length === 0) {
        this.addLog(`线体${lineLetter}的订单没有托盘数据`);
        this.$message.warning(`线体${lineLetter}的订单没有托盘数据`);
        return;
      }

      // 获取当前托盘索引
      const currentIndex = line.currentOrder.currentTrayIndex || 0;

      // 检查是否还有可用托盘
      if (currentIndex >= line.currentOrder.trays.length) {
        this.addLog(`线体${lineLetter}的订单托盘已全部上货完毕`);
        this.$message.warning(`线体${lineLetter}的订单托盘已全部上货完毕`);
        return;
      }

      // 获取当前托盘
      const currentTray = line.currentOrder.trays[currentIndex];

      // 根据线体和bitIndex获取对应的队列索引
      // A线只有一条子线：A15 (索引=5)
      // B/C/D/E线有两条子线：第一条和第二条
      let queueIndex;
      if (lineLetter === 'A') {
        queueIndex = 5; // A1-5
      } else if (lineLetter === 'B') {
        queueIndex = witchLine === '1-2' ? 10 : 15; // B1-2 或 B1-5
      } else if (lineLetter === 'C') {
        queueIndex = witchLine === '1-2' ? 20 : 25; // C1-2 或 C1-5
      } else if (lineLetter === 'D') {
        queueIndex = witchLine === '1-2' ? 30 : 35; // D1-2 或 D1-5
      } else if (lineLetter === 'E') {
        queueIndex = witchLine === '1-2' ? 40 : 45; // E1-2 或 E1-5
      }

      if (!this.queues[queueIndex]) {
        this.addLog(`未找到队列索引：${queueIndex}`);
        return;
      }

      // 创建托盘副本并添加到队列的第一个位置
      const trayToAdd = {
        ...currentTray,
        inPut: lineLetter,
        time: moment().format('YYYY-MM-DD HH:mm:ss')
      };

      // 直接使用数组索引操作队列
      this.queues[queueIndex].trayInfo.push(trayToAdd);

      // 计算并更新预热需进货数量
      this.updatePreheatNeedQuantity(lineLetter, witchLine);

      // 更新左上角卡片显示的当前扫码托盘信息
      this.nowScanTrayInfo = {
        orderId: currentTray.orderId,
        productName: currentTray.productName,
        productCode: currentTray.productCode,
        batchNo: currentTray.batchNo,
        inPut: `${lineLetter}${witchLine}`,
        isTerile: currentTray.isTerile === 1 ? '是' : '否'
      };

      // 更新右侧上货扫码信息面板
      const bitToFieldMap = {
        'A1-2': 'A14', // A1-4 (实际不使用bit0)
        'A1-5': 'A14', // A1-4
        'B1-2': 'B11', // B1-1
        'B1-5': 'B14', // B1-4
        'C1-2': 'C11', // C1-1
        'C1-5': 'C14', // C1-4
        'D1-2': 'D11', // D1-1
        'D1-5': 'D14', // D1-4
        'E1-2': 'E11', // E1-1
        'E1-5': 'E14' // E1-4
      };

      const fieldKey = bitToFieldMap[lineLetter + witchLine];
      if (fieldKey) {
        this.uploadScanInfo[fieldKey] = currentTray.productName;
      }

      // 更新订单的当前托盘索引
      line.currentOrder.currentTrayIndex = currentIndex + 1;

      // 添加日志
      this.addLog(
        `线体${lineLetter}${witchLine}上货：${
          currentTray.productName
        }，托盘号：${currentTray.name},剩余托盘数：${
          line.currentOrder.trays.length - (currentIndex + 1)
        }`
      );

      // 显示成功消息
      this.$message.success(
        `线体${lineLetter}${witchLine}上货成功：${currentTray.productName} - ${currentTray.name}`
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
            ipcRenderer.send('writeValuesToPLC', 'DBW1002', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW1002', 0);
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
            ipcRenderer.send('writeValuesToPLC', 'DBW1004', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW1004', 0);
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
            ipcRenderer.send('writeValuesToPLC', 'DBW1006', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW1006', 0);
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
            ipcRenderer.send('writeValuesToPLC', 'DBW1008', 1);
            setTimeout(() => {
              ipcRenderer.send('writeValuesToPLC', 'DBW1008', 0);
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
        cart1: { min: 1000, max: 2910 },
        cart2: { min: 1000, max: 2857 }
      };

      const plcRange = plcRanges[`cart${cartId}`];
      if (!plcRange) return;

      // 计算比例（基于新的范围起点）
      let ratio = (value - plcRange.min) / (plcRange.max - plcRange.min);
      ratio = Math.max(0, Math.min(1, ratio)); // 限制在0-1范围

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
        console.log(trayInfo);
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
        this.addLog('处理托盘信息时出错:');
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
    async loadQueueInfoFromDatabase() {
      await HttpUtil.post('/queue_info/queryQueueList', {})
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
                    ipcRenderer.send('writeValuesToPLC', 'DBW1040', 2);
                  } else {
                    this.$message.info(
                      '已关闭无码上货模式，已给PLC，DBW1040发送1'
                    );
                    this.addLog('无码上货模式已关闭');
                    // 有码模式发1
                    ipcRenderer.send('writeValuesToPLC', 'DBW1040', 1);
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
    },
    // 无码上货 - 直接添加托盘到队列
    addNoCodeTrayToQueue(lineLetter, witchLine) {
      // 根据线体和bitIndex获取对应的队列索引
      // A线只有一条子线：A15 (索引=5)
      // B/C/D/E线有两条子线：第一条和第二条
      let queueIndex;
      if (lineLetter === 'A') {
        queueIndex = 5; // A1-5
      } else if (lineLetter === 'B') {
        queueIndex = witchLine === '1-2' ? 10 : 15; // B1-2 或 B1-5
      } else if (lineLetter === 'C') {
        queueIndex = witchLine === '1-2' ? 20 : 25; // C1-2 或 C1-5
      } else if (lineLetter === 'D') {
        queueIndex = witchLine === '1-2' ? 30 : 35; // D1-2 或 D1-5
      } else if (lineLetter === 'E') {
        queueIndex = witchLine === '1-2' ? 40 : 45; // E1-2 或 E1-5
      }

      if (!this.queues[queueIndex]) {
        this.addLog(`未找到队列索引：${queueIndex}`);
        return;
      }

      // 创建无码托盘
      const trayInfo = {
        trayCode: 'no-tray-code',
        trayTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        orderId: 'NO-ORDER',
        productCode: 'NO-PRODUCT',
        productName: '无码产品',
        isTerile: 1, // 默认需要消毒
        state: '0',
        sendTo: '',
        // 预热间信息
        preheatingRoom: '',
        inPreheatingRoomTime: null,
        outPreheatingRoomTime: null,
        // 灭菌间信息
        sterilizationRoom: '',
        inSterilizationRoomTime: null,
        outSterilizationRoomTime: null,
        // 解析间信息
        analysisRoom: '',
        inAnalysisRoomTime: null,
        outAnalysisRoomTime: null
      };

      // 直接使用数组索引操作队列
      this.queues[queueIndex].trayInfo.push(trayInfo);

      // 更新左上角卡片显示的当前扫码托盘信息
      this.nowScanTrayInfo = {
        orderId: trayInfo.orderId,
        productName: trayInfo.productName,
        inPut: `${lineLetter}${witchLine}`,
        isTerile: '是'
      };

      this.addLog(
        `${lineLetter}${witchLine}无码上货成功，托盘号：no-tray-code，已添加到队列${this.queues[queueIndex].queueName}`
      );

      this.$message.success(`${lineLetter}${witchLine}无码上货成功`);
    },
    // 获取预热房数量（两条线加起来）
    getPreheatCountFor(line) {
      if (!line) return 0;
      // 每条线有两个预热房队列，需要把两条线的数量加起来
      const queueIndexMap = {
        A: [6], // A1-6
        B: [11, 16], // B1-3, B1-6
        C: [21, 26], // C1-3, C1-6
        D: [31, 36], // D1-3, D1-6
        E: [41, 46] // E1-3, E1-6
      };

      const queueIndexes = queueIndexMap[line] || [];
      let total = 0;
      queueIndexes.forEach((index) => {
        if (this.queues[index]) {
          total += this.queues[index].trayInfo.length || 0;
        }
      });
      return total;
    },
    // 获取灭菌柜数量（两条线加起来：进队列+出队列）
    getSterilizeCountFor(line) {
      if (!line) return 0;
      // 灭菌柜"进队列"数量（不包括出队列，用于判断是否满了）
      // 队列索引映射：A(7), B(12,17), C(22,27), D(32,37), E(42,47)
      const queueIndexMap = {
        A: [7], // A2-2-进
        B: [12, 17], // B2-1-进, B2-2-进
        C: [22, 27], // C2-1-进, C2-2-进
        D: [32, 37], // D2-1-进, D2-2-进
        E: [42, 47] // E2-1-进, E2-2-进
      };

      const queueIndexes = queueIndexMap[line] || [];
      let total = 0;
      queueIndexes.forEach((index) => {
        if (this.queues[index]) {
          total += this.queues[index].trayInfo.length || 0;
        }
      });
      return total;
    },
    // 获取灭菌柜出队列数量（用于灭菌柜到解析房）
    getSterilizeOutCountFor(line) {
      if (!line) return 0;
      // 灭菌柜"出队列"数量
      // 队列索引映射：A(51), B(52,53), C(54,55), D(56,57), E(58,59)
      const queueIndexMap = {
        A: [51], // A2-2-出
        B: [52, 53], // B2-1-出, B2-2-出
        C: [54, 55], // C2-1-出, C2-2-出
        D: [56, 57], // D2-1-出, D2-2-出
        E: [58, 59] // E2-1-出, E2-2-出
      };

      const queueIndexes = queueIndexMap[line] || [];
      let total = 0;
      queueIndexes.forEach((index) => {
        if (this.queues[index]) {
          total += this.queues[index].trayInfo.length || 0;
        }
      });
      return total;
    },
    // 获取解析房数量（两条线加起来）
    getAnalysisCountFor(line) {
      if (!line) return 0;
      // 每条线有两个解析房队列
      // 队列索引映射：A(8,9), B(13,14,18,19), C(23,24,28,29), D(33,34,38,39), E(43,44,48,49)
      const queueIndexMap = {
        A: [8], // A3-4, A3-5
        B: [13, 18], // B3-1, B3-4
        C: [23, 28], // C3-1, C3-4
        D: [33, 38], // D3-1, D3-4
        E: [43, 48] // E3-1, E3-4
      };

      const queueIndexes = queueIndexMap[line] || [];
      let total = 0;
      queueIndexes.forEach((index) => {
        if (this.queues[index]) {
          total += this.queues[index].trayInfo.length || 0;
        }
      });
      return total;
    },
    // 获取出库队列数量（只计算A35、B32、B35、C32、C35、D32、D35、E32、E35）
    getOutWarehouseCountFor(line) {
      if (!line) return 0;
      // 出库队列索引映射：A35(9), B32(14), B35(19), C32(24), C35(29), D32(34), D35(39), E32(44), E35(49)
      const outQueueIndexMap = {
        A: [9], // A3-5
        B: [14, 19], // B3-2, B3-5
        C: [24, 29], // C3-2, C3-5
        D: [34, 39], // D3-2, D3-5
        E: [44, 49] // E3-2, E3-5
      };

      const queueIndexes = outQueueIndexMap[line] || [];
      let total = 0;
      queueIndexes.forEach((index) => {
        if (this.queues[index]) {
          total += this.queues[index].trayInfo.length || 0;
        }
      });
      return total;
    },
    // 检查目的地是否已满16个托盘，满了则自动设置为不执行
    checkDestinationLimit() {
      // 检查灭菌房目的地（A2, B2, C2）是否满16个
      if (this.disinfectionRoomSelectedTo && this.disinfectionExecuting) {
        const disinfectionCount = this.getSterilizeCountFor(
          this.disinfectionRoomSelectedTo
        );
        // A线只有一条线，最多13个；B/C/D/E线有两条线，最多26个
        const maxCount = this.disinfectionRoomSelectedTo === 'A' ? 13 : 26;
        if (disinfectionCount >= maxCount) {
          this.addLog(
            `预热房${this.disinfectionRoomSelectedFrom}到灭菌柜${this.disinfectionRoomSelectedTo}已完成，自动停止（灭菌柜${disinfectionCount}/${maxCount}）`
          );
          this.cancelDisinfectionRoom();
        }
      }

      // 检查解析库目的地（A3, B3, C3）是否满16个
      if (this.warehouseSelectedTo && this.analysisExecuting) {
        const analysisCount = this.getAnalysisCountFor(
          this.warehouseSelectedTo
        );
        // A线只有一条线，最多13个；B/C/D/E线有两条线，最多26个
        const maxCount = this.warehouseSelectedTo === 'A' ? 13 : 26;
        if (analysisCount >= maxCount) {
          this.addLog(
            `灭菌柜${this.warehouseSelectedFrom}到解析库${this.warehouseSelectedTo}已完成，自动停止（解析库${analysisCount}/${maxCount}）`
          );
          this.cancelAnalysisRoom();
        }
      }
    },
    // 预热房到灭菌柜执行
    sendToDisinfectionRoom() {
      if (
        !this.disinfectionRoomSelectedFrom ||
        !this.disinfectionRoomSelectedTo
      ) {
        this.$message.warning('请选择预热房和灭菌柜');
        return;
      }

      // 判断起始地数量是否大于0（系统队列数量和PLC预热房数量都要大于0）
      const systemQueueCount = this.getPreheatCountFor(
        this.disinfectionRoomSelectedFrom
      );
      let plcPreheatCount = 0;
      if (this.disinfectionRoomSelectedFrom === 'A') {
        plcPreheatCount = this.aLineQuantity.a16 || 0;
      } else if (this.disinfectionRoomSelectedFrom === 'B') {
        plcPreheatCount =
          (this.bLineQuantity.b13 || 0) + (this.bLineQuantity.b16 || 0);
      } else if (this.disinfectionRoomSelectedFrom === 'C') {
        plcPreheatCount =
          (this.cLineQuantity.c13 || 0) + (this.cLineQuantity.c16 || 0);
      } else if (this.disinfectionRoomSelectedFrom === 'D') {
        plcPreheatCount =
          (this.dLineQuantity.d13 || 0) + (this.dLineQuantity.d16 || 0);
      } else if (this.disinfectionRoomSelectedFrom === 'E') {
        plcPreheatCount =
          (this.eLineQuantity.e13 || 0) + (this.eLineQuantity.e16 || 0);
      }

      if (systemQueueCount <= 0 || plcPreheatCount <= 0) {
        this.$message.warning(
          `${this.disinfectionRoomSelectedFrom}预热房中没有可用的托盘，请检查起始地数量`
        );
        this.addLog(
          `${this.disinfectionRoomSelectedFrom}预热房中没有可用的托盘，请检查起始地数量`
        );
        return;
      }

      if (systemQueueCount !== plcPreheatCount) {
        this.$message.warning(
          `${this.disinfectionRoomSelectedFrom}预热房中系统数量和PLC数量不一致，请检查起始地数量`
        );
        this.addLog(
          `${this.disinfectionRoomSelectedFrom}预热房中系统数量和PLC数量不一致，请检查起始地数量`
        );
        return;
      }

      // 计算并存储目标总数量：起始地队列数量 + 目的地已有队列数量
      const sourceQueueCount = systemQueueCount;
      const destinationQueueCount = this.getSterilizeCountFor(
        this.disinfectionRoomSelectedTo
      );
      this.disinfectionTargetTotal = sourceQueueCount + destinationQueueCount;

      this.disinfectionRoomLoading = true;
      this.disinfectionExecuting = true;
      if (this.disinfectionRoomSelectedFrom === 'A') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1012', 12);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1012');
        }, 2000);
        this.disinfectionTrayCode = this.queues[6].trayInfo[0].trayCode;
      } else if (this.disinfectionRoomSelectedFrom === 'B') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1012', 23);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1012');
        }, 2000);
        this.disinfectionTrayCode =
          this.queues[11].trayInfo[0].trayCode +
          '/' +
          this.queues[16].trayInfo[0].trayCode;
      } else if (this.disinfectionRoomSelectedFrom === 'C') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1012', 33);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1012');
        }, 2000);
        this.disinfectionTrayCode =
          this.queues[21].trayInfo[0].trayCode +
          '/' +
          this.queues[26].trayInfo[0].trayCode;
      } else if (this.disinfectionRoomSelectedFrom === 'D') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1012', 43);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1012');
        }, 2000);
        this.disinfectionTrayCode =
          this.queues[31].trayInfo[0].trayCode +
          '/' +
          this.queues[36].trayInfo[0].trayCode;
      } else if (this.disinfectionRoomSelectedFrom === 'E') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1012', 53);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1012');
        }, 2000);
        this.disinfectionTrayCode =
          this.queues[41].trayInfo[0].trayCode +
          '/' +
          this.queues[46].trayInfo[0].trayCode;
      }
      if (this.disinfectionRoomSelectedTo === 'A') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1014', 12);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1014');
        }, 2000);
      } else if (this.disinfectionRoomSelectedTo === 'B') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1014', 23);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1014');
        }, 2000);
      } else if (this.disinfectionRoomSelectedTo === 'C') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1014', 33);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1014');
        }, 2000);
      } else if (this.disinfectionRoomSelectedTo === 'D') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1014', 43);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1014');
        }, 2000);
      } else if (this.disinfectionRoomSelectedTo === 'E') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1014', 53);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1014');
        }, 2000);
      }
      // 更新需进货数量并写入PLC
      this.updateDisinfectionNeedAndWrite();

      this.addLog(
        `预热房${this.disinfectionRoomSelectedFrom}到灭菌柜${this.disinfectionRoomSelectedTo}开始执行，需进货：${this.disinfectionNeedQty}`
      );
    },
    // 取消预热房到灭菌柜执行
    cancelDisinfectionRoom() {
      this.disinfectionExecuting = false;
      this.disinfectionTrayCode = '';
      this.disinfectionNeedQty = 0;
      this.disinfectionRoomLoading = false;
      this.disinfectionRoomSelectedFrom = null;
      this.disinfectionRoomSelectedTo = null;

      this.writeWordWithCancel('DBW1022', 0);
      this.addLog('预热房到灭菌柜执行已取消，写入PLC DBW1022: 0');
      this.$message.info('已取消预热房到灭菌柜执行');
    },
    // 灭菌柜到解析房执行
    sendDisinfectionRoomToWarehouse() {
      if (!this.warehouseSelectedFrom || !this.warehouseSelectedTo) {
        this.$message.warning('请选择灭菌柜和解析房');
        return;
      }

      // 判断起始地数量是否大于0（系统出队列数量和PLC灭菌柜出队列数量都要大于0）
      const systemQueueCount = this.getSterilizeOutCountFor(
        this.warehouseSelectedFrom
      );
      let plcDisinfectionCount = 0;
      if (this.warehouseSelectedFrom === 'A') {
        plcDisinfectionCount = this.aLineQuantity.a22out || 0;
      } else if (this.warehouseSelectedFrom === 'B') {
        plcDisinfectionCount =
          (this.bLineQuantity.b21out || 0) + (this.bLineQuantity.b22out || 0);
      } else if (this.warehouseSelectedFrom === 'C') {
        plcDisinfectionCount =
          (this.cLineQuantity.c21out || 0) + (this.cLineQuantity.c22out || 0);
      } else if (this.warehouseSelectedFrom === 'D') {
        plcDisinfectionCount =
          (this.dLineQuantity.d21out || 0) + (this.dLineQuantity.d22out || 0);
      } else if (this.warehouseSelectedFrom === 'E') {
        plcDisinfectionCount =
          (this.eLineQuantity.e21out || 0) + (this.eLineQuantity.e22out || 0);
      }

      if (systemQueueCount <= 0 || plcDisinfectionCount <= 0) {
        this.$message.warning(
          `${this.warehouseSelectedFrom}灭菌柜出队列中没有可用的托盘，请检查起始地数量`
        );
        return;
      }

      if (systemQueueCount !== plcDisinfectionCount) {
        this.$message.warning(
          `${this.warehouseSelectedFrom}灭菌柜出队列中系统数量和PLC数量不一致，请检查起始地数量`
        );
        this.addLog(
          `${this.warehouseSelectedFrom}灭菌柜出队列中系统数量和PLC数量不一致，请检查起始地数量`
        );
        return;
      }

      // 计算并存储目标总数量：起始地队列数量 + 目的地已有队列数量
      const sourceQueueCount = systemQueueCount;
      const destinationQueueCount = this.getAnalysisCountFor(
        this.warehouseSelectedTo
      );
      this.analysisTargetTotal = sourceQueueCount + destinationQueueCount;

      this.analysisRoomLoading = true;
      this.analysisExecuting = true;

      if (this.warehouseSelectedFrom === 'A') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1016', 12);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1016');
        }, 2000);
        this.analysisTrayCode = this.queues[51].trayInfo[0].trayCode;
      } else if (this.warehouseSelectedFrom === 'B') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1016', 23);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1016');
        }, 2000);
        this.analysisTrayCode =
          this.queues[52].trayInfo[0].trayCode +
          '/' +
          this.queues[53].trayInfo[0].trayCode;
      } else if (this.warehouseSelectedFrom === 'C') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1016', 33);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1016');
        }, 2000);
        this.analysisTrayCode =
          this.queues[54].trayInfo[0].trayCode +
          '/' +
          this.queues[55].trayInfo[0].trayCode;
      } else if (this.warehouseSelectedFrom === 'D') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1016', 43);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1016');
        }, 2000);
        this.analysisTrayCode =
          this.queues[56].trayInfo[0].trayCode +
          '/' +
          this.queues[57].trayInfo[0].trayCode;
      } else if (this.warehouseSelectedFrom === 'E') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1016', 53);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1016');
        }, 2000);
        this.analysisTrayCode =
          this.queues[58].trayInfo[0].trayCode +
          '/' +
          this.queues[59].trayInfo[0].trayCode;
      }
      if (this.warehouseSelectedTo === 'A') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1018', 12);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1018');
        }, 2000);
      } else if (this.warehouseSelectedTo === 'B') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1018', 23);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1018');
        }, 2000);
      } else if (this.warehouseSelectedTo === 'C') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1018', 33);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1018');
        }, 2000);
      } else if (this.warehouseSelectedTo === 'D') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1018', 43);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1018');
        }, 2000);
      } else if (this.warehouseSelectedTo === 'E') {
        ipcRenderer.send('writeSingleValueToPLC', 'DBW1018', 53);
        setTimeout(() => {
          ipcRenderer.send('cancelWriteToPLC', 'DBW1018');
        }, 2000);
      }
      // 更新需进货数量并写入PLC
      this.updateAnalysisNeedAndWrite();
      this.addLog(
        `灭菌柜${this.warehouseSelectedFrom}到解析房${this.warehouseSelectedTo}开始执行，需进货：${this.analysisNeedQty}`
      );
      this.$message.success(
        `已发送从灭菌柜${this.warehouseSelectedFrom}出库到解析库${this.warehouseSelectedTo}入库`
      );
    },
    // 取消灭菌柜到解析房执行
    cancelAnalysisRoom() {
      this.analysisExecuting = false;
      this.analysisTrayCode = '';
      this.analysisNeedQty = 0;
      this.analysisRoomLoading = false;
      this.warehouseSelectedFrom = null;
      this.warehouseSelectedTo = null;

      this.writeWordWithCancel('DBW1024', 0);
      this.addLog('灭菌柜到解析房执行已取消，写入PLC DBW1024: 0');
      this.$message.info('已取消灭菌柜到解析房执行');
    },
    // 房间内部移动托盘（不需要判断卡片设置）
    moveTraysWithinRoom(line, fromQueueIndex, toQueueIndex, count) {
      const fromQueue = this.queues[fromQueueIndex];
      const toQueue = this.queues[toQueueIndex];

      if (!fromQueue || !toQueue) {
        this.addLog(
          `队列不存在，无法移动托盘：from=${fromQueueIndex}, to=${toQueueIndex}`
        );
        return;
      }

      let movedCount = 0;
      for (let i = 0; i < count; i++) {
        if (fromQueue.trayInfo.length > 0) {
          const tray = fromQueue.trayInfo.shift();
          toQueue.trayInfo.push(tray);
          movedCount++;
          this.addLog(
            `托盘 ${tray.trayCode} 从 ${fromQueue.queueName} 移动到 ${toQueue.queueName}（预热房内部移动）`
          );
        } else {
          break;
        }
      }

      if (movedCount < count) {
        this.addLog(
          `${fromQueue.queueName}队列数量不足，仅移动${movedCount}/${count}个托盘到${toQueue.queueName}`
        );
      }
    },

    // 移动托盘 - 根据目标队列标识匹配源队列和目标队列
    moveTrays(fromArea, targetQueueKey, count) {
      // 目标队列映射：目标队列标识 -> {索引, 是否上线}
      const targetQueueMap = {
        a22in: { index: 7, isUp: false }, // A2-2-进 (id=8, index=7)
        b21in: { index: 12, isUp: true }, // B2-1-进 (id=13, index=12)
        b22in: { index: 17, isUp: false }, // B2-2-进 (id=18, index=17)
        c21in: { index: 22, isUp: true }, // C2-1-进 (id=23, index=22)
        c22in: { index: 27, isUp: false }, // C2-2-进 (id=28, index=27)
        d21in: { index: 32, isUp: true }, // D2-1-进 (id=33, index=32)
        d22in: { index: 37, isUp: false }, // D2-2-进 (id=38, index=37)
        e21in: { index: 42, isUp: true }, // E2-1-进 (id=43, index=42)
        e22in: { index: 47, isUp: false } // E2-2-进 (id=48, index=47)
      };

      // 源队列映射：源区域 -> 预热队列索引（根据目标队列的上下线决定）
      const sourceQueueMap = {
        A: { up: 6, down: 6 }, // A1-6 (id=7, index=6) - A区域只有一条线，都在A1-6取
        B: { up: 11, down: 16 }, // B1-3 (id=12, index=11), B1-6 (id=17, index=16)
        C: { up: 21, down: 26 }, // C1-3 (id=22, index=21), C1-6 (id=27, index=26)
        D: { up: 31, down: 36 }, // D1-3 (id=32, index=31), D1-6 (id=37, index=36)
        E: { up: 41, down: 46 } // E1-3 (id=42, index=41), E1-6 (id=47, index=46)
      };

      const targetIndex = targetQueueMap[targetQueueKey].index;
      const sourceIndex = targetQueueMap[targetQueueKey].isUp
        ? sourceQueueMap[fromArea].up
        : sourceQueueMap[fromArea].down;

      // 直接通过索引获取队列对象
      const sourceQueue = this.queues[sourceIndex];
      const targetQueue = this.queues[targetIndex];

      if (!sourceQueue || !targetQueue) {
        this.addLog(
          `未找到队列：源队列索引${sourceIndex} 或 目标队列索引${targetIndex}`
        );
        return;
      }
      for (let i = 0; i < count && sourceQueue.trayInfo.length > 0; i++) {
        const tray = sourceQueue.trayInfo.shift();
        targetQueue.trayInfo.push(tray);
        this.addLog(
          `托盘 ${tray.trayCode} 从 ${sourceQueue.queueName} 移动到 ${targetQueue.queueName}`
        );
      }
    },

    // 移动托盘从灭菌到解析 - 根据目标队列标识匹配源队列和目标队列
    moveTraysFromDisinfectionToAnalysis(fromArea, targetQueueKey, count) {
      // 目标队列映射：目标队列标识 -> {索引, 是否上线}
      const targetQueueMap = {
        a34: { index: 8, isUp: true }, // A3-4 (id=9, index=8)
        b31: { index: 13, isUp: true }, // B3-1 (id=14, index=13)
        b34: { index: 18, isUp: false }, // B3-4 (id=19, index=18)
        c31: { index: 23, isUp: true }, // C3-1 (id=24, index=23)
        c34: { index: 28, isUp: false }, // C3-4 (id=29, index=28)
        d31: { index: 33, isUp: true }, // D3-1 (id=34, index=33)
        d34: { index: 38, isUp: false }, // D3-4 (id=39, index=38)
        e31: { index: 43, isUp: true }, // E3-1 (id=44, index=43)
        e34: { index: 48, isUp: false } // E3-4 (id=49, index=48)
      };

      // 源队列映射：源区域 -> 灭菌出队列索引（根据目标队列的上下线决定）
      const sourceQueueMap = {
        A: { up: 51, down: 51 }, // A2-2-出 (id=52, index=51) - A区域只有一条线，都在A2-2-出取
        B: { up: 52, down: 53 }, // B2-1-出 (id=53, index=52), B2-2-出 (id=54, index=53)
        C: { up: 54, down: 55 }, // C2-1-出 (id=55, index=54), C2-2-出 (id=56, index=55)
        D: { up: 56, down: 57 }, // D2-1-出 (id=57, index=56), D2-2-出 (id=58, index=57)
        E: { up: 58, down: 59 } // E2-1-出 (id=59, index=58), E2-2-出 (id=60, index=59)
      };

      const targetIndex = targetQueueMap[targetQueueKey].index;
      const sourceIndex = targetQueueMap[targetQueueKey].isUp
        ? sourceQueueMap[fromArea].up
        : sourceQueueMap[fromArea].down;

      // 直接通过索引获取队列对象
      const sourceQueue = this.queues[sourceIndex];
      const targetQueue = this.queues[targetIndex];

      if (!sourceQueue || !targetQueue) {
        this.addLog(
          `未找到队列：源队列索引${sourceIndex} 或 目标队列索引${targetIndex}`
        );
        return;
      }
      for (let i = 0; i < count && sourceQueue.trayInfo.length > 0; i++) {
        const tray = sourceQueue.trayInfo.shift();
        targetQueue.trayInfo.push(tray);
        this.addLog(
          `托盘 ${tray.trayCode} 从 ${sourceQueue.queueName} 移动到 ${targetQueue.queueName}`
        );
      }
    },
    // 灭菌柜进队列到出队列的移动（类似DE队列）
    moveDisinfectionTraysToOut(line) {
      const queueIndexMap = {
        A: { in: [7], out: [51] },
        B: { in: [12, 17], out: [52, 53] },
        C: { in: [22, 27], out: [54, 55] },
        D: { in: [32, 37], out: [56, 57] },
        E: { in: [42, 47], out: [58, 59] }
      };

      const queues = queueIndexMap[line];
      if (!queues) return;

      for (const inQueueIndex of queues.in) {
        const inQueue = this.queues[inQueueIndex];
        if (inQueue && inQueue.trayInfo.length > 0) {
          const trays = [...inQueue.trayInfo];
          const moveCount = trays.length;
          inQueue.trayInfo = [];

          // 固定对应关系：上线对上线，下线对下线
          const inQueueIndexInArray = queues.in.indexOf(inQueueIndex);
          const outQueueIndex =
            queues.out[inQueueIndexInArray] || queues.out[0];
          const outQueue = this.queues[outQueueIndex];

          if (outQueue) {
            trays.forEach((tray) => {
              outQueue.trayInfo.push(tray);
            });
          }

          this.addLog(
            `${line}灭菌柜出货数量从0增加，移动${moveCount}个托盘到${line}解析队列`
          );
        }
      }
    },
    // 写入PLC后2秒取消
    writeWordWithCancel(addr, value) {
      ipcRenderer.send('writeSingleValueToPLC', addr, Number(value) || 0);
      setTimeout(() => {
        ipcRenderer.send('cancelWriteToPLC', addr);
      }, 2000);
    },
    // 更新并写入预热到灭菌柜需进货数量
    updateDisinfectionNeedAndWrite() {
      const leftFromPreheat = this.getPreheatCountFor(
        this.disinfectionRoomSelectedFrom
      );
      this.disinfectionNeedQty = leftFromPreheat;

      this.addLog(`写入PLC DBW1042（灭菌柜需进货数量）: ${leftFromPreheat}`);
      // 暂时注释，不知道往哪个位置写入
      this.writeWordWithCancel('DBW1042', leftFromPreheat);
    },
    // 更新并写入灭菌柜到解析房需进货数量
    updateAnalysisNeedAndWrite() {
      // 使用出队列数量（灭菌柜完成后的托盘）
      const leftFromSterilize = this.getSterilizeOutCountFor(
        this.warehouseSelectedFrom
      );
      this.analysisNeedQty = leftFromSterilize;

      this.addLog(`写入PLC DBW1044（解析柜需进货数量）: ${leftFromSterilize}`);
      this.writeWordWithCancel('DBW1044', leftFromSterilize);
    },
    // 更新出库需进货数量并写入PLC
    updateOutNeedAndWrite(line) {
      if (!line) return;

      // 获取该线出库队列的托盘数量（只计算A35、B32、B35、C32、C35、D32、D35、E32、E35）
      const outCount = this.getOutWarehouseCountFor(line);
      this.outNeedQty[line] = outCount;

      this.addLog(`${line}线出库需进货数量更新为：${outCount}`);

      // 根据不同的线写入对应的PLC地址
      let plcAddress = '';
      switch (line) {
        case 'A':
          plcAddress = 'DBW1046';
          break;
        case 'B':
          plcAddress = 'DBW1048';
          break;
        case 'C':
          plcAddress = 'DBW1050';
          break;
        case 'D':
          plcAddress = 'DBW1052';
          break;
        case 'E':
          plcAddress = 'DBW1054';
          break;
        default:
          this.addLog(`未知的线：${line}`);
          return;
      }

      // 写入PLC出库需进货数量
      this.writeWordWithCancel(plcAddress, outCount);
      this.addLog(`写入PLC ${plcAddress}（${line}线需出货数量）: ${outCount}`);

      // 自动停止条件：只有在执行状态时才检查
      if (this.outWarehouseExecuting[line]) {
        if (outCount === 0) {
          this.addLog(`${line}线出库已完成，自动停止`);
          this.cancelOutWarehouse(line);
        }
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
            .title-actions {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .add-order-btn {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 28px;
              height: 28px;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s ease;
              background: rgba(64, 158, 255, 0.2);
              border: 1px solid rgba(64, 158, 255, 0.3);
              i {
                font-size: 16px;
                color: #409eff;
                transition: all 0.3s ease;
              }
            }
            .add-order-btn:hover {
              background: rgba(64, 158, 255, 0.3);
              border-color: rgba(64, 158, 255, 0.5);
              i {
                color: #fff;
              }
            }
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
              width: 223px;

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
              height: 100%;
              display: flex;
              align-items: center;
              padding: 0px 5px;
              background: linear-gradient(135deg, #233445, #283b51);
              border: 1px solid rgba(50, 75, 110, 0.4);
              border-radius: 8px;
              transition: all 0.3s ease;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
              /deep/ .el-checkbox {
                display: flex;
                flex-direction: column; // 文字在下
                align-items: center; // 居中
                gap: 4px; // 间距

                .el-checkbox__input {
                  margin-right: 0; // 移除默认右边距
                }

                .el-checkbox__label {
                  color: rgba(255, 255, 255, 0.85);
                  font-size: 12px;
                  padding-left: 0; // 移除默认左内边距
                }
                .el-checkbox__input.is-checked .el-checkbox__inner {
                  background-color: #0ac5a8;
                  border-color: #0ac5a8;
                }
              }
              &:hover {
                background: linear-gradient(
                  135deg,
                  rgba(20, 60, 75, 0.9),
                  rgba(40, 75, 95, 0.75)
                );
                border-color: rgba(70, 120, 140, 0.5);
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
                background: green;
              }

              .arrow-marker.active::after {
                border-left-color: green;
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
                  color: rgba(255, 193, 7, 0.2);
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
                  color: rgba(40, 167, 69, 0.2);
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
                width: 500px;
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
                    padding: 6px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                  }

                  .line-container {
                    display: flex;
                    width: 100%;
                    gap: 0;
                  }

                  .line-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 4px 5px;
                    border-right: 1px solid #666;
                    min-width: 0;
                  }

                  .line-item:last-child {
                    border-right: none;
                  }

                  .line-label {
                    font-size: 12px;
                    color: white;
                    font-weight: bold;
                    margin-bottom: 4px;
                  }

                  .line-buttons {
                    width: 100%;
                    margin-bottom: 4px;
                  }

                  .line-status {
                    width: 100%;
                    text-align: center;
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

/* 新建订单弹窗样式 */
.add-order-dialog {
  .form-container {
    padding: 20px 0;
  }
}

/* 托盘码录入样式 */
.tray-codes-section {
  .tray-codes-container {
    .tray-input-section {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
      align-items: center;

      .el-input {
        flex: 1;
      }
    }

    .tray-codes-display {
      .tray-codes-list {
        max-height: 150px;
        overflow-y: auto;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 10px;
        background-color: #fafafa;

        .tray-code-tag {
          display: inline-flex;
          align-items: center;
          background-color: #409eff;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          margin: 2px;
          font-size: 12px;
          position: relative;

          .tray-code-text {
            margin-right: 8px;
          }

          .remove-btn {
            color: white;
            padding: 0;
            margin: 0;
            font-size: 12px;
            width: 16px;
            height: 16px;
            min-height: 16px;
            line-height: 1;

            &:hover {
              color: #ff4757;
            }
          }
        }
      }
    }
  }
}
</style>
