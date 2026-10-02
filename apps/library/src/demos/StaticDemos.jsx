import React from 'react';
import {tokens} from '../tokens.js';
import {SoftSurface} from './vendor/ContentMotion.tsx';
import {Canvas, colors, EXAMPLE_VALUES, LabelSurface, ScaledCanvas, Subtitle, TextFit} from './shared.jsx';

function SurfaceDemo({items, tone, accent}) {
  const theme = colors(tone);
  const rows = items.slice(1);
  return <>
    <LabelSurface box={[180, 70, 600, 100]} text={items[0]} fill={tone === 'dark' ? '#fff' : '#171719'} color={tone === 'dark' ? '#171719' : '#fff'} accent={accent} radius={50} fontSize={48}/>
    <SoftSurface box={[140, 204, 680, 230]} fill={theme.surface} shadow={tokens.shadow.floating} radius={32}>
      <div style={{position: 'absolute', inset: '22px 40px', display: 'grid', gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))`, rowGap: 10}}>
        {rows.map((item, index) => <TextFit key={index} maxSize={index === 0 ? 43 : 31} minSize={27} color={index === 0 ? theme.ink : theme.muted}>{item}</TextFit>)}
      </div>
    </SoftSurface>
  </>;
}

function TypographyDemo({items, tone, accent}) {
  const theme = colors(tone);
  const dense = items.length > 3;
  return <>
    <div style={{position: 'absolute', left: 106, top: dense ? 52 : 78, width: 748, height: 128}}><TextFit maxSize={68} minSize={42} color={accent ? theme.accent : theme.ink} align="left" weight={750}>{items[0]}</TextFit></div>
    <div style={{position: 'absolute', left: 108, top: dense ? 192 : 238, width: 744, height: 72}}><TextFit maxSize={44} minSize={32} align="left">{items[1]}</TextFit></div>
    {items.slice(2).map((item, index) => <div key={index} style={{position: 'absolute', left: 108, top: (dense ? 278 : 332) + index * 54, width: 744, height: 46}}><TextFit maxSize={31} minSize={27} color={theme.muted} align="left" weight={500}>{item}</TextFit></div>)}
  </>;
}

function TableDemo({items, tone, accent}) {
  const theme = colors(tone);
  const rowHeight = 58;
  const selected = Math.min(2, items.length - 1);
  return <SoftSurface box={[100, 65, 760, 375]} fill={theme.surface} radius={30} shadow={tokens.shadow.surface}>
    <div style={{position: 'absolute', inset: '24px 32px'}}>
      <div style={{height: 40, display: 'grid', gridTemplateColumns: '1fr 150px', gap: 28, fontSize: 23, color: theme.muted, fontWeight: 500}}><span>内容</span><span style={{textAlign: 'right'}}>示例值</span></div>
      {items.map((item, index) => <div key={index} style={{height: rowHeight, padding: '6px 14px', margin: '0 -14px', borderRadius: 14, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 150px', gap: 28, background: index === selected ? theme.soft : 'transparent'}}>
        <TextFit maxSize={32} minSize={27} align="left">{item}</TextFit>
        <div style={{alignSelf: 'center', textAlign: 'right', fontSize: 36, fontVariantNumeric: 'tabular-nums', color: accent && index === selected ? theme.accent : theme.ink}}>{EXAMPLE_VALUES[index]}<span style={{fontSize: 24, marginLeft: 4, fontWeight: 500}}>%</span></div>
      </div>)}
    </div>
  </SoftSurface>;
}

function ChartDemo({items, tone, accent}) {
  const theme = colors(tone);
  const selected = Math.min(2, items.length - 1);
  const rowHeight = items.length > 4 ? 63 : 74;
  const plotHeight = items.length * rowHeight;
  const top = 74 + (350 - plotHeight) / 2;
  return <>
    {items.map((item, index) => <div key={index} style={{position: 'absolute', left: 82, right: 76, top: top + index * rowHeight, height: rowHeight - 14, display: 'grid', gridTemplateColumns: '260px 1fr 75px', columnGap: 25, alignItems: 'center'}}>
      <TextFit maxSize={30} minSize={26} align="left">{item}</TextFit>
      <div style={{height: 38, borderRadius: 12, background: theme.soft, overflow: 'hidden'}}><div style={{height: '100%', width: `${EXAMPLE_VALUES[index]}%`, borderRadius: 12, background: accent && index === selected ? theme.accent : theme.ink}}/></div>
      <div style={{textAlign: 'right', fontSize: 32, fontVariantNumeric: 'tabular-nums'}}>{EXAMPLE_VALUES[index]}<span style={{fontSize: 20}}>%</span></div>
    </div>)}
  </>;
}

const SCENES = {surface: SurfaceDemo, typography: TypographyDemo, table: TableDemo, chart: ChartDemo};
const LABELS = {surface: '黑白承载面示例', typography: '主次文字层级示例', table: '表格示例，数据为演示值', chart: '条形图示例，数据为演示值'};

export default function StaticDemos({kind, items, tone, accent, showSubtitle}) {
  const Scene = SCENES[kind] || SurfaceDemo;
  return <ScaledCanvas label={LABELS[kind]}><Canvas tone={tone}><Scene items={items} tone={tone} accent={accent}/><Subtitle visible={showSubtitle}/></Canvas></ScaledCanvas>;
}
