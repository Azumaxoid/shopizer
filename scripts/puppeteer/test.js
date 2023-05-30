
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
        await page.goto(URL);
        await page.click('.account-setting-active')
        await page.click('[href="/register"]')
        await typeText('[name="email"]', "test@nrkk.technology")
        await typeText('[name="password"]', "p@55w0rd")
        await typeText('[name="repeatPassword"]', "p@55w0rd")
        await typeText('[name="firstName"]', "taro")
        await typeText('[name="lastName"]', "taro")
        await typeText('.login-input select:nth-child(1)', "CA")
        await typeText('.login-input:nth-child(9) select', "QC")
        await page.click('[role="tabpanel"]:nth-child(2) [type="submit"]')
        await page.click('[href="/category/tables"]')
        await moveTo('[title="Add to cart"]')
        await page.click('[title="Add to cart"]')
        await page.click('button.icon-cart')
        await page.click('[href="/cart"]')
        await page.click('[href="/checkout"]')
    }
    for (let i = 0; i < 1000; i++) {
        try {
            await test(users[i % users.length])
        } catch (e) {
            // Do nothing
        } finally {
            await wait(500);
            await page.waitForSelector('.ec-headerNav__item:nth-child(3) a');
            await page.click('.ec-headerNav__item:nth-child(3) a');
        }
    }
    await browser.close();
})();
