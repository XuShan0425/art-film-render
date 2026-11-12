import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing, Sequence} from 'remotion';
import {C} from '../lib/ui';
import {Audio} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const W = 1080, H = 1920;
const B = {red: '#D6272C', yellow: '#F2C213', blue: '#1F5CB4', black: '#101010', paper: '#EFE8D8', white: '#FFFFFF'};
const HUE12 = ['#F2C213','#E39A1F','#D9691F','#D6272C','#B02B57','#7B3A8E','#4B3FA0','#2F5BB7','#2E8C9E','#2E9E62','#7FA92A','#C3B32B'];
const mono: React.CSSProperties = {fontFamily: 'Cascadia Mono, Consolas, monospace'};
const ease = Easing.bezier(0.22, 0.61, 0.16, 1);
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// ── 段落表 ──
const S = {
  grid:  [0, 240],
  wheel: [240, 480],
  shot1: [480, 660],
  read:  [660, 840],
  shot2: [840, 1000],
  collapse: [1000, 1080],
  shot3: [1080, 1260],
  shot4: [1260, 1440],
  grid2: [1440, 1680],
  end:   [1680, 1800],
};

const Grid: React.FC<{a: number; step?: number; color?: string}> = ({a, step = 60, color = '#fff'}) => {
  const l = [];
  for (let x = 0; x <= W; x += step) l.push(<line key={'v'+x} x1={x} y1={0} x2={x} y2={H} />);
  for (let y = 0; y <= H; y += step) l.push(<line key={'h'+y} x1={0} y1={y} x2={W} y2={y} />);
  return <svg width={W} height={H} style={{position:'absolute',inset:0,opacity:a*0.13}}><g stroke={color} strokeWidth={1}>{l}</g></svg>;
};

const Wheel: React.FC<{cx:number;cy:number;r:number;grow:number;spin:number;labelA:number;lit:number}> = ({cx,cy,r,grow,spin,labelA,lit}) => {
  const seg = (Math.PI*2)/12;
  return (
    <svg width={W} height={H} style={{position:'absolute',inset:0}}>
      <g transform={'rotate('+spin+' '+cx+' '+cy+')'}>
        {HUE12.map((c,i)=>{
          const a0=i*seg-Math.PI/2, a1=a0+seg, rr=r*grow, inner=r*0.42*grow;
          const p0=[cx+Math.cos(a0)*rr, cy+Math.sin(a0)*rr], p1=[cx+Math.cos(a1)*rr, cy+Math.sin(a1)*rr];
          const q0=[cx+Math.cos(a1)*inner, cy+Math.sin(a1)*inner], q1=[cx+Math.cos(a0)*inner, cy+Math.sin(a0)*inner];
          const mid=(a0+a1)/2;
          const on = interpolate(lit, [i*0.06, i*0.06+0.12], [0,1], clamp);
          return (
            <g key={i} opacity={0.25 + 0.75*on}>
              <path d={'M'+p0.join(' ')+' A'+rr+' '+rr+' 0 0 1 '+p1.join(' ')+' L'+q0.join(' ')+' A'+inner+' '+inner+' 0 0 0 '+q1.join(' ')+' Z'} fill={c}/>
              {labelA>0.01 && <text x={cx+Math.cos(mid)*(rr+32)} y={cy+Math.sin(mid)*(rr+32)} fill="#fff" opacity={labelA*0.75}
                style={{...mono,fontSize:15,letterSpacing:'0.2em'}} textAnchor="middle">{(i*30).toString().padStart(3,'0')}</text>}
            </g>
          );
        })}
      </g>
      <circle cx={cx} cy={cy} r={r*0.42*grow} fill="none" stroke="#fff" strokeOpacity={0.45} strokeWidth={1.5}/>
    </svg>
  );
};

const Shot: React.FC<{src:string; from:number; a:number; scale:number; tint?:string; tintA?:number}> = ({src,from,a,scale,tint='#000',tintA=0}) => (
  <AbsoluteFill style={{opacity:a}}>
    <AbsoluteFill style={{transform:'scale('+scale+')'}}>
      <OffthreadVideo src={staticFile(src)} startFrom={from} muted style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    </AbsoluteFill>
    {tintA>0 && <AbsoluteFill style={{background:tint,opacity:tintA,mixBlendMode:'multiply'}}/>}
  </AbsoluteFill>
);

