import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.africonnect.app',
  appName: 'AfriConnect',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
}

export default config
