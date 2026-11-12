import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

let loaded: Promise<void> | null = null;

// 字体加载策略：
// 1) 优先用 public/fonts/notoserifsc.css 里的 woff2 子集（体积小，本机沙箱渲染更稳）
// 2) 失败再退回 25MB 可变字体整包（只在存在时有用；仓库里不放这个文件）
// 3) 全部失败也不阻塞渲染，CSS 里的 font-family 会自然回退到系统衬线体
const load = () => {
  if (loaded) return loaded;
  loaded = new Promise<void>((resolve) => {
    const tryLoad = (src: string) =>
      new FontFace('NotoSerifSCVF', src, { weight: '100 900' })
        .load()
        .then((f) => document.fonts.add(f));

    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/fonts/notoserifsc.css';
    document.head.appendChild(css);

    Promise.all([
      tryLoad("url(/fonts/nssc-111.woff2)"),
      tryLoad("url(/fonts/nssc-113.woff2)"),
      tryLoad("url(/fonts/nssc-114.woff2)"),
    ])
      .catch(() => tryLoad("url('/fonts/NotoSerifSC-VF.ttf')"))
      .catch(() => undefined)
      .then(() => resolve());
  });
  return loaded;
};

export const useFilmFonts = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const h = delayRender('film-fonts');
    load().then(() => { setReady(true); continueRender(h); });
  }, []);
  return ready;
};
