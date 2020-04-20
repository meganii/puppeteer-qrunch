import * as puppeteer from 'puppeteer-core';
import * as program from 'commander';
import * as fs from 'fs';
import * as fm from 'front-matter';
import * as df from 'dateformat';

// Blog URL / ID & PW for Qrunch
const BLOG_URL = 'https://www.meganii.com/';
const QRUNCH_ID = process.env.QRUNCH_ID;
const QRUNCH_PW = process.env.QRUNCH_PW;

// Parse argument
program.parse(process.argv);

// Read Markdown file
const filepath = program.args[0];
const data = fs.readFileSync(filepath, {encoding: 'utf8'});

// Read Frontmatter and body
const content = fm(data);
const title = content.attributes['title'];
const slug = content.attributes['slug']
const date = content.attributes['date']
const body = content.body;
const dateformat  = df(new Date(date), 'yyyy/mm/dd');

// Replace specific tags like Shortcodes for Hugo
let markdown = body.replace(/\{\{\% img src="(.+?)".*\%\}\}/g, '![]($1)');
markdown = markdown.replace(/\{\{\% googleadsense \%\}\}/, '');
markdown = markdown.replace(/\{\{\% toc \%\}\}/, '');

// Post to Qrunch with puppeteer 
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.setViewport({ width: 1280, height: 800 });
  
  // Login to Qrunch
  console.log('start login');
  await page.goto('https://qrunch.net/login');
  await page.type('#login_user_email', QRUNCH_ID);
  await page.type('#login_user_password', QRUNCH_PW);
  await page.click('input[type=submit]');
  await page.waitFor(3000);
  console.log('end login');

  // Edit new post
  console.log('start posting');
  await page.goto('https://qrunch.net/dashboard/entries/edit');
  await page.type('#entry-title', title);
  // await page.type('#edit-box', markdown); // Too slow by `page.type` method.
  // TODO If you do the following way, you will need to edit the text area after saving.
  await page.evaluate( (markdown) => {
    document.querySelector('#edit-box').textContent = markdown;
  }, markdown);
  
  await page.type('input[name=canonical_url]', `${BLOG_URL}blog/${dateformat}/${slug}/`);
  await page.click('#submit-button-icon');
  await page.click('div[mode="draft"].submit-mode-child');
  await page.click('#submit-button-icon');
  await page.click('#submit-button-text');
  console.log('end posting');
  
  await page.screenshot({path: 'result.png'});
  // await page.waitFor(10000);

  await browser.close();
})();