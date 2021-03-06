<template>
  <div class="container">
    <div class="container-warp">
      我的资源
      <span v-if="errorMsgShow" class="error-msg" @click="openFeedBack">
        <img src="../../../assets/images/Warning-Circle-Fill.svg" class="error-img"/>
        <span class="error-text">异常情况</span>
      </span>
      <span class="refresh">
        <Icon type="md-refresh" @click="search"/>
      </span>
    </div>
    <div class="resource-list">
      <ResourceInfo
        ref="resourceInfo"
        :resourceInfo="resourceInfo"
        @expansion="handleExpansion"
        @renewOrder="handleRenewOrder"
        @cancelOrder="handleCancelOrder"
      />
    </div>
    <div class="container-warp">资源历史</div>
    <div class="resource-list">
      <Table
        :columns="columns"
        :data="historyList"
        max-height="600"
      >
        <template slot-scope="{ row }" slot="resourceInfo">
          <div class="table-column">
            <div class="table-column-item">
              <span>计算资源</span>
              <span>{{ parseComputed(row.resourceInfo) }}</span>
            </div>
            <div class="table-column-item">
              <span>存储周期</span>
              <span>{{ row.resourceInfo.storage }}</span>
            </div>
            <div v-if="row.orderType !== 3" class="table-column-item">
              <span>订购周期</span>
              <span>{{ parseCycle(row.resourceInfo.cycleTime) }}</span>
            </div>
          </div>
        </template>
        <template slot-scope="{ row }" slot="status">
          <div class="table-column">
            <Badge :status="parseStatus(row.status)" :text="parseStatusDesc(row.status)"/>
          </div>
        </template>
        <template slot-scope="{ row }" slot="orderType">
          <span>{{ parseOrderType(row.orderType) }}</span>
        </template>
        <template slot-scope="{ row }" slot="createTime">
          <span>{{ parseDate(row.createTime) }}</span>
        </template>
      </Table>
    </div>
    <FeedBackDialog
      ref="feedBackForm"
      :action-type="feedBackActionType"
      :feedBackFormShow="feedBackShow"
      :feedBackType="feedBackType"
      @show="feedBackShowAction"
    />
    <Spin fix v-if="loading"></Spin>
  </div>
</template>
<script>
import { find, isEmpty } from 'lodash';
import storage from '@/js/helper/storage';
import moment from 'moment';
import api from '@/js/service/api';
import ResourceInfo from './resourceInfo.vue';
import FeedBackDialog from '../feedBack/index.vue';
const ORDER_STATUS = [
  { code: 0, desc: '订购开通中', status: 'processing' },
  { code: 1, desc: '使用中', status: 'success' },
  { code: 2, desc: ' 订购开通失败', status: 'error' },
  { code: 3, desc: '订购已到期', status: 'warning' },
  { code: -1, desc: '异常订单', status: 'warning' },
];
const ORDER_TYPE = [
  { code: 1, desc: '订购' },
  { code: 2, desc: ' 续订' },
  { code: 3, desc: '扩容' },
  { code: 5, desc: '退订' },
  { code: 6, desc: '到期' },
  { code: 7, desc: '销毁' },
];