const Label: React.FC<{text:string;x:number;y:number;a:number;size?:number;color?:string;ls?:string}> = ({text,x,y,a,size=15,color='#fff',ls='0.34em'}) => (
  <div style={{position:'absolute',left:x,top:y,opacity:a,color,fontSize:size,letterSpacing:ls,...mono}}>{text}</div>
);

const Big: React.FC<{text:string;x:number;y:number;size:number;a:number;color?:string;weight?:number}> = ({text,x,y,size,a,color=B.paper,weight=560}) => (
  <div className="serif" style={{position:'absolute',left:x,top:y,opacity:a,color,fontSize:size,fontWeight:weight,lineHeight:0.92,letterSpacing:'-0.02em'}}>{text}</div>
);

const Band: React.FC<{y:number;a:number;h?:number}> = ({y,a,h=10}) => (
  <svg width={W} height={H} style={{position:'absolute',inset:0,opacity:a}}>
    {HUE12.map((c,i)=><rect key={i} x={0} y={y+i*(h+6)} width={W} height={h} fill={c}/>)}
  </svg>
);


const SUBS = [
  {a:60,b:180,t:"颜色不是视觉的偶然。"},
  {a:270,b:390,t:"它先被拆解为波长。"},
  {a:510,b:630,t:"被编号，被赋予精确坐标。"},
  {a:700,b:810,t:"在理性刻度里锚定纯度。"},
  {a:870,b:970,t:"秩序在此建立。"},
  {a:1140,b:1240,t:"当界限重叠，彼此并置。"},
  {a:1470,b:1620,t:"严苛的度量，终成审美。"},
];

const Subs: React.FC<{f:number}> = ({f}) => {
  const cur = SUBS.find((s)=> f>=s.a-4 && f<=s.b+16);
  if (!cur) return null;
  const a = Math.min(1, (f-cur.a+4)/10) * Math.min(1, (cur.b+16-f)/12);
  return (
    <div className="serif" style={{position:'absolute',left:0,right:0,bottom:300,textAlign:'center',opacity:a,color:'#F3EDE0',fontSize:38,fontWeight:320,letterSpacing:'0.08em',textShadow:'0 2px 24px rgba(0,0,0,0.55)'}}>{cur.t}</div>
  );
};

