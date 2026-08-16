# 数智观险智能风控平台 — GitHub Pages 版

本目录可直接上传到 GitHub 仓库根目录，并通过 GitHub Pages 发布。

## 必须上传的内容

- `index.html`：网站首页（正确扩展名是 `.html`，不是 `.hmtl`）。
- `assets/`：页面样式与交互脚本。
- `logos/`：企业 Logo；图片不可用时页面自动显示企业首字。
- `brand-logo.png`：数智观险平台 Logo。
- `compute-city.png`：入口页算力科技城市主视觉。
- `favicon-64.png`、`favicon.svg`：浏览器图标。
- `.nojekyll`：避免 GitHub Pages 对静态资源做额外处理。

不要只上传 `index.html`，否则样式、交互和图片无法正常显示。

## GitHub Pages 发布步骤

1. 在 GitHub 新建一个公开仓库。
2. 将本目录内的全部文件和文件夹上传到仓库根目录，确认 `index.html` 位于最外层。
3. 打开仓库的 `Settings` → `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/ (root)`，然后点击 `Save`。
6. 等待 GitHub 完成部署，页面上会显示网站访问地址。

网站资源全部采用相对路径，因此既支持 `用户名.github.io/仓库名/`，也支持自定义域名。

## 本地预览

可以用 VS Code 的 Live Server 打开；也可以在本目录运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

## 版本说明

- 已移除30秒评审演示及自动跳页逻辑。
- 保留科技城市入口、加载动画、评审/企业双模式、算力产业链风险图谱、80家企业画像、NLP证据中心、风险自测和报告导出。
