import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',testMatch:'browser.spec.mjs',workers:1,use:{baseURL:'http://127.0.0.1:8080',browserName:'chromium',headless:true},webServer:{command:'node tools/serve.mjs',url:'http://127.0.0.1:8080',reuseExistingServer:false},reporter:[['list'],['html',{open:'never'}]]});
