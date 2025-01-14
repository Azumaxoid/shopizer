
'use strict';

const puppeteer = require('puppeteer');
const users = require('./users.json');
const HOST = process.env.HOST || 'localhost'
const URL = `http://${HOST}:3000`;
const HEADLESS = process.env.HEADLESS === 'false' ? false : 'new';

(async() => {
    const browser = await puppeteer.launch({
        headless: HEADLESS,
        slowMo: 50,
        args: ['--lang=ja', '--no-sandbox', '--disabled-setuid-sandbox', `--window-size=1200,1000`]  // デフォルトでは言語設定が英語なので日本語に変更
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1000, deviceScaleFactor: 1, });

    let haveError = 'new';
    page.on('dialog', async dialog => {
        haveError = true;
        dialog.accept(); // OK
    });
    const wait = async (time) => {
        return new Promise((res) => {
            setTimeout(() => {
                res()
            }, time)
        })
    }
    const clear = async (page, selector) => {
        await page.evaluate(selector => {
            document.querySelector(selector).value = "";
        }, selector);
    };

    const typeText = async (selector, value) => {
        await page.$eval(selector, element => element.value = '');
        await page.type(selector, value)
    }

    const moveTo = async (selector) => {
        const buttonElement = await page.$(selector)
        const boundingBox = await buttonElement.boundingBox()
        await page.mouse.move(boundingBox.x, boundingBox.y)
    }

    const test = async (user) => {
        console.log(`User: ${user.email} Password: p@55w0rd`)
        await page.goto(URL);
        await page.waitForSelector('.account-setting-active', {visible: true});
        await wait(1000)
        await page.click('.account-setting-active')
        await page.waitForSelector('[href="/register"]', {visible: true});
        await page.click('[href="/register"]')
        await page.waitForSelector('[name="email"]', {visible: true});
        await typeText('[name="email"]', user.email)
        await typeText('[name="password"]', "p@55w0rd")
        await typeText('[name="repeatPassword"]', "p@55w0rd")
        await typeText('[name="firstName"]', user.name.split(' ')[1])
        await typeText('[name="lastName"]', user.name.split(' ')[0])
        await typeText('.login-input select:nth-child(1)', "CA")
        await wait(500)
        await typeText('.login-input:nth-child(9) select', "QC")
        await page.click('[role="tabpanel"]:nth-child(2) [type="submit"]')
        await wait(1000)
        await page.waitForSelector('.billing-btn', {visible: true});
        await page.waitForSelector('.account-setting-active', {visible: true});
        await wait(1000)
        await page.click('.account-setting-active')
        await page.waitForSelector('[href="/login"]', {visible: true});
        await page.click('[href="/login"]')
    }
    await page.goto(URL);

    for (let i = 0; i < users.length; i++) {
        try {
            await test(users[i % users.length])
        } catch (e) {
            //console.error(e)
        } finally {
        }
    }
    await browser.close();
})();