export default {
  name: 'MyResource',
  components: {
    ResourceInfo,
    FeedBackDialog
  },
  data() {
    this.columns = [
      {
        title: '订单号',
        key: 'workOrderId',
        minWidth: 50,
        align: 'left'
      },
      {
        title: '订单详情',
        key: 'resourceInfo',
        slot: 'resourceInfo',
        align: 'left'
      },
      {
        title: '订单状态',
        key: 'status',
        slot: 'status',
        align: 'left'
      },
      {
        title: '订单类型',
        key: 'orderType',
        slot: 'orderType',
        align: 'left'
      },
      {
        title: '创建时间',
        key: 'createTime',
        slot: 'createTime',
        align: 'left'
      }
    ];
    return {
      loading: false,
      errorMsgShow: false,
      resourceInfo: {},
      historyList: [],
      feedBackShow: false,
      feedBackActionType: '',
      feedBackType: '',
      userId: null,
      userStatus: null,
      nearWorkOrder: {}, // 最新的订单
    };
  },
  created() {
    const userInfo = storage.get('userInfo');
    this.userId = (userInfo.basic && userInfo.basic.ctyunUserId) || "";
    this.userStatus = (userInfo.basic && userInfo.basic.status) || "";
  },
  mounted() {
    this.search();
  },
  methods: {
    search() {
      this.loading = true;
      Promise.all([this.getResourceInfo(), this.getHistory()]).then(() => {
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      })
    },
    async getResourceInfo() {
      await api.fetch('luban/users/resources', { ctyunUserId: this.userId }, 'get').then((rst) => {
        this.resourceInfo = rst;
      });
    },
    async getHistory() {
      this.errorMsgShow = false;
      await api.fetch('workOrder', { ctyunUserId: this.userId }, 'get').then((rst) => {
        this.historyList = rst;
        this.nearWorkOrder = this.getNearWorkOrder();
        if (this.nearWorkOrder.status === 2) this.errorMsgShow = true;
      });
    },
    // 扩容
    async handleExpansion() {
      if (isEmpty(this.nearWorkOrder.workOrderId)) {
        this.$Message.warning('不存在可扩容的资源订单！');
        return;
      }
      await this.getUserInfo();
      if (this.userStatus === 10) { // status = 10为使用中可扩容
        window.open(`${process.env.VUE_APP_CTYUN_EXPANSION}?orderId=${this.nearWorkOrder.workOrderId}`);
      } else {
        this.$Message.warning('当前状态不支持扩容！');
      }
    },
    // 续订
    async handleRenewOrder() {
      if (isEmpty(this.nearWorkOrder.workOrderId)) {
        this.$Message.warning('不存在可续订的资源订单！');
        return;
      }
      await this.getUserInfo();
      // status = 10|11 为使用中或者账户失效可进行续订
      if (this.userStatus === 10 || this.userStatus === 11) {
        window.open(`${process.env.VUE_APP_CTYUN_PROLONG}?orderId=${this.nearWorkOrder.workOrderId}`);
      } else {
        this.$Message.warning('当前状态不支持续订！');
      }
    },
    // 退订
    async handleCancelOrder() {
      if (isEmpty(this.nearWorkOrder.workOrderId)) {
        this.$Message.warning('不存在可退订的资源订单！');
        return;
      }
      await this.getUserInfo();
      if (this.userStatus === 10) { // 正常使用可退订
        this.$Modal.confirm({
          title: "提示",
          content: "<p>退订之后，您的资源和数据将在15天内被回收，确认退订请点击确定按钮。</p>",
          onOk: () => {
            window.open(`${process.env.VUE_APP_CTYUN_UNSUBSCRIBE}?orderId=${this.nearWorkOrder.workOrderId}`);
          }
        });
      } else {
        this.$Message.warning('当前状态不支持退订！');
      }
    },
    getUserInfo() {
      api.fetch('/dss/getBaseInfo', 'get').then((rst) => {
        if (!isEmpty(rst)) {
          storage.set('baseInfo', rst);
          storage.set('userInfo', rst.userInfo);
          this.userStatus = rst.userInfo.basic.status;
        }
      });
    },
    openFeedBack() {
      this.feedBackActionType = 'add';
      this.feedBackShow = true;
    },
    feedBackShowAction(val) {
      this.feedBackShow = val;
    },
    parseDate(date) {
      return moment(date).format('YYYY-MM-DD HH:mm:ss');
    },
    getNearWorkOrder() {
      const createTimeAry = this.historyList.map((item) => {
        return item.createTime;
      })
      const maxCreateTime = Math.max(...createTimeAry);
      return this.historyList.find(item => maxCreateTime === item.createTime);
    },
    parseComputed(resourceInfo) {
      const { coreNum, memSize } = resourceInfo;
      return `${coreNum} ${memSize}`;
    },
    parseCycle(cycleTime) {
      if (cycleTime > 12) {
        const year = cycleTime / 12;
        const month = cycleTime % 12;
        return month ? `${year}年${month}个月` : `${year}年`;
      }
      return `${cycleTime}个月`;
    },
    parseStatus(status) {
      const orderStatus = find(ORDER_STATUS, ['code', status]).status;
      return orderStatus ? orderStatus : '';
    },
    parseStatusDesc(status) {
      const orderStatusDesc = find(ORDER_STATUS, ['code', status]).desc;
      return orderStatusDesc ? orderStatusDesc : '';
    },
    parseOrderType(orderType) {
      const orderTypeDesc = find(ORDER_TYPE, ['code', orderType]).desc;
      return orderTypeDesc ? orderTypeDesc : '';
    }
  },
};
</script>
<style lang="scss" src="./index.scss"></style>
</style>
