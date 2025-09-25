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
              <div class="data-card">
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
              </div>
            </div>
          </div>
        </div>

        <!-- 操作区 -->
        <div class="operation-panel">
          <div class="section-header">
            <span>操作区</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="showOrderQueryDialog"
            >
              查询历史订单
            </el-button>
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
                  :data-x="marker.x"
                  :data-y="marker.y"
                  @click="handleQueueMarkerClick(marker.queueId)"
                >
                  <div class="queue-marker-content">
                    <span class="queue-marker-name">{{ marker.name }}</span>
                    <span class="queue-marker-count"
                      >({{
                        queues.find((q) => q.id === marker.queueId)?.trayInfo
                          ?.length || 0
                      }})</span
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
                  data-x="73"
                  data-y="327"
                  @click="toggleBitValue(aLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">A1-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit4 === '1' }"
                  data-x="182"
                  data-y="327"
                  @click="toggleBitValue(aLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">A1-5#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit5 === '1' }"
                  data-x="420"
                  data-y="327"
                  @click="toggleBitValue(aLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">A1-6#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit9 === '1' }"
                  data-x="1030"
                  data-y="327"
                  @click="toggleBitValue(aLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label">A3-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: aLineMotorRunning.bit10 === '1' }"
                  data-x="1270"
                  data-y="327"
                  @click="toggleBitValue(aLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label">A3-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: aLineMotorRunning.bit11 === '1' }"
                  data-x="1415"
                  data-y="327"
                  @click="toggleBitValue(aLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label">A3-6#</div>
                </div>
                <!-- A线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="73"
                  data-y="310"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">A1-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="100"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">A1-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="310"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">A1-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="555"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">A1-8#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit12 === '1' }"
                  data-x="935"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit12')"
                >
                  <div class="marker-label">A3-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit13 === '1' }"
                  data-x="1178"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit13')"
                >
                  <div class="marker-label">A3-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit14 === '1' }"
                  data-x="1390"
                  data-y="320"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit14')"
                >
                  <div class="marker-label">A3-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: aLinePhotoelectricSignal.bit15 === '1' }"
                  data-x="1415"
                  data-y="310"
                  @click="toggleBitValue(aLinePhotoelectricSignal, 'bit15')"
                >
                  <div class="marker-label">A3-8#</div>
                </div>
                <!-- B线电机运行信号 -->
                <div
                  class="motor-marker label-left"
                  :class="{ running: bLineMotorRunning.bit0 === '1' }"
                  data-x="73"
                  data-y="378"
                  @click="toggleBitValue(bLineMotorRunning, 'bit0')"
                >
                  <div class="marker-label">B1-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit1 === '1' }"
                  data-x="182"
                  data-y="378"
                  @click="toggleBitValue(bLineMotorRunning, 'bit1')"
                >
                  <div class="marker-label">B1-2#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit2 === '1' }"
                  data-x="420"
                  data-y="378"
                  @click="toggleBitValue(bLineMotorRunning, 'bit2')"
                >
                  <div class="marker-label">B1-3#</div>
                </div>
                <div
                  class="motor-marker label-left"
                  :class="{ running: bLineMotorRunning.bit3 === '1' }"
                  data-x="73"
                  data-y="402"
                  @click="toggleBitValue(bLineMotorRunning, 'bit3')"
                >
                  <div class="marker-label">B1-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit4 === '1' }"
                  data-x="182"
                  data-y="402"
                  @click="toggleBitValue(bLineMotorRunning, 'bit4')"
                >
                  <div class="marker-label">B1-5#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit5 === '1' }"
                  data-x="420"
                  data-y="402"
                  @click="toggleBitValue(bLineMotorRunning, 'bit5')"
                >
                  <div class="marker-label">B1-6#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit6 === '1' }"
                  data-x="1030"
                  data-y="378"
                  @click="toggleBitValue(bLineMotorRunning, 'bit6')"
                >
                  <div class="marker-label">B3-1#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit7 === '1' }"
                  data-x="1270"
                  data-y="378"
                  @click="toggleBitValue(bLineMotorRunning, 'bit7')"
                >
                  <div class="marker-label">B3-2#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: bLineMotorRunning.bit8 === '1' }"
                  data-x="1415"
                  data-y="378"
                  @click="toggleBitValue(bLineMotorRunning, 'bit8')"
                >
                  <div class="marker-label">B3-3#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit9 === '1' }"
                  data-x="1030"
                  data-y="402"
                  @click="toggleBitValue(bLineMotorRunning, 'bit9')"
                >
                  <div class="marker-label">B3-4#</div>
                </div>
                <div
                  class="motor-marker marker-show-label label-left"
                  :class="{ running: bLineMotorRunning.bit10 === '1' }"
                  data-x="1270"
                  data-y="402"
                  @click="toggleBitValue(bLineMotorRunning, 'bit10')"
                >
                  <div class="marker-label">B3-5#</div>
                </div>
                <div
                  class="motor-marker label-right"
                  :class="{ running: bLineMotorRunning.bit11 === '1' }"
                  data-x="1415"
                  data-y="402"
                  @click="toggleBitValue(bLineMotorRunning, 'bit11')"
                >
                  <div class="marker-label">B3-6#</div>
                </div>
                <!-- B线光电检测信号 -->
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit0 === '1' }"
                  data-x="73"
                  data-y="362"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit0')"
                >
                  <div class="marker-label">B1-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit1 === '1' }"
                  data-x="100"
                  data-y="372"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit1')"
                >
                  <div class="marker-label">B1-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit2 === '1' }"
                  data-x="310"
                  data-y="372"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit2')"
                >
                  <div class="marker-label">B1-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit3 === '1' }"
                  data-x="555"
                  data-y="372"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit3')"
                >
                  <div class="marker-label">B1-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit4 === '1' }"
                  data-x="73"
                  data-y="415"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit4')"
                >
                  <div class="marker-label">B1-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit5 === '1' }"
                  data-x="100"
                  data-y="404"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit5')"
                >
                  <div class="marker-label">B1-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit6 === '1' }"
                  data-x="310"
                  data-y="404"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit6')"
                >
                  <div class="marker-label">B1-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit7 === '1' }"
                  data-x="555"
                  data-y="404"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit7')"
                >
                  <div class="marker-label">B1-8#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit8 === '1' }"
                  data-x="935"
                  data-y="372"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit8')"
                >
                  <div class="marker-label">B3-1#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit9 === '1' }"
                  data-x="1178"
                  data-y="372"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit9')"
                >
                  <div class="marker-label">B3-2#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit10 === '1' }"
                  data-x="1390"
                  data-y="372"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit10')"
                >
                  <div class="marker-label">B3-3#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit11 === '1' }"
                  data-x="1415"
                  data-y="363"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit11')"
                >
                  <div class="marker-label">B3-4#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit12 === '1' }"
                  data-x="935"
                  data-y="404"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit12')"
                >
                  <div class="marker-label">B3-5#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit13 === '1' }"
                  data-x="1178"
                  data-y="404"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit13')"
                >
                  <div class="marker-label">B3-6#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit14 === '1' }"
                  data-x="1390"
                  data-y="404"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit14')"
                >
                  <div class="marker-label">B3-7#</div>
                </div>
                <div
                  class="marker label-top"
                  :class="{ scanning: bLinePhotoelectricSignal.bit15 === '1' }"
                  data-x="1415"
                  data-y="416"
                  @click="toggleBitValue(bLinePhotoelectricSignal, 'bit15')"
                >
                  <div class="marker-label">B3-8#</div>
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
        </div>
      </div>
    </div>
    <!-- 订单查询对话框 -->
    <OrderQueryDialog :visible.sync="orderQueryDialogVisible" />
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
        cart1: { min: 312, max: 618 }, // y轴范围615-618
        cart2: { min: 310, max: 620 } // y轴范围310-620
      },
      carts: [
        {
          id: 1,
          name: '小车1',
          x: 615,
          y: 312, // 对应PLC值0的位置（y轴最小值）
          width: 60,
          image: require('@/assets/pingan-wenjian-img/cart1.png')
        },
        {
          id: 2,
          name: '小车2',
          x: 900,
          y: 310, // 对应PLC值0的位置（y轴最小值）
          width: 50,
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
          queueName: 'A2-1',
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
          queueName: 'A2-2',
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
          queueName: 'B2-1',
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
          queueName: 'B2-2',
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
          queueName: 'C2-1',
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
          queueName: 'C2-2',
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
          queueName: 'D2-1',
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
          queueName: 'D2-2',
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
          queueName: 'E2-1',
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
          queueName: 'E2-2',
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
        }
      ],
      // 添加队列位置标识数据
      queueMarkers: [
        // { id: 1, name: 'A1-2', queueId: 1, x: 550, y: 180 },
        // { id: 2, name: 'A1-3', queueId: 2, x: 1200, y: 180 },
        // { id: 3, name: 'A2-1', queueId: 3, x: 2100, y: 180 },
        // { id: 4, name: 'A3-1', queueId: 4, x: 2870, y: 180 },
        // { id: 5, name: 'A3-2', queueId: 5, x: 3520, y: 180 },
        { id: 6, name: 'A1-5', queueId: 6, x: 260, y: 325 },
        { id: 7, name: 'A1-6', queueId: 7, x: 500, y: 325 },
        { id: 8, name: 'A2-2', queueId: 8, x: 765, y: 325 },
        { id: 9, name: 'A3-4', queueId: 9, x: 1105, y: 325 },
        { id: 10, name: 'A3-5', queueId: 10, x: 1345, y: 325 },
        { id: 11, name: 'B1-2', queueId: 11, x: 260, y: 375 },
        { id: 12, name: 'B1-3', queueId: 12, x: 500, y: 375 },
        { id: 13, name: 'B2-1', queueId: 13, x: 765, y: 375 },
        { id: 14, name: 'B3-1', queueId: 14, x: 1105, y: 375 },
        { id: 15, name: 'B3-2', queueId: 15, x: 1345, y: 375 },
        { id: 16, name: 'B1-5', queueId: 16, x: 260, y: 405 },
        { id: 17, name: 'B1-6', queueId: 17, x: 500, y: 405 },
        { id: 18, name: 'B2-2', queueId: 18, x: 765, y: 405 },
        { id: 19, name: 'B3-4', queueId: 19, x: 1105, y: 405 },
        { id: 20, name: 'B3-5', queueId: 20, x: 1345, y: 405 },
        { id: 21, name: 'C1-2', queueId: 21, x: 260, y: 450 },
        { id: 22, name: 'C1-3', queueId: 22, x: 500, y: 450 },
        { id: 23, name: 'C2-1', queueId: 23, x: 765, y: 450 },
        { id: 24, name: 'C3-1', queueId: 24, x: 1105, y: 450 },
        { id: 25, name: 'C3-2', queueId: 25, x: 1345, y: 450 },
        { id: 26, name: 'C1-5', queueId: 26, x: 260, y: 480 },
        { id: 27, name: 'C1-6', queueId: 27, x: 500, y: 480 },
        { id: 28, name: 'C2-2', queueId: 28, x: 765, y: 480 },
        { id: 29, name: 'C3-4', queueId: 29, x: 1105, y: 480 },
        { id: 30, name: 'C3-5', queueId: 30, x: 1345, y: 480 },
        { id: 31, name: 'D1-2', queueId: 31, x: 260, y: 525 },
        { id: 32, name: 'D1-3', queueId: 32, x: 500, y: 525 },
        { id: 33, name: 'D2-1', queueId: 33, x: 765, y: 525 },
        { id: 34, name: 'D3-1', queueId: 34, x: 1105, y: 525 },
        { id: 35, name: 'D3-2', queueId: 35, x: 1345, y: 525 },
        { id: 36, name: 'D1-5', queueId: 36, x: 260, y: 555 },
        { id: 37, name: 'D1-6', queueId: 37, x: 500, y: 555 },
        { id: 38, name: 'D2-2', queueId: 38, x: 765, y: 555 },
        { id: 39, name: 'D3-4', queueId: 39, x: 1105, y: 555 },
        { id: 40, name: 'D3-5', queueId: 40, x: 1345, y: 555 },
        { id: 41, name: 'E1-2', queueId: 41, x: 260, y: 602 },
        { id: 42, name: 'E1-3', queueId: 42, x: 500, y: 602 },
        { id: 43, name: 'E2-1', queueId: 43, x: 765, y: 602 },
        { id: 44, name: 'E3-1', queueId: 44, x: 1105, y: 602 },
        { id: 45, name: 'E3-2', queueId: 45, x: 1345, y: 602 },
        { id: 46, name: 'E1-5', queueId: 46, x: 260, y: 632 },
        { id: 47, name: 'E1-6', queueId: 47, x: 500, y: 632 },
        { id: 48, name: 'E2-2', queueId: 48, x: 765, y: 632 },
        { id: 49, name: 'E3-4', queueId: 49, x: 1105, y: 632 },
        { id: 50, name: 'E3-5', queueId: 50, x: 1345, y: 632 }
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
        a1: 0,
        a2: 0,
        a3: 0
      },
      // B线数量-读取PLC
      bLineQuantity: {
        b1: 0,
        b2: 0,
        b3: 0
      },
      // C线数量-读取PLC
      cLineQuantity: {
        c1: 0,
        c2: 0,
        c3: 0
      },
      // 小车位置数值-读取PLC
      cartPositionValues: {
        cart1: 0, // DBW88, 范围0-1010
        cart2: 0 // DBW90, 范围0-1010
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
          '.marker, .marker-with-panel, .marker-with-button, .queue-marker, .motor-marker, .preheating-room-marker, .analysis-status-marker'
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
      .operation-panel {
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

              /* --- 新增电机点位样式 --- */
              .motor-marker {
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
                  background: rgba(0, 0, 0, 0.8);
                  color: #fff;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 12px;
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
                width: 16px;
                height: 16px;
                transform: translate(-50%, -50%);
                cursor: pointer;
                z-index: 2;
                .data-panel {
                  position: absolute;
                  background: linear-gradient(135deg, #0e1a27, #3c4c63);
                  border: 1px solid rgba(64, 158, 255, 0.3);
                  border-radius: 8px;
                  padding: 12px;
                  width: 170px;
                  // box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                  opacity: 0;
                  transition: all 0.3s ease;
                  pointer-events: none;
                  .data-panel-header {
                    font-size: 14px;
                    color: #409eff;
                    margin-bottom: 6px;
                    padding-bottom: 6px;
                    border-bottom: 1px solid rgba(64, 158, 255, 0.2);
                  }
                  .data-panel-content {
                    font-size: 12px;
                    .data-panel-row {
                      display: flex;
                      justify-content: space-between;
                      color: rgba(255, 255, 255, 0.9);
                      .data-panel-label {
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 12px;
                      }
                    }
                    /* 新增：复选框组样式 */
                    .checkbox-group {
                      display: flex;
                      justify-content: space-between; /* 或 space-between */
                      align-items: center;
                      padding-top: 5px; /* 增加一点顶部间距 */
                    }

                    .checkbox-group .el-checkbox {
                      margin-right: 10px; /* 增加复选框之间的间距 */
                    }

                    /* 调整复选框标签颜色 */
                    .checkbox-group :deep(.el-checkbox__label) {
                      color: rgba(255, 255, 255, 0.8); /* 调整标签颜色 */
                      font-size: 12px; /* 调整标签字体大小 */
                    }

                    /* 执行控制区域的特殊样式 */
                    .exec-controls {
                      display: flex;
                      align-items: center;
                      gap: 3px;
                    }

                    /* 调整选中状态下的颜色 */
                    .checkbox-group
                      :deep(
                        .el-checkbox__input.is-checked + .el-checkbox__label
                      ) {
                      color: #0ac5a8; /* 选中时标签颜色 */
                    }

                    .checkbox-group
                      :deep(
                        .el-checkbox__input.is-checked .el-checkbox__inner
                      ) {
                      background-color: #0ac5a8; /* 选中时背景色 */
                      border-color: #0ac5a8; /* 选中时边框色 */
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
                /* 竖向布局样式 */
                .data-panel.vertical-layout {
                  width: 110px;
                  padding: 8px;
                  .data-panel-row {
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

/* 测试添加结束 */

.qrcode-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.qrcode-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qrcode-label {
  width: 80px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.send-label {
  width: 60px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.qrcode-input {
  flex: 1;
}

.qrcode-input :deep(.el-input__inner) {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #fff;
}

.qrcode-input :deep(.el-input__inner:hover),
.qrcode-input :deep(.el-input__inner:focus) {
  border-color: #0ac5a8;
}

.qrcode-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 8px;
}

.qrcode-actions .el-button {
  background: rgba(10, 197, 168, 0.2);
  border: 1px solid rgba(10, 197, 168, 0.3);
  color: #0ac5a8;
}

.qrcode-actions .el-button:hover {
  background: rgba(10, 197, 168, 0.3);
  border-color: rgba(10, 197, 168, 0.5);
  color: #fff;
}

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

.quantity-test-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.quantity-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quantity-title {
  font-size: 14px;
  color: #0ac5a8;
  font-weight: bold;
}

.quantity-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.quantity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(30, 42, 56, 0.8);
  border-radius: 4px;
  padding: 8px;
  border: 1px solid rgba(10, 197, 168, 0.1);
  margin-bottom: 5px;

  .quantity-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    min-width: 30px;
  }

  .quantity-value {
    font-size: 14px;
    color: #0ac5a8;
    font-weight: bold;
    min-width: 30px;
    text-align: center;
  }

  .quantity-buttons {
    display: flex;
    gap: 5px;

    .quantity-btn {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      background: rgba(10, 197, 168, 0.3);
      border: none;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }

      &.plus {
        background: rgba(10, 197, 168, 0.5);
        &:hover {
          background: rgba(10, 197, 168, 0.7);
        }
      }

      &.minus {
        background: rgba(245, 108, 108, 0.3);
        &:hover {
          background: rgba(245, 108, 108, 0.5);
        }
      }
    }
  }
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
