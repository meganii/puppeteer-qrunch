# puppeteer-qrunch

Markdownファイルを読み取り、[Qrunch](https://qrunch.net/)へ自動投稿する`puppeteer`スクリプトです。
「下書き保存」まで実行するので、内容確認して投稿してください。

環境に応じて以下の点修正してください。

- Blog URL / ID & PW
- Chromeのパス
- `canonical_url`のURL形式


## 注意

以下の通り、textContentでMarkdownを設定するとPreviewが効かないので、一度「本文」に対して何らかの修正（改行するなど）を行う必要があります。
（原因調査中）

```js
await page.evaluate( (markdown) => {
    document.querySelector('#edit-box').textContent = markdown;
  }, markdown);
```

## 使い方

```
npx ts-node index.ts /path/to/file.md
```