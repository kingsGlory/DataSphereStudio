<template>
  <div class="editor">
    <div class="workbench-body-navbar">
      <div
        class="workbench-body-navbar-item"
        @click="undo">
        <Icon type="ios-undo" />
        <span class="navbar-item-name">{{ $t('message.workBench.body.script.editor.navBar.undo') }}</span>
      </div>
      <div
        class="workbench-body-navbar-item"
        @click="redo">
        <Icon type="ios-redo" />
        <span class="navbar-item-name">{{ $t('message.workBench.body.script.editor.navBar.redo') }}</span>
      </div>
      <div
        v-if="scriptType!=='hdfsScript'"
        class="workbench-body-navbar-group">
        <div
          v-show="!script.running"
          v-if="script.executable"
          class="workbench-body-navbar-item"
          title="F3"
          :class="{'disabled':loading}"
          @click.stop="run">
          <Icon type="ios-play" />
          <span class="navbar-item-name">{{ $t('message.workBench.body.script.editor.navBar.play') }}</span>
        </div>
        <div
          v-show="script.running"
          v-if="script.executable"
          class="workbench-body-navbar-item"
          @click.stop="stop">
          <Icon
            type="md-square"
            style="color:red"/>
          <span class="navbar-item-name">{{ $t('message.workBench.body.script.editor.navBar.stop') }}</span>
        </div>
        <div
          v-if="!script.readOnly"
          class="workbench-body-navbar-item"
          title="Ctrl+S"
          @click="save">
          <Icon type="md-checkmark" />
          <span class="navbar-item-name">{{ $t('message.workBench.body.script.editor.navBar.save') }}</span>
        </div>
        <div
          v-if="!script.readOnly && isSupport"
          class="workbench-body-navbar-item"
          @click="config">
          <Icon type="ios-build" />
          <span class="navbar-item-name">{{ $t('message.workBench.body.script.editor.navBar.config') }}</span>
        </div>
      </div>
    </div>
    <div class="editor-content">
      <we-editor
        ref="editor"
        v-model="script.data"
        :language="script.lang"
        :id="script.id"
        :read-only="script.readOnly"
        :script-type="scriptType"
        :application="script.application"
        type="code"
        @on-operator="heartBeat"
        @on-run="run"
        @on-save="save"
        @is-parse-success="changeParseSuccess"/>
      <setting
        ref="setting"
        v-show="showConfig"
        :script="script"
        :work="work"
        @setting-close="settingClose"/>
    </div>
  </div>
</template>
<script>
import setting from './setting.vue';
import api from '@/js/service/api';
import storage from '@/js/helper/storage';
import { throttle } from 'lodash';
export default {
  components: {
    setting,
  },
  props: {
    script: {
      type: Object,
      required: true,
    },
    work: {
      type: Object,
      required: true,
    },
    scriptType: {
      type: String,
      default: 'workspaceScript',
    },
  },
  data() {
    return {
      showConfig: false,
      loading: false,
      isParseSuccess: true,
    };
  },
  computed: {
    listenResource() {
      return this.script.running;
    },
    isHdfs() {
      return this.work.filepath.indexOf('hdfs') === 0;
    },
    isSupport() {
      return this.script.executable;
    },
  },
  watch: {
    listenResource(val) {
      if (!val) {
        api.fetch('/jobhistory/list', {
          pageSize: 100,
          status: 'Running,Inited,Scheduled',
        }, 'get').then((rst) => {
          this.dispatch('Footer:updateRunningJob', rst.tasks.length);
        }).catch((err) => {
        });
      }
    },
    'work.unsave'(val) {
      if (!val) {
        this.$refs.setting.origin = JSON.stringify(this.script.params);
      }
    },
  },
  methods: {
    'Workbench:insertValue'(args) {
      if (args.id === this.script.id) {
        this.$refs.editor.insertValueIntoEditor(args.value);
      }
    },
    'Workbench:setParseAction'(id) {
      if (id === this.script.id) {
        const editor = this.$refs.editor;
        if (editor) {
          const isParserClose = !!storage.get('isParserClose', 'local');
          editor.isParserClose = isParserClose;
          editor.closeParser && editor.closeParser.set(!isParserClose);
          editor.openParser && editor.openParser.set(isParserClose);
        }
      }
    },
    undo() {
      this.$refs.editor.undo();
    },
    redo() {
      this.$refs.editor.redo();
    },
    async run() {
      // if (!this.isParseSuccess) return this.$Message.warning('代码中有语法错误，请检查后再试！');
      if (this.script.running) return this.$Message.warning(this.$t('message.workBench.body.script.editor.warning.running'));
      let selectCode = this.$refs.editor.getValueInRange() || this.script.data;
      let validRepeat = await this.validateRepeat();
      this.$refs.editor.deltaDecorations(selectCode, (flag) => {
        // if (!flag) {
        //     return this.$Message.warning('代码中有语法错误，请检查后再试！');
        // }
        if (!validRepeat) return this.$Message.warning(this.$t('message.workBench.body.script.editor.warning.invalidArgs'));
        if (this.loading) return this.$Message.warning(this.$t('message.constants.warning.api'));
        if (!selectCode) {
          return this.$Message.warning(this.$t('message.workBench.body.script.editor.warning.emptyCode'));
        }
        this.loading = true;
        this.$emit('on-run', {
          code: selectCode,
          id: this.script.id,
        }, (status) => {
          // status是start表示已经开始执行
          let list = ['execute', 'error', 'start', 'downgrade'];
          if (list.indexOf(status) > -1) {
            this.loading = false;
          }
        });
      });
    },
    stop() {
      if (this.loading) return this.$Message.warning(this.$t('message.constants.warning.api'));
      this.loading = true;
      this.$emit('on-stop', (isKilled) => {
        this.loading = false;
      });
    },
    async save() {
      let valid = await this.validateRepeat();
      if (!valid) return this.$Message.warning(this.$t('message.workBench.body.script.editor.warning.invalidArgs'));
      this.$refs.editor.save();
      this.$emit('on-save');
    },
    config() {
      this.showConfig = !this.showConfig;
    },
    settingClose() {
      this.showConfig = false;
    },
    heartBeat: throttle(() => {
      api.fetch('/user/heartbeat', 'get');
    }, 60000),
    // 对this.script.params.variable里面是否存在key重复性进行校验
    // 这里要注意，html结构不能用v-if，只能用v-show，让设置模块处于要渲染状态
    // 否则会需要使用nextTick中await，会发生打开后没渲染的情况。
    async validateRepeat() {
      const setting = this.$refs.setting;
      let valid = true;
      // 当没有自定义参数的时候不做判断
      if (this.script.params.variable.length) {
        // 表单验证返回是个promise，所以需要用await
        valid = await setting.$refs.customVariable.$refs.form.$refs.dynamicForm.validate((valid) => {
          // 如果验证没通过，要打开setting页面
          if (!valid) {
            this.showConfig = true;
          }
          return valid;
        });
      }
      if (setting.$refs.envVariable && this.script.params.configuration.runtime.env.length) {
        valid = await setting.$refs.envVariable.$refs.form.$refs.dynamicForm.validate((valid) => {
          // 如果验证没通过，要打开setting页面
          if (!valid) {
            this.showConfig = true;
          }
          return valid;
        });
      }
      return valid;
    },
    changeParseSuccess(flag) {
      this.isParseSuccess = flag;
    },
  },
};
</script>
