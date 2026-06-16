# 自訂圖片存放專區 (Custom Images Directory)

請在此資料夾放入您需要在網頁中引用的圖片檔案（例如：`.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif` 等格式）。

## 如何在專案中引用圖片

放入此資料夾的圖片會被 Vite 直接對應到網站的根目錄 `/images/`。例如您放入一張名為 `hero.png` 的圖片，可以在 JSX 中這樣引用它：

```tsx
<img 
  src="/images/hero.png" 
  alt="Hero Image" 
  referrerPolicy="no-referrer" 
  className="w-full h-auto rounded-xl"
/>
```

或者在 CSS 背景圖片中引用：

```css
.card-bg {
  background-image: url('/images/hero.png');
}
```
