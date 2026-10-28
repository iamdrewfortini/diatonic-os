import {defineConfig} from '@playwright/test';
const baseURL = process.env.SHOWCASE_URL;
if (!baseURL) throw new Error('SHOWCASE_URL is required');
const url = new URL(baseURL);
if (url.protocol !== 'https:' || url.username || url.password || url.port || !(/^[a-z0-9-]+\.trycloudflare\.com$/.test(url.hostname) || url.hostname === 'diatonic-os.chromatixstudios.com')) throw new Error('Expected the public Diatonic showcase HTTPS endpoint');
export default defineConfig({testDir:'tests',testMatch:'browser.spec.mjs',workers:1,use:{baseURL:url.origin,browserName:'chromium',headless:true},reporter:[['list'],['html',{open:'never'}]]});
