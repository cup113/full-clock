<script lang="ts" setup>
import useStore, { SecondStyle, TitleStyle } from '../store/index';
import { VBtn } from 'vuetify/components/VBtn';
import { VCard, VCardTitle } from 'vuetify/components/VCard';
import { VColorPicker } from 'vuetify/components/VColorPicker';
import { VRadio } from 'vuetify/components/VRadio';
import { VRadioGroup } from 'vuetify/components/VRadioGroup'
import { VDivider } from 'vuetify/components/VDivider';
import { VTextField } from 'vuetify/components/VTextField';
import { VExpansionPanels, VExpansionPanel } from 'vuetify/components/VExpansionPanel';
import { mdiClose } from '@mdi/js';

const store = useStore();
</script>

<template>
  <v-card>
    <template #title><v-card-title>设置</v-card-title></template>
    <template #append>
      <v-btn :icon="mdiClose" color="error" @click="store.settingsOpen = false;"></v-btn>
    </template>
    <v-expansion-panels>
      <v-expansion-panel title="自定义显示内容">
        <template #text>
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
        </template>
      </v-expansion-panel>
      <v-expansion-panel title="自定义颜色">
        <template #text>
          <v-expansion-panels>
            <v-expansion-panel title="背景颜色">
              <template #text>
                <v-color-picker mode="rgb" v-model="store.preferences.background"></v-color-picker>
              </template>
            </v-expansion-panel>
            <v-expansion-panel title="字体颜色">
              <template #text>
                <v-color-picker mode="rgb" v-model="store.preferences.foreground"></v-color-picker>
              </template>
            </v-expansion-panel>
            <v-expansion-panel title="进度条颜色">
              <template #text>
                <v-color-picker mode="rgba" v-model="store.preferences.colorProgress"></v-color-picker>
              </template>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>

      </v-expansion-panel>
      <v-expansion-panel title="自定义字体">
        <template #text>
          <v-text-field v-model="store.preferences.fontFamily"></v-text-field>
        </template>
      </v-expansion-panel>
      <v-expansion-panel title="关于我们">
        <template #text>
          <div>网站图标来源：<a href="https://www.freepik.com/" target="_blank">freepik.com</a></div>
          <div><a href="https://github.com/cup113/full-clock" target="_blank">查看源代码</a></div>
          <div><a href="https://github.com/cup113/full-clock/issue" target="_blank">反馈</a></div>
        </template>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<style scoped>
.title-customized {
  width: 12em;
}
</style>