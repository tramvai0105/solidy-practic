const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const { Options } = require('selenium-webdriver/chrome');
const ps = require('./profilesystem');
const args = process.argv.splice(2);

async function main() {
    // console.log(ps);
    const opts = new Options();
    opts.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36")
    opts.addArguments("--load-extension=C:/Users/forth/Desktop/autoswaper/extension/chrome")
    opts.addArguments("--profile-directory=Profile 1")
    opts.addArguments("--user-data-dir=C:/Users/forth/Desktop/autoswaper/userdata")
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
    try {
        await driver.get('chrome-extension://fklgflfcolgnmdhppldccoecjfemffed/home.html');
    //     const metamaskWindow = await driver.getWindowHandle()
    //     await driver.wait(until.elementLocated(By.className("currency-display-component__text")), 100000)
    //     await driver.switchTo().newWindow('tab');
    //     await driver.get('https://fi.woo.org/');
    //     const woofiWindow = await driver.getWindowHandle();
        await driver.sleep(50000);
    } finally {
        await driver.quit();
    }
};

main();