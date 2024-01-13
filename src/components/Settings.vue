<script lang="ts" setup>
import { ref } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VCard, VCardTitle } from 'vuetify/components/VCard';
import { VRadio } from 'vuetify/components/VRadio';
import { VRadioGroup } from 'vuetify/components/VRadioGroup'
import { VDivider } from 'vuetify/components/VDivider';
import { VTextField } from 'vuetify/components/VTextField';
import { VTabs, VTab } from 'vuetify/components/VTabs';
import { VWindow, VWindowItem } from 'vuetify/components/VWindow';
import { VChip } from 'vuetify/components/VChip';
import { mdiClose } from '@mdi/js';

import useStore, { SecondStyle, TitleStyle } from '../store/index';

const settingsItem = {
  basic: "基础设置",
  colors: "颜色设置",
  font: "字体设置",
  about: "关于我们",
};

const store = useStore();
const settingTab = ref("basic" as keyof typeof settingsItem);
</script>

<template>
  <v-card>
    <template #title><v-card-title>设置</v-card-title></template>
    <template #append>
      <v-btn :icon="mdiClose" color="error" @click="store.settingsOpen = false;"></v-btn>
    </template>
    <v-tabs v-model="settingTab" style="flex-shrink: 0;">
      <v-tab v-for="item, key in settingsItem" :value="key" :key="key">{{ item }}</v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-window v-model="settingTab" style="overflow-y: auto;">
      <v-window-item value="basic">
        <v-radio-group v-model="store.preferences.secondStyle" label="显示秒钟形式" inline>
          <v-radio label="全屏背景长条" :value="SecondStyle.FullscreenBar"></v-radio>
          <v-radio label="上方长条" :value="SecondStyle.UpperBar"></v-radio>
          <v-radio label="数字显示" :value="SecondStyle.DigitIn"></v-radio>
          <v-radio label="关闭" :value="SecondStyle.Off"></v-radio>
        </v-radio-group>
        <v-divider></v-divider>
        <v-radio-group label="标题栏内容" v-model="store.preferences.titleStyle">
          <v-radio label="当日日期" :value="TitleStyle.Date"></v-radio>
          <v-radio :value="TitleStyle.Customized">
            <template #label>
              自定义&nbsp;<v-text-field class="title-customized" v-model="store.preferences.titleCustomized"
                placeholder="示例：考试科目 | 时间"></v-text-field>
            </template>
          </v-radio>
          <v-radio label="不显示" :value="TitleStyle.Off"></v-radio>
        </v-radio-group>
      </v-window-item>
      <v-window-item value="colors">
        <v-text-field label="背景颜色" v-model="store.preferences.background" hint="主界面背景色"></v-text-field>
        <v-text-field label="字体颜色" v-model="store.preferences.foreground" hint="主界面标题、时间文字颜色"></v-text-field>
        <v-text-field label="进度条颜色" v-model="store.preferences.colorProgress" hint="背景进度条颜色"></v-text-field>
      </v-window-item>
      <v-window-item value="font">
        <v-text-field v-model="store.preferences.fontFamily">
          <template #details>font-family 编辑规则：支持多个字体，优先选择前面的，每两个备选项中间用<strong>英文逗号</strong>隔开</template>
        </v-text-field>
      </v-window-item>
      <v-window-item value="about">
        <div><v-chip>网站图标来源：<a href="https://www.freepik.com/" target="_blank">freepik.com</a></v-chip></div>
        <div><v-chip>此项目代码已开源：<a href="https://github.com/cup113/full-clock" target="_blank">Github Repo
              (含使用说明与更新日志)</a></v-chip></div>
        <div><v-chip>点击此处<a href="https://github.com/cup113/full-clock/issue" target="_blank">反馈</a></v-chip></div>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<style scoped>
.title-customized {
  width: 12em;
}
</style>