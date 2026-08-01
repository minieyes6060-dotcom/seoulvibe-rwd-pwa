# SEOUL VIBE | RWD + PWA 版本

本專案已在原始 `index.html` 基礎上，加入完整的**響應式設計（RWD）**強化與**漸進式網頁應用程式（PWA）**功能。

## 📁 檔案結構

```
seoulvibe/
├── index.html          # 主頁面（已加入 PWA meta 標籤、行動選單、搜尋、分類篩選）
├── manifest.json        # PWA Web App Manifest
├── service-worker.js    # Service Worker（快取策略、離線支援）
├── offline.html          # 離線時的後備頁面
├── icons/                # PWA 圖示（各尺寸）
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-512-maskable.png
│   ├── apple-touch-icon.png
│   ├── favicon-32.png
│   └── favicon-16.png
└── README.md
```

## ✅ 這次調整了什麼

### RWD（響應式設計）
- 修復原本**沒有作用的漢堡選單**：新增行動版側邊抽屜選單（分類導覽、客服資訊）。
- 新增可展開/收合的**搜尋列**，並實作即時商品搜尋（比對商品名稱與描述）。
- 讓原本僅是裝飾的「All / Tops / Dresses / Outerwear / Accessories」分類列**實際可篩選商品**，桌機與手機選單狀態同步。
- 補上無搜尋/篩選結果時的空狀態畫面。
- 針對 iOS 瀏海與手勢列裝置加入 `env(safe-area-inset-*)` 安全區域邊距，避免內容被系統 UI 遮擋（尤其在「加入主畫面」全螢幕模式下）。
- `viewport` 加入 `viewport-fit=cover`，讓頁面能延伸至安全區域邊緣並自行處理留白。

### PWA（漸進式網頁應用程式）
- 新增 `manifest.json`：定義 App 名稱、圖示、`theme_color`、`background_color`、`display: standalone` 等，讓網站可被「加入主畫面」並以類原生 App 外觀啟動。
- 新增 `service-worker.js`：
  - 安裝時預先快取 App Shell（HTML、manifest、圖示）。
  - 頁面導覽採 **Network First**，離線時自動顯示 `offline.html`。
  - 其他靜態資源（字型、CDN 腳本等）採 **Stale-While-Revalidate**，加速重複造訪並支援離線瀏覽。
  - **不快取** Supabase 訂單寫入與 GA4 追蹤請求，確保資料即時性與正確性。
- 新增各尺寸 App 圖示（含 Android maskable 圖示與 iOS `apple-touch-icon`）。
- 新增自訂「加入主畫面」安裝提示橫幅（監聽 `beforeinstallprompt`）。
- 加入 iOS Safari 專屬 PWA meta 標籤（`apple-mobile-web-app-capable` 等）。

## 🚀 如何測試

PWA 功能（Service Worker）**必須透過 HTTP(S) 伺服器**執行，無法直接以 `file://` 開啟測試。

### 本機測試（以 Python 為例）
```bash
cd seoulvibe
python3 -m http.server 8080
```
接著開啟瀏覽器造訪 `http://localhost:8080`。

### 部署上線
將整個資料夾內容部署到任何支援靜態網站的主機（GitHub Pages、Netlify、Vercel、Firebase Hosting 等）即可，**務必使用 HTTPS**（PWA 的必要條件，localhost 除外）。

### 驗證 PWA
1. 用 Chrome 開啟網站 → 開發者工具 → Application 分頁 → 確認 Manifest 與 Service Worker 皆正常註冊。
2. 網址列右側應出現「安裝」圖示，或頁面下方會彈出安裝提示橫幅。
3. 安裝後關閉網路，重新開啟 App，應仍可瀏覽已快取過的頁面（並在完全離線且無快取頁面時顯示 `offline.html`）。

## ⚠️ 注意事項
- `manifest.json` 與 `service-worker.js` 使用相對路徑，若部署到子路徑（例如 `https://example.com/shop/`），請確認整體資料夾結構維持不變即可正常運作。
- 若日後更新網站內容，記得修改 `service-worker.js` 中的 `CACHE_VERSION`，以觸發用戶端更新快取。
- Supabase 金鑰與資料表設定沿用原始檔案設定，未做變動。
