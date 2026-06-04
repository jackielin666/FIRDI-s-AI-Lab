# 水果削皮步留率分析系統 (FIRDI-s AI Lab)

互動式製程分析儀表板，分析水果削皮加工的步留率（得率）、耗損結構、班別效率與 ROI。

🔗 **線上展示：** https://jackielin666.github.io/FIRDI-s-AI-Lab/

## 功能

- **處理流程工法拆解** — 製程流程圖 + 動態質流模擬器（選水果、拉投入重量看果皮/不良品/成品分布）
- **步留與耗損分析** — 各水果步留率對比、耗損光譜、1000 筆批次明細表
- **處理人員效率評量** — 三班別績效卡 + 各水果步留率比較
- **精進策略與建議報告** — ROI 收益模擬器 + 可列印改善建議報告

## 資料

來源：`ING-002_1000筆原料步留率模擬資料.csv`（1000 筆，6 種水果，3 個班別，2026-01～05）。
由 `src/data.ts` 解析載入。

## 技術

React + TypeScript + Vite + Tailwind CSS + Recharts + Motion。

## 本地開發

```bash
npm install
npm run dev      # 本地預覽
npm run build    # 產出 dist/
```

## 部署

push 到 `main` 後，由 `.github/workflows/deploy.yml` 自動 build 並發佈到 GitHub Pages。
