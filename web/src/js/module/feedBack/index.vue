<template>
  <Modal
    v-model="feedBackShow"
    width="70%"
    :closable="false"
    class="modal-container"
  >
    <p slot="header">
      <span>{{ actionType === 'add' ? $t('message.feedBack.addTitle') : $t('message.feedBack.appendTitle') }}</span>
      <span class="titleTips">
        ({{ $t('message.feedBack.titleTips') }}
        <span class="titleTipsPhone">{{ $t('message.feedBack.titleTipsPhone') }}</span>
        )
      </span>
    </p>
    <Form
      ref="feedBackForm"
      :model="feedBackForm"
      :rules="formValid"
      label-position="right"
      :label-width="80"
      class="form-content">
      <FormItem
        :label="$t('message.feedBack.submitType')"
        prop="submitType">
        <span v-for="(item, index) in submitTypeList" :key="index">
          <Poptip trigger="hover" word-wrap width="200" title="" :content="item.content" placement="bottom">
            <Button class="type-btn-item" :class="submitTypeStyle(item.code)" :disabled="actionType === 'append'"  @click="selectSubmitType(item)">{{ item.title }}</Button>
          </Poptip>
        </span>
      </FormItem>
      <FormItem
        :label="$t('message.feedBack.subject')"
        prop="subject">
        <Input v-model="feedBackForm.subject" :maxlength="200" :placeholder="$t('message.feedBack.pleaseInputTitle')" />
      </FormItem>
      <FormItem
        :label="$t('message.feedBack.pdesc')"
        prop="pdesc">
        <Input v-model="feedBackForm.pdesc" type="textarea" :maxlength="2000" :rows="4" :placeholder="$t('message.feedBack.pleaseInputProblemDesc')" />
      </FormItem>
      <FormItem class="upload-row-item" style="width: 100%;">
        <Upload
          ref="upload"
          name="fileName"
          multiple
          action=""
          :headers="headers"
          :data="getFileConfig"
          :default-file-list="defaultFile"
          :max-size="maxSize"
          :format="['jpg','png','jpeg','gif','pdf','doc','docx','zip']"
          :on-exceeded-size="handleMaxSize"
          :on-format-error="fileFormatError"
          :before-upload="beforeUpload"
          :on-remove="handleRemove"
          :on-preview="handlePreview"
        >
          <Button icon="ios-cloud-upload-outline">{{ $t('message.feedBack.uploadFile') }}</Button>
          <div slot="tip" class="upload-tip">{{ $t('message.feedBack.uploadTips') }}</div>
        </Upload>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button
        type="default"
        size="large"
        @click="cancel">{{$t('message.constants.cancel')}}</Button>
      <Button
        type="primary"
        size="large"
        :loading="saveLoading"
        @click="saveFeedBack">{{$t('message.constants.submit')}}</Button>
    </div>
    <Spin fix v-if="loading"></Spin>
  </Modal>
