import React, {useCallback, useLayoutEffect, useRef} from 'react';
import {OffthreadVideo} from 'remotion';

export type PlaneMapper = (u: number, v: number, band: number) => {x: number; y: number};
export type MeshVideoProps = {
  src: string;
  map: PlaneMapper;
  columns?: number;
  rows?: number;
  bands?: number;
  glow?: number;
  blur?: number;
  brightness?: number;
  cornerRadius?: number;
  show?: boolean;
  flat?: boolean;
  trimBefore?: number;
};

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 textureUv;
void main() {
  gl_Position = vec4(position.x / 960.0 - 1.0, 1.0 - position.y / 540.0, 0.0, 1.0);
  textureUv = uv;
}`;
const fragmentShader = `
precision mediump float;
uniform sampler2D videoTexture;
uniform float radius;
uniform float brightness;
varying vec2 textureUv;
void main() {
  vec2 p = abs(textureUv * vec2(1920.0,1080.0) - vec2(960.0,540.0)) - (vec2(960.0,540.0) - radius);
  float d = length(max(p,vec2(0.0))) + min(max(p.x,p.y),0.0) - radius;
  float a = radius > 0.0 ? 1.0-smoothstep(-0.7,0.7,d) : 1.0;
  vec4 pixel = texture2D(videoTexture,textureUv);
  gl_FragColor = vec4(pixel.rgb * brightness, pixel.a * a);
}`;

type Renderer = {gl: WebGLRenderingContext; program: WebGLProgram; buffer: WebGLBuffer; texture: WebGLTexture; position: number; uv: number};
function init(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext('webgl', {alpha: true, premultipliedAlpha: false, antialias: true, preserveDrawingBuffer: true});
  if (!gl) throw new Error('WebGL is required to render the video mesh.');
  const shader = (type: number, text: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, text); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'Shader compile failed');
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Shader link failed');
  gl.useProgram(program);
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return {gl, program, texture, buffer: gl.createBuffer()!, position: gl.getAttribLocation(program, 'position'), uv: gl.getAttribLocation(program, 'uv')};
}

/** One continuously decoded video texture; deterministic mesh positions come from the frame clock. */
export function MeshVideo({src, map, columns = 48, rows = 30, bands = 1, glow = 0, blur = 0, brightness = 1, cornerRadius = 0, show = true, flat = false, trimBefore = 0}: MeshVideoProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const currentImage = useRef<CanvasImageSource | null>(null);
  const draw = useRef<() => void>(() => {});
  draw.current = () => {
    if (flat || !canvas.current || !currentImage.current) return;
    const r = renderer.current ??= init(canvas.current);
    const {gl, program} = r;
    const vertices: number[] = [];
    const rowsPerBand = Math.max(2, Math.ceil(rows / bands));
    const add = (u: number, v: number, band: number) => {
      const {x, y} = map(u, v, band);
      vertices.push(x, y, u, v);
    };
    for (let band = 0; band < bands; band++) {
      for (let j = 0; j < rowsPerBand; j++) for (let i = 0; i < columns; i++) {
        const u0 = i / columns, u1 = (i + 1) / columns;
        const v0 = (band + j / rowsPerBand) / bands, v1 = (band + (j + 1) / rowsPerBand) / bands;
        add(u0,v0,band); add(u1,v0,band); add(u0,v1,band);
        add(u1,v0,band); add(u1,v1,band); add(u0,v1,band);
      }
    }
    gl.viewport(0,0,1920,1080);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,r.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(r.position); gl.vertexAttribPointer(r.position,2,gl.FLOAT,false,16,0);
    gl.enableVertexAttribArray(r.uv); gl.vertexAttribPointer(r.uv,2,gl.FLOAT,false,16,8);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,r.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,currentImage.current as TexImageSource);
    gl.uniform1i(gl.getUniformLocation(program,'videoTexture'),0);
    gl.uniform1f(gl.getUniformLocation(program,'radius'),cornerRadius);
    gl.uniform1f(gl.getUniformLocation(program,'brightness'),brightness);
    gl.drawArrays(gl.TRIANGLES,0,vertices.length / 4);
    gl.finish();
  };
  useLayoutEffect(() => { draw.current(); });
  const onVideoFrame = useCallback((image: CanvasImageSource) => {
    currentImage.current = image;
    draw.current();
  }, []);
  useLayoutEffect(() => () => {
    const r = renderer.current;
    if (r) {r.gl.deleteTexture(r.texture); r.gl.deleteBuffer(r.buffer); r.gl.deleteProgram(r.program);}
  }, []);
  return <>
    <OffthreadVideo src={src} trimBefore={trimBefore} muted onVideoFrame={onVideoFrame}
      style={{position:'absolute',inset:0,width:1920,height:1080,objectFit:'cover',opacity:flat ? 1 : 0,pointerEvents:'none'}}/>
    <canvas ref={canvas} width={1920} height={1080} style={{position:'absolute',inset:0,width:1920,height:1080,
      opacity: show && !flat ? 1 : 0,
      filter: `${blur > 0 ? `blur(${blur}px) ` : ''}${glow > 0 ? `drop-shadow(0 0 ${glow}px rgba(255,255,255,.82)) drop-shadow(0 0 ${glow * 2.2}px rgba(255,255,255,.38))` : ''}`.trim() || 'none',
    }}/>
  </>;
}
