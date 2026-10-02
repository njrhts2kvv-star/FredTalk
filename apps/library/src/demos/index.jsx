import React, {lazy, Suspense, useLayoutEffect, useRef, useState} from 'react';
import StaticDemos from './StaticDemos.jsx';
import {demoItems} from './shared.jsx';

const AnimatedStage = lazy(() => import('./AnimatedStage.jsx'));
const ANIMATED = new Set(['relay', 'focus', 'handoff']);

export function DemoStage({kind = 'surface', text, count = 3, tone = 'light', accent = false, showSubtitle = false}) {
  const stage = useRef(null);
  const [overflow, setOverflow] = useState(false);
  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return undefined;
    const check = () => setOverflow(Boolean(node.querySelector('[data-demo-text][data-overflow="true"]')));
    const observer = new MutationObserver(check);
    observer.observe(node, {subtree: true, childList: true, attributes: true, attributeFilter: ['data-overflow']});
    check();
    return () => observer.disconnect();
  }, []);
  const props = {kind, items: demoItems(text, count), tone: tone === 'dark' ? 'dark' : 'light', accent: Boolean(accent), showSubtitle: Boolean(showSubtitle)};
  return <div ref={stage} style={{width: '100%'}}>
    {!ANIMATED.has(kind) ? <StaticDemos {...props}/> : <Suspense fallback={<div style={{width: '100%', aspectRatio: '16 / 9', background: props.tone === 'dark' ? '#000' : '#fff', display: 'grid', placeItems: 'center'}}>加载动态示例…</div>}><AnimatedStage {...props}/></Suspense>}
    {overflow && <p data-demo-overflow-note role="status" style={{margin: 0, padding: '12px 16px', background: props.tone === 'dark' ? '#000' : '#fff', color: props.tone === 'dark' ? '#fff' : '#111', fontSize: 14, lineHeight: 1.5}}>部分文案超出当前模块的阅读容量，已显示拆分提示。请缩短单项或分段呈现；原文保留在输入框和提示的完整说明中。</p>}
  </div>;
}

const DESCRIPTIONS = {
  surface: '本站新建演示，实际调用 SoftSurface，内容与承载面分开。黑白填充、圆角与阴影可组合；此示例不是历史成片的认可场景实现。',
  typography: '本站新建演示。主句、补充与次要信息有不同层级；文本先换行，再在有下限的阅读槽位内测量字号。仍放不下时明确提示拆分，长段落不会无限缩小或冲出容器。整体缩放不能代替内容适配。',
  table: '本站新建表格演示，38、58、82、65、91 均为示意百分比。这里展示明确的列与对齐关系，没有冒充现成的通用数据表组件。',
  chart: '本站新建条形图演示，全部数字为示意数据，所有条形共用 0–100% 尺度。紫色仅标出当前比较项。',
  relay: '本站新建 Remotion 演示，实际调用 SoftSurface。每项先稳定阅读，随后文字与承载面一起缩小让位；下一项接管阅读区。时间来自 useCurrentFrame / fps；未声称历史动态一致或用户批准。',
  focus: '本站新建 Remotion 演示，实际调用 FrostedFocus。原材料始终保留，背景、黑白蒙版与清晰结论分层；结束后恢复原材料。字幕在失焦层之外。',
  handoff: '本站新建 Remotion 演示，实际调用 ObjectHandoff。同一承载面在两个位置之间移动，并在移动时间窗内替换内容；不是淡出整页再切换下一页。',
};

export const DEMO_NOTES = Object.fromEntries(Object.entries(DESCRIPTIONS).map(([kind, description]) => [kind, `${description} 字幕开关展示正式横版字幕的半尺寸几何，仅供避让参考，不包含音频 cue 实现。`]));

export const DEMO_CODE = {
  surface: `<SoftSurface\n  box={[140, 204, 680, 230]}\n  fill="#ffffff"\n  radius={32}\n  shadow={tokens.shadow.floating}\n>\n  <div style={{position: 'absolute', inset: '22px 40px'}}>\n    {content}\n  </div>\n</SoftSurface>`,
  typography: `<TextFit\n  maxSize={68}\n  minSize={42}\n  align="left"\n  weight={750}\n>\n  {items[0]}\n</TextFit>\n// TextFit is local to this design-site demo.\n// Group long copy before lowering the reading size.`,
  table: `const exampleValues = [38, 58, 82, 65, 91];\n// Illustrative percentages, not measured results.\n<div style={{\n  display: 'grid',\n  gridTemplateColumns: 'minmax(0, 1fr) 150px',\n  gap: 28\n}}>\n  <TextFit maxSize={32} minSize={27} align="left">\n    {item}\n  </TextFit>\n  <span>{exampleValues[index]}%</span>\n</div>`,
  chart: `const exampleValues = [38, 58, 82, 65, 91];\nconst selected = Math.min(2, items.length - 1);\n// All bars share a 0–100% scale.\n<div style={{height: 38, background: theme.soft}}>\n  <div style={{\n    height: '100%',\n    width: exampleValues[index] + '%',\n    background: accent && index === selected\n      ? theme.accent : theme.ink\n  }}/>\n</div>`,
  relay: `const time = useCurrentFrame() / useVideoConfig().fps;\nconst yields = phase(time, yieldAt, yieldAt + 0.65);\n<div style={{\n  transform: 'scale(' + (1 - 0.48 * yields) + ')',\n  transformOrigin: 'top left'\n}}>\n  <LabelSurface\n    box={[0, 0, 680, 164]}\n    text={item}\n    fontSize={55}\n    minSize={36}\n  />\n</div>\n// LabelSurface composes the real SoftSurface.`,
  focus: `<FrostedFocus\n  background={background}\n  foreground={foreground}\n  progress={progress}\n  tone={tone}\n  blur={16}\n  tintOpacity={tone === 'dark' ? 0.42 : 0.48}\n/>\n// Keep mounted. Fade the foreground with progress.\n// The subtitle stays outside all blur layers.`,
  handoff: `<ObjectHandoff\n  time={localTime}\n  from={from}\n  to={to}\n  travel={[0.6, 1.7]}\n  swap={[0.9, 1.45]}\n  before={content(items[segment], false)}\n  after={content(items[segment + 1], isResult)}\n/>\n// Swap lies inside the movement interval.`,
};
