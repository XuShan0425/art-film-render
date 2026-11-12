# 云端渲染（GitHub Actions）

本机只负责用 `npm run dev` 开 Studio 调动画；成片交给 GitHub 的免费 Linux 机器跑。

## 一次性准备（约 5 分钟）

1. 在 GitHub 网页新建一个 **Public** 仓库（例如 `art-film-render`）。
   - 必须是 Public：Public 仓库的标准 Runner 免费且不限分钟数；Private 仓库要计费。
2. 本地仓库已经初始化好并提交过一次（`git log` 能看到 init 提交）。推送时把 `你的用户名` 换成自己的：

```bash
cd H:/ARCHIVE/art-film-2026-11-12
git remote add origin https://github.com/你的用户名/art-film-render.git
git branch -M main
git push -u origin main
```

3. 有素材（`public/footage/*.mp4`）要一起上云时：
   ```bash
   git add -f public/footage
   git commit -m "add footage"
   git push
   ```
   （如果素材总体积很大，改用下面的「素材走 Release」方案，别塞进 git 历史。）

## 每次渲染

1. 本地改完动画 → 提交并推送：
   ```bash
   git add -A && git commit -m "tweak" && git push
   ```
   push 不会自动渲染（workflow 里 `Render` 那步限定只在手动触发时跑），避免每推一次就烧一次机器。
2. 打开仓库 → **Actions** → 左侧 **Render video** → 右上 **Run workflow**：
   - `composition`：`Film`（1920×1080，30fps，31 秒）或 `Chroma`（1080×1920，60 秒）
   - `concurrency`：默认 3；如果日志里出现渲染进程被杀 / 内存报错，改成 2 重跑
3. 跑完在该次运行页面底部 **Artifacts → render-output** 下载 MP4（保留 3 天）。

## 工作流做了什么

`.github/workflows/render.yml`：

- `ubuntu-latest`：Linux x64，4 vCPU / 16 GB RAM / 14 GB SSD（Public 仓库规格）
- `timeout-minutes: 55`：超过自动判失败，防止忘记取消一直占着任务
- `concurrency: render-video`：同一时间只跑一个渲染
- `npm ci` + `actions/setup-node` 的 npm 缓存 + `node_modules/.remotion` 浏览器缓存（省掉每次重下 Chrome Headless Shell）
- `npx remotion render src/index.ts <composition> out/video.mp4 --concurrency=N`
- `actions/upload-artifact@v4` 把 MP4 作为 Artifact 上传

## 已知限制 / 踩坑

- **Public 仓库 = 代码和素材公开可见**，里面有你的素材与音频时先确认能不能公开。
- **14 GB 磁盘**：`node_modules` + public 素材 + 渲染中间帧都在这 14 GB 里；4K 长片或大素材会撞上限。
- **输出走 Artifact，有总量配额**：单个 Artifact 最大 500 MB（超过会被拒），整个账号 Artifact 存储 500 MB（GitHub Free）。一次输出 100 MB 左右没事，但别把每次的成片都长期堆着——workflow 里已设 `retention-days: 3`。
- **Artifact 只保留 3 天**，过期就没了；重要成片自己下载完存本地或补传网盘。
- **单任务 6 小时上限**（GitHub 硬限制）；长片靠 `--concurrency` 提速度，不是无限跑。
- **没有 GPU**：Remotion 走 CPU 渲染，本机 5500U 用同样 `--concurrency=3` 和它差不太多，主要赚在"不占自己的内存和风扇"。
- **Remotion 商业许可**：个人或 ≤3 人公司免费；对外接单成规模时看 `remotion.dev/license`。

## 素材走 GitHub Release（仓库大了再用）

```bash
# 本地压缩素材，避免 >100MB 单文件
tar -cf footage.tar public/footage
gh release create footage-v1 footage.tar
```
然后在 workflow 的 `npm ci` 后加一步下载并解包到 `public/footage`。仓库只留代码，git 历史保持小而快。
