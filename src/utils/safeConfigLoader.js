import fallbackConfig from '../config/config.json';
import { normalizeMenuConfig } from '../menu/menuConfig.js';

export async function loadMenuConfig() {
  const configUrl = new URL('../config/config.json', import.meta.url).href;

  try {
    const response = await fetch(configUrl);
    if (!response.ok) {
      throw new Error(`Menu config request failed with status ${response.status}`);
    }

    const config = await response.json();
    return normalizeMenuConfig(config);
  } catch (error) {
    console.warn('Falling back to bundled menu config.', error);
    return normalizeMenuConfig(fallbackConfig);
  }
}
