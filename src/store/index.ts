import { defineStore } from "pinia";
import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import dayjs from 'dayjs';

export const enum SecondStyle {
  FullscreenBar = 'fullscreen-bar',
  UpperBar = 'upper-bar',
  DigitIn = 'digit-in',
  Off = 'off',
}

export const enum TitleStyle {
  Date = 'date',
  Customized = 'customized',
  Off = 'off',
}

const useStore = defineStore("index", () => {
  const now = ref(dayjs(new Date()));
  const preferences = useLocalStorage('FL_preferences', {
    background: '#004400',
    foreground: '#FFFFFF',
    fontFamily: 'numberonly, Arial, 等线, sans-serif',
    secondStyle: SecondStyle.FullscreenBar,
    colorProgress: '#00550080',
    titleStyle: TitleStyle.Date,
    titleCustomized: '',
  });
  const formatString = computed(() => preferences.value.secondStyle === SecondStyle.DigitIn ? 'HH:mm:ss' : 'HH:mm');
  const displayTime = computed(() => {
    return now.value.format(formatString.value);
  });
  const barProgress = computed(() => now.value.second() / 60);
  setInterval(() => {
    now.value = dayjs(new Date());
  }, 1000);
  const title = computed(() => {
    switch (preferences.value.titleStyle) {
      case TitleStyle.Customized:
        return preferences.value.titleCustomized;
      case TitleStyle.Date:
        return now.value.format('YYYY/MM/DD');
      case TitleStyle.Off:
        return '';
    }
  });
  const settingsOpen = ref(false);
  return { now, displayTime, preferences, barProgress, title, settingsOpen };
});

export default useStore;
