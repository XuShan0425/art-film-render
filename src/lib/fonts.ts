import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

let loaded: Promise<void> | null = null;
const load = () => {
  if (loaded) return loaded;
  loaded = new Promise<void>((resolve) => {
    // 注意：文件名是 25MB 的可变字体，静态托管服务对超大文件容易中断；
    // 优先加载切分后的 woff2 子集（public/fonts/notoserifsc.css），失败再回退整包，最后回退系统衬线体。
    const tryLoad = (src: string) =>
      new FontFace('NotoSerifSCVF', src, { weight: '100 900' }).load().then((f) => document.fonts.add(f));
    tryLoad("url(/fonts/nssc-111.woff2)")
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
