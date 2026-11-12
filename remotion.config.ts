/**
 * Remotion CLI 配置
 * 说明：不要在这里写死本机浏览器路径（Config.setBrowserExecutable），
 * 否则同一份代码在 GitHub Actions 的 Linux 上会直接找不到 Chrome 而失败。
 * 本地想省事可在 .env 里设 REMOTION_BROWSER_EXECUTABLE，见 .env.example。
 */
import { Config } from '@remotion/cli/config';

if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}

// 渲染并发：命令行 --concurrency 优先；这里给默认值，4 核机器 3 比较稳
Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY ?? 3));

// 以下为画面/编码默认值（与之前本机渲染一致）
Config.setChromeMode('headless-shell');
Config.setVideoImageFormat('jpeg');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
