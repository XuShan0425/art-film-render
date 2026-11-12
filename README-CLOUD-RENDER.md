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
## 实拍素材怎么上云

`public/footage/` 被 `.gitignore` 排除了（58 MB 实拍片段，且素材有版权顾虑），所以云端默认**没有实拍层**：`Chroma` 的四个 `<Shot>` 会整段跳过，只剩 SVG 仪器层和字号动画——能出片，但没实拍。`Film` 不用实拍，不受影响。

要带实拍出片，二选一：

1. **Release 挂素材（推荐，免费、仓库不变胖）**：把 `public/footage/*.mp4` 传到一个 Release，然后在 workflow 的 Render 步骤前加一步 `curl -L -o public/footage/<name>.mp4 <release-url>` 按需下载；再把仓库变量 `REMOTION_HAS_FOOTAGE` 设为 `true`。
2. **直接进仓库**：从 `.gitignore` 删掉 `public/footage/`，`git add` 那 58 MB 素材。公共仓库能放，但每次 checkout 都要下载，习惯上不推荐。

改完把仓库 Settings → Secrets and variables → Actions → Variables 里的 `REMOTION_HAS_FOOTAGE` 设成 `true`，实拍层就会回来。

## 云端专属的坑（本机不报、CI 必炸）

- **不要 import `out/` 里的文件**：`out/` 是构建产物、不在 Git 里。曾经 `src/lib/glyphData.ts` 从 `../../out/glyph-MO.json` 读取，本机没事，CI 打包直接 `Module not found`。数据文件要放 `src/lib/` 下随源码一起提交。
- **不要在 `remotion.config.ts` 写死本机浏览器路径**，Linux Runner 上没有那个 Windows exe。
- 中文字体优先用 `public/fonts/` 下的 woff2 子集，25MB 级可变字体别进仓库。
- 一次成功的日志里会看到 `Encoded 930/930` 和 Artifact `render-output`（本次 15.7 MB，Film 31 秒成片，云端约 2 分 30 秒跑完）。
