<script lang="ts" setup>
import { ref } from 'vue';
import { VBtn } from 'vuetify/components/VBtn';
import { VCard, VCardTitle } from 'vuetify/components/VCard';
import { VColorPicker } from 'vuetify/components/VColorPicker';
import { VRadio } from 'vuetify/components/VRadio';
import { VRadioGroup } from 'vuetify/components/VRadioGroup'
import { VDivider } from 'vuetify/components/VDivider';
import { VTextField } from 'vuetify/components/VTextField';
import { VTabs, VTab } from 'vuetify/components/VTabs';
import { VWindow, VWindowItem } from 'vuetify/components/VWindow';
import { VExpansionPanels, VExpansionPanel } from 'vuetify/components/VExpansionPanel';
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

const swatchesBackground = [
  ['#005500', '#004400', '#003300', '#002200', '#001100'],
  ['#005555', '#004444', '#003333', '#002222', '#001111'],
  ['#555500', '#444400', '#333300', '#222200', '#111100'],
  ['#555555', '#444444', '#333333', '#222222', '#111111'],
];
const swatchesForeground = [
  ['#FFFFFF', '#EEEEEE', '#DDDDDD', '#CCCCCC', '#BBBBBB'],
  ['#FFEEDD', '#FFDDCC', '#FFCCBB', '#FFBBAA', '#FFAA99'],
]
const swatchesProgress = [
  ['#00990080', '#00770080', '#00550080', '#00330080', '#00110080'],
  ['#00999980', '#00777780', '#00555580', '#00333380', '#00111180'],
  ['#99990080', '#77770080', '#55550080', '#33330080', '#11110080'],
  ['#99999980', '#77777780', '#55555580', '#33333380', '#11111180'],
];
</script>

<template>
  <v-card>
    <template #title><v-card-title>设置</v-card-title></template>
    <template #append>
      <v-btn :icon="mdiClose" color="error" @click="store.settingsOpen = false;"></v-btn>
    </template>
    <v-tabs v-model="settingTab">
      <v-tab v-for="item, key in settingsItem" :value="key" :key="key">{{ item }}</v-tab>
    </v-tabs>
    <v-window v-model="settingTab">
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
        <v-expansion-panels>
          <v-expansion-panel title="背景颜色">
            <template #text>
              <v-color-picker mode="rgb" v-model="store.preferences.background" :swatches="swatchesBackground" show-swatches></v-color-picker>
            </template>
          </v-expansion-panel>
          <v-expansion-panel title="字体颜色">
            <template #text>
              <v-color-picker mode="rgb" v-model="store.preferences.foreground" :swatches="swatchesForeground" show-swatches></v-color-picker>
            </template>
          </v-expansion-panel>
          <v-expansion-panel title="进度条颜色">
            <template #text>
              <v-color-picker mode="rgba" v-model="store.preferences.colorProgress" :swatches="swatchesProgress" show-swatches></v-color-picker>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-window-item>
      <v-window-item value="font">
        <v-text-field v-model="store.preferences.fontFamily">
          <template #details>font-family 编辑规则：支持多个字体，优先选择前面的，每两个备选项中间用<strong>英文逗号</strong>隔开</template>
        </v-text-field>
      </v-window-item>
      <v-window-item value="about" class="px-4 py-2">
        <div>网站图标来源：<a href="https://www.freepik.com/" target="_blank">freepik.com</a></div>
        <div>此项目代码已开源：<a href="https://github.com/cup113/full-clock" target="_blank">Github Repo (含使用说明与更新日志)</a></div>
        <div>点击此处<a href="https://github.com/cup113/full-clock/issue" target="_blank">反馈</a></div>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<style scoped>
.title-customized {
  width: 12em;
}
</style>