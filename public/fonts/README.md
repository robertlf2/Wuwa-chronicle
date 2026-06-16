# 自訂字體存放區 (Custom Fonts Directory)

請在此資料夾放入您的字體檔案（例如：`.ttf`, `.otf`, `.woff`, `.woff2` 等類型）。

## 如何在專案中引用此字體

放置好字體檔後（例如面名為 `MyCustomFont.ttf` 放置於此），您可以在 `/src/index.css`（或任何您引入 CSS 的位置）中定義 `@font-face`：

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('/fonts/MyCustomFont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

然後直接在 CSS 或者 Tailwind Class 中引用它：

```html
<div style="font-family: 'MyCustomFont'">
  這是自訂字體的文字
</div>
```

或者在 Tailwind `@theme` 中擴充：

```css
@theme {
  --font-custom: "MyCustomFont", sans-serif;
}
```
然後您就能在 JSX 中直接套用 `font-custom` 類別！
