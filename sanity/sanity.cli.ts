import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'zym8k10b',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
    // Hosted Studio: https://redox-bio-nutrients.sanity.studio/
    appId: 'iesd53hw6z28fb70wvklg09o',
  }
})
