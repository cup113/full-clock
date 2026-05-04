import { load, type Preferences, defaults, save } from './preferences.ts';

export { type Preferences, defaults, save };

export const prefs = $state(load());