</template>
<script>
import { isEmpty, assign } from 'lodash';
import storage from '@/js/helper/storage';
import api from '@/js/service/api';
import module from './index';
const FILE_TYPE = ['jpg', 'png', 'gif', 'pdf', 'doc', 'docx', 'zip'];
export default {
  props: {
    feedBackFormShow: {
      type: Boolean,
      default: false,
    },
    actionType: {
      type: String,
      default: '',
    },
    feedBackType: {
      type: String,
      default: 'itype.luban.other',
    },
    issueId: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      default: 'notice',
    }
  },
  data() {
    this.formValid = {
      subject: [
        { required: true, message: this.$t('message.feedBack.pleaseInputTitle'), trigger: 'blur' },
        { validator: (rule, value, callback) => { this.inputTitle(rule, value, callback); }, trigger: 'blur' }
      ],
      pdesc: [
        { required: true, message: this.$t('message.feedBack.pleaseInputProblemDesc'), trigger: 'blur' },
        { validator: (rule, value, callback) => { this.inputProblemDesc(rule, value, callback); }, trigger: 'blur' }
      ],
    };
    this.maxSize = 10485760;
    return {
      loading: false,
      feedBackForm: {
        ipriority: '',
        itype: '',
        subject: '',
        pdesc: '',
      },
      defaultParams: {
        processName: 'luban',
        processUid: 18,
        reporter: 18,
        reporterName: 'luban',
        tableName: 0
      },
      submitTypeList: [],
      feedBackShow: false,
      uploadFile: [],
      defaultFile: [],
      saveLoading: false,
      url: module.data.API_PATH,
    };
  },
  computed: {
    headers() {
      return {
        'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtYWlsIjpudWxsLCJwaG9uZSI6IjE3NzE3MjkxMzQxIiwicm9sZXMiOiJzdXBlclVzZXIiLCJpZCI6IjEiLCJ1c2VybmFtZSI6ImFkbWluIiwiZXhwIjoxNjI4NzUxNTg0LCJuYmYiOjE1OTcyMTU1ODR9.XxG57DsnayGZY_J90gIpyRrMe5x95lKf9hzJh320XmM',
        'Content-Type': 'multipart/form-data'
      };
    },
    getFileConfig() {
      const config = {
        tableName: 0
      };
      return config;
    },
    submitTypeStyle() {
      return (code) => {
        return {
          'type-btn-item-selected': this.feedBackForm.itype === code
        }
      }
    }
  },
  watch: {
    feedBackFormShow(val) {
      this.feedBackShow = val;
      if (val) {
        this.open();
      }
    },
    feedBackShow(val) {
      if (!val) {
        this.resetForm();
      }
      this.$emit('show', val);
    }
  },
  mounted() {
    const feedBackTypeOptions = storage.get('feedBackTypeOptions');
    if (!isEmpty(feedBackTypeOptions) && feedBackTypeOptions.length > 0) {
      this.submitTypeList = feedBackTypeOptions;
    } else {
      this.initData();
    }
  },
  methods: {
    initData() {
      this.loading = true;
      api.fetch(`${this.url}dict/items`, 'get').then((data) => {
        if (!isEmpty(data)) {
          const { typeMap: { itype } } = data;
          const [lubanType] = itype.filter((item) => item.dictItemId === 'itype.luban');
          if (!isEmpty(lubanType) && lubanType.children.length > 0) {
            lubanType.children.forEach((item) => {
              const itypeCodeAry = item.dictItemId.split('.');
              this.submitTypeList.push({
                title: item.dictItemName,
                code: item.dictItemId,
                content: this.$t(`message.feedBack.submitTypeContent.${itypeCodeAry[itypeCodeAry.length - 1]}.content`),
                ipriority: this.$t(`message.feedBack.submitTypeContent.${itypeCodeAry[itypeCodeAry.length - 1]}.ipriority`),
              });
            });
            storage.set('feedBackTypeOptions', this.submitTypeList);
          }
        }
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    selectSubmitType(item) {
      if (this.actionType === 'add') {
        this.feedBackForm.ipriority = item.ipriority;
        this.feedBackForm.itype = item.code;
      }
    },
    saveFeedBack() {
      this.$refs.feedBackForm.validate((valid) => {
        if (valid) {
          let requestUrl = '';
          let params = {};
          const userInfo = storage.get('userInfo');
          if (!userInfo.basic.username) {
            this.$Message.warning({
              content: this.$t('message.feedBack.nonExitUserName'),
              duration: Number(this.$t('message.feedBack.messageDuration'))
            });
            return false;
          }
          if (this.actionType === 'add') {
            this.addFeedBack();
          } else {
            this.appendFeedBack();
          }
        }
      });
    },
    addFeedBack() {
      const params = assign(this.defaultParams, this.feedBackForm);
      params.status = 'istatus.processing';
      params.remark = storage.get('userInfo').basic.username;
      let formData = new FormData();
      if (this.uploadFile.length > 0) {
        this.uploadFile.forEach((itemFile) => {
          formData.append('files', itemFile);
        });
      }
      formData.append('body', new Blob([JSON.stringify(params)], {type: "application/json"}));
      this.saveLoading = true;
      api.fetch(`${this.url}userFeedBacks`, formData, 'post').then(async (data) => {
        this.saveLoading = false;
        this.feedBackShow = false;
        this.$emit('refresh-notice');
        this.$Message.success({
          content: this.$t('message.feedBack.success.saveMsg'),
          duration: Number(this.$t('message.feedBack.messageDuration'))
        });
      }).catch(() => {
        this.saveLoading = false;
      });
    },
    // 追加反馈
    async appendFeedBack() {
      const form = {
        bizId: this.issueId,
        woDesc: this.feedBackForm.pdesc,
        woSource: '鲁班',
        woSubject: this.feedBackForm.subject,
        woType: 'wotype.issue',
        status: 'wostatus.processing'
      }
      const params = assign(this.defaultParams, form);
      let formData = new FormData();
      if (this.uploadFile.length > 0) {
        this.uploadFile.forEach((itemFile) => {
          formData.append('files', itemFile);
        });
      }
      formData.append('body', new Blob([JSON.stringify(params)], {type: "application/json"}));
      this.saveLoading = true;
      api.fetch(`${this.url}userFeedBacks/addition`, formData, 'post').then(async (data) => {
        this.saveLoading = false;
        this.feedBackShow = false;
        if (this.source === 'detail') {
          this.$emit('refresh-detail');
        } else {
          this.$emit('refresh-notice');
        }
        this.$Message.success({
          content: this.$t('message.feedBack.success.saveMsg'),
          duration: Number(this.$t('message.feedBack.messageDuration'))
        });
      }).catch(() => {
        this.saveLoading = false;
      });
    },
    cancel() {
      this.feedBackShow = false;
      this.resetForm();
    },
    resetForm(){
      this.feedBackForm.itype = 'itype.luban.other';
      this.$refs.feedBackForm.resetFields();
      this.defaultFile = [];
      this.uploadFile = [];
    },
    open() {
      if (this.actionType === 'add') {
        this.feedBackForm.itype = 'itype.luban.other';
      } else {
        this.feedBackForm.itype = this.feedBackType;
      }
    },
    handleMaxSize(file, fileList) {
      this.$Message.warning({
        content: this.$t('message.project.uploadOver'),
        duration: Number(this.$t('message.feedBack.messageDuration'))
      });
    },
    fileFormatError(file, fileList) {
      this.$Message.warning({
        content: this.$t('message.feedBack.uploadFileTypeMsg'),
        duration: Number(this.$t('message.feedBack.messageDuration'))
      });
    },
    beforeUpload(file) {
      // 判断文件类型
      const fileExt = file.name.replace(/.+\./, ""); // 取得文件的后缀名
      if (!FILE_TYPE.includes(fileExt.toLowerCase())) {
        this.$Message.warning({
          content: this.$t('message.feedBack.uploadFileTypeMsg'),
          duration: Number(this.$t('message.feedBack.messageDuration'))
        });
        return false;
      }
      // 判断文件大小
      if (file.size === 0 || file.size > 10485760) {
        this.$Message.warning({
          content: this.$t('message.feedBack.uploadFileSizeMsg'),
          duration: Number(this.$t('message.feedBack.messageDuration'))
        });
        return false;
      }
      // 上传文件个数最多为10个
      if (this.uploadFile.length === 10) {
        this.$Message.warning({
          content: this.$t('message.feedBack.uploadMaxFileMsg'),
          duration: Number(this.$t('message.feedBack.messageDuration'))
        });
        return false;
      }
      // 判断文件是否重名
      const exitFile = this.uploadFile.find((item) => item.name === file.name);
      if (exitFile) {
        this.$Message.warning({
          content: this.$t('message.feedBack.uploadFileRenameMsg'),
          duration: Number(this.$t('message.feedBack.messageDuration'))
        });
        return false;
      }
      this.defaultFile.push(file);
      this.uploadFile.push(file);
      return false;
    },
    handleRemove(file, fileList) {
      if (file) {
        this.defaultFile.splice(this.defaultFile.findIndex((item) => item.uid===file.uid), 1);
        this.uploadFile.splice(this.uploadFile.findIndex((item) => item.uid===file.uid), 1);
      }
    },
    handlePreview(file, response) {
      this.downLoadFile(file);
    },
    downLoadFile(file) {
      const link = document.createElement('a');
      const blob = new Blob([file], { type: file.type });
      link.href = window.URL.createObjectURL(blob);
      link.download = file.name;
      let event = null;
      if (window.MouseEvent) {
        event = new MouseEvent('click');
      } else {
        event = document.createEvent('MouseEvents');
      }
      const flag = link.dispatchEvent(event);
      this.$nextTick(() => {
        if (flag) {
          this.$Message.success({
            content: this.$t('message.workBench.body.script.history.success.download'),
            duration: Number(this.$t('message.feedBack.messageDuration'))
          });
        }
      });
    },
    inputTitle(rule, value, callback) {
      value = value ? value.trim() : '';
      if (!value) {
        return callback(new Error(this.$t('message.feedBack.pleaseInputTitle')));
      }
      if (value.length > 200) {
        callback(new Error(this.$t('message.feedBack.inputTitleMax')));
      } else {
        callback();
      }
    },
    inputProblemDesc(rule, value, callback) {
      value = value ? value.trim() : '';
      if (!value) {
        return callback(new Error(this.$t('message.feedBack.pleaseInputProblemDesc')));
      }
      if (value.length > 2000) {
        callback(new Error(this.$t('message.feedBack.inputProblemDescMax')));
      } else {
        callback();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.modal-container {
  font-family: -apple-system,BlinkMacSystemFont,segoe ui,Roboto,helvetica neue,Arial,noto sans,sans-serif,apple color emoji,segoe ui emoji,segoe ui symbol,noto color emoji;
  .titleTips {
    padding-left: 10px;
    font-size: 12px;
    font-weight: 400;
  }
  .titleTipsPhone {
    font-weight: 700;
    vertical-align: initial;
  }
  /deep/ .ivu-modal-body {
      height: 450px;
      overflow-y: auto;
    }
    .form-content {
      margin: auto 10px;
      /deep/ textarea.ivu-input {
        font-size: 12px;
      }
      .type-btn-item, .type-btn-item:hover {
        width: 100px;
        margin-right: 10px;
      }
      .type-btn-item:focus {
        box-shadow: none;
      }
      .type-btn-item-selected {
        border-color: #2d8cf0;
        color: #57a3f3;
      }
      .disabled-submit-type {
        box-shadow: none;
        background: #f8f8f9;
      }
      .disabled-color, .disabled-color:hover {
        color: #808695;
      }
      /deep/ .ivu-card-body {
        text-align: center;
        padding: 6px;
      }
      .upload-tip {
        display: inline-block;
        padding-left: 5px;
      }
      /deep/ .ivu-upload-list-remove {
        padding-top: 8px;
      }
      /deep/ .ivu-form-item-content {
        width: calc(100% - 100px);
        display: inline-block;
        margin-left: 0 !important;
      }
      .upload-row-item /deep/ .ivu-form-item-content {
        width: calc(100% - 20px);
      }
    }
  /deep/ .vertical-center-modal{
    display: flex;
    align-items: center;
    justify-content: center;

    .ivu-modal{
      top: 0;
    }
  }
  .card-content {
    height: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>