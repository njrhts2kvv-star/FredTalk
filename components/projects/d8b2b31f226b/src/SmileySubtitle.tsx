import {approvedStaticFile as staticFile} from '../material-policy';
import {FiveFontFace} from "../five-fonts.ts";
import React, {useLayoutEffect, useRef, useState} from 'react';
import {cancelRender, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

export type SubtitleCue = {startSeconds: number; endSeconds: number; text: string};

export type SmileySubtitleProps = {
  cues: SubtitleCue[];
  /** Supply the film clock when this overlay is mounted inside a Sequence. */
  timeSeconds?: number;
  bottom?: number;
  fontSize?: number;
  maxWidth?: number;
};

const fontFamily = 'FredSmileySans';
let fontPromise: Promise<void> | undefined;

const loadFont = () => fontPromise ?? (fontPromise = (async () => {
  const face = new FiveFontFace(fontFamily, `url(${staticFile('fonts/SmileySans-Oblique.ttf')})`);
  await face.load();
  (document.fonts as FontFaceSet & {add: (font: FontFace) => void}).add(face);
})());

/** 1920 × 1080 design coordinates; mount inside the film's scaled logical canvas. */
export const SmileySubtitle: React.FC<SmileySubtitleProps> = ({
  cues, timeSeconds, bottom = 25.5, fontSize = 47.5, maxWidth = 1720,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = timeSeconds ?? frame / fps;
  const cue = cues.find(({startSeconds, endSeconds}) => time >= startSeconds && time < endSeconds);
  const [ready, setReady] = useState(false);
  const pending = useRef<number | null>(null);

  useLayoutEffect(() => {
    const handle = delayRender('Load project Smiley Sans subtitle font');
    pending.current = handle;
    let active = true;
    loadFont().then(() => { if (active) setReady(true); }).catch(cancelRender);
    return () => { active = false; continueRender(handle); };
  }, []);
  useLayoutEffect(() => {
    if (ready && pending.current !== null) {
      continueRender(pending.current);
      pending.current = null;
    }
  }, [ready]);

  if (!ready || !cue?.text.trim()) return null;

  return <div style={{
    position: 'absolute', left: 0, right: 0, bottom,
    display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 1000,
  }}>
    <div style={{
      boxSizing: 'border-box', minHeight: 101.5, maxWidth,
      padding: '13px 23px', borderRadius: 17,
      background: '#000', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily, fontSize, lineHeight: 1.12, fontWeight: 400,
      textAlign: 'center', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
    }}>{cue.text}</div>
  </div>;
};
