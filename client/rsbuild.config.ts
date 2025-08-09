import {defineConfig} from '@rsbuild/core';
import {pluginVue} from '@rsbuild/plugin-vue';

export default defineConfig({
    plugins: [pluginVue()],
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [
                    require('@tailwindcss/postcss')
                ]
            }
        }
    }
});