export const Chroma: React.FC = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const seg = (k:keyof typeof S, e=ease) => interpolate(f, S[k] as [number,number], [0,1], {...clamp, easing:e});

  // S1 仪器起
  const gridA = interpolate(f,[0,40],[0,1],clamp);
  const grow = interpolate(f,[30,150],[0,1],{...clamp,easing:easeOut});
  const lit = interpolate(f,[90,240],[0,1],clamp);
  const titleA = interpolate(f,[20,80],[0,1],clamp);
  // S2 旋转 + 色带
  const spin = interpolate(f,[S.wheel[0],S.shot2[1]],[0,150],{...clamp,easing:Easing.linear});
  const bandA = interpolate(f,[260,340],[0,1],clamp)*interpolate(f,[S.shot2[0],S.shot2[0]+50],[1,0],clamp);
  // S3 实拍①
  const s1 = interpolate(f,[S.shot1[0],S.shot1[0]+24,S.shot1[1]-24,S.shot1[1]],[0,1,1,0],clamp);
  // S4 读数
  const readA = interpolate(f,[S.read[0],S.read[0]+24],[0,1],clamp)*interpolate(f,[S.read[1]-30,S.read[1]],[1,0],clamp);
  const hexA = Math.floor(interpolate(f,[S.read[0]+10,S.read[1]-30],[0,11],clamp));
  // S5 实拍②
  const s2 = interpolate(f,[S.shot2[0],S.shot2[0]+24,S.shot2[1]-24,S.shot2[1]],[0,1,1,0],clamp);
  // S6 收束
  const col = interpolate(f,[S.collapse[0],1080],[1,0.02],{...clamp,easing:ease});
  const flash = interpolate(f,[1074,1080,1104],[0,1,0],clamp);
  // S7/S8 实拍
  const s3 = interpolate(f,[S.shot3[0],S.shot3[0]+24,S.shot3[1]-24,S.shot3[1]],[0,1,1,0],clamp);
  const s4 = interpolate(f,[S.shot4[0],S.shot4[0]+24,S.shot4[1]-24,S.shot4[1]],[0,1,1,0],clamp);
  // S9 构成
  const g2 = interpolate(f,[S.grid2[0],S.grid2[0]+80],[0,1],{...clamp,easing:easeOut});
  // S10 收尾
  const endA = interpolate(f,[S.end[0],S.end[0]+60],[0,1],clamp);
  const lineH = interpolate(f,[S.end[0]+30,S.end[0]+100],[1,0.004],{...clamp,easing:ease});

  const blocks = [
    {x:0,y:0,w:520,h:430,c:B.red},
    {x:520,y:0,w:560,h:250,c:B.yellow},
    {x:520,y:250,w:210,h:180,c:B.black},
    {x:730,y:250,w:350,h:180,c:B.blue},
    {x:0,y:430,w:300,h:300,c:B.paper},
    {x:300,y:430,w:780,h:300,c:B.blue},
    {x:0,y:730,w:1080,h:190,c:B.red},
  ];

  return (
    <AbsoluteFill style={{background:B.black, overflow:'hidden'}}>
      {/* 实拍层（在文字之下） */}
      <Shot src="footage/paintpour_1.mp4" from={30} a={s1} scale={1.04}/>
      <Shot src="footage/paperswirl_1.mp4" from={20} a={s2} scale={1.02}/>
      <Shot src="footage/pigment_2.mp4" from={10} a={s3} scale={1.03}/>
      <Shot src="footage/fabric_2.mp4" from={40} a={s4*0.8} scale={1.02} tint="#0C1740" tintA={0.35}/>

      {/* 仪器层 */}
      <AbsoluteFill style={{opacity: 1 - Math.max(s1*0.86, s2*0.80, s3*0.84, s4*0.86)}}>
        <Grid a={gridA}/>
        <Wheel cx={540} cy={900} r={430*col} grow={grow} spin={spin} labelA={interpolate(f,[120,200],[0,1],clamp)} lit={lit}/>
        <Band y={(S.wheel[0]+40)} a={bandA}/>
      </AbsoluteFill>

      {/* S9 构成网格 */}
      <svg width={W} height={H} style={{position:'absolute',inset:0,opacity: g2 * (1-endA*0.6)}}>
        {blocks.map((b,i)=>{
          const k = interpolate(g2,[i*0.1,i*0.1+0.3],[0,1],clamp);
          const hh = b.h*lineH*interpolate(g2,[0,0.5],[1,1]);
          return <rect key={i} x={b.x} y={b.y + (b.h-hh)/2} width={b.w*k} height={hh} fill={b.c}/>;
        })}
      </svg>

      {/* 文字层 */}
      <Big text="CHROMA" x={78} y={120} size={128} a={titleA}/>
      <Big text="色彩系统" x={790} y={150} size={46} a={titleA*0.9} weight={300}/>
      <Label text="N-01  ·  12 HUE  ·  ITTEN" x={80} y={286} a={titleA*0.55}/>

      {readA>0.01 && (
        <>
          <Big text={HUE12[hexA]} x={78} y={760} size={0} a={0}/>
          <div style={{position:'absolute',left:78,top:700,opacity:readA,...mono,fontSize:132,color:B.paper,letterSpacing:'-0.04em'}}>{HUE12[hexA].toUpperCase()}</div>
          <Label text={'HEX '+HUE12[hexA].replace('#','')+'   HUE '+(hexA*30).toString().padStart(3,'0')+'°   L 62   S 78'} x={80} y={870} a={readA*0.8}/>
          <div style={{position:'absolute',left:78,top:940,width:520,height:300,background:HUE12[hexA],opacity:readA}}/>
        </>
      )}

      <div style={{position:'absolute',left:0,right:0,bottom:150,textAlign:'center',opacity:endA,...mono,fontSize:16,letterSpacing:'0.6em',color:B.paper}}>A STUDY OF MEASURED COLOR</div>

      <Audio src={staticFile('audio/chroma.wav')} />
      <Subs f={f} />
      {/* 落定白闪 */}
      <AbsoluteFill style={{background:'#fff',opacity:flash*0.92}}/>
      {/* 颗粒 / 暗角 */}
      <AbsoluteFill style={{background:'radial-gradient(62% 50% at 50% 44%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)'}}/>
    </AbsoluteFill>
  );
};
