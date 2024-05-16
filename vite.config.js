import { resolve } from 'path'
import { defineConfig } from 'vite'
import fs from 'fs'

export default defineConfig({
    build: {
        rollupOptions: {
            input: fs.readdirSync(process.cwd()).
                filter(file => file.endsWith('.html')).
                reduce((acc, cur) => ({ ...acc, [cur.split(".")[0]]: resolve(__dirname, cur) }), {}),
        },
    },
})