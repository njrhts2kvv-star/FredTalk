import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';

// Adapted from the frozen NewsFocus.tsx in interaction-components-20261007.
// Canonical IDs: interaction-news-brush (INT01), interaction-news-spotlight (INT02).
// Source SHA-256: 5f839ff118d1050318f4e4c0ebaab0d20c37459a84762c1f45a7207c5da8da23.
// Only the camera carrier changes: source pixels, reveal direction, aperture,
// multiply treatment and original asymmetric brush corners remain identifiable.
const W = 16, H = 9, PIXEL = W / 1920;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
type AccentProps = {roi: number[]; progress: number; opacity?: number};
type YellowProps = AccentProps & {texture: THREE.Texture};

function sourceBox(roi: number[]) {
  const [x, y, width, height] = roi;
  if (roi.length !== 4 || roi.some((v) => !Number.isFinite(v)) || x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > 1 || y + height > 1) {
    throw new Error('Focus accent requires a valid normalized [x, y, width, height] ROI');
  }
  return {left: (x - .5) * W, top: (.5 - y) * H, width: width * W, height: height * H};
}

// CSS source: border-radius 9px 4px 7px 3px / 4px 7px 3px 6px.
// Apply the CSS overlap reduction so a just-starting wipe keeps its silhouette.
function brushShape(width: number, height: number) {
  const rx = [9, 4, 7, 3].map((v) => v * PIXEL);
  const ry = [4, 7, 3, 6].map((v) => v * PIXEL);
  const factor = Math.min(1, width / (rx[0] + rx[1]), width / (rx[3] + rx[2]), height / (ry[0] + ry[3]), height / (ry[1] + ry[2]));
  const ax = rx.map((v) => v * factor), ay = ry.map((v) => v * factor);
  const shape = new THREE.Shape();
  shape.moveTo(ax[3], 0);
  shape.lineTo(width - ax[2], 0);
  shape.absellipse(width - ax[2], ay[2], ax[2], ay[2], -Math.PI / 2, 0, false, 0);
  shape.lineTo(width, height - ay[1]);
  shape.absellipse(width - ax[1], height - ay[1], ax[1], ay[1], 0, Math.PI / 2, false, 0);
  shape.lineTo(ax[0], height);
  shape.absellipse(ax[0], height - ay[0], ax[0], ay[0], Math.PI / 2, Math.PI, false, 0);
  shape.lineTo(0, ay[3]);
  shape.absellipse(ax[3], ay[3], ax[3], ay[3], Math.PI, Math.PI * 1.5, false, 0);
  shape.closePath();
  return shape;
}

const vertex = `uniform vec2 worldOrigin; varying vec2 sourceUv;
  void main() {
    sourceUv=(position.xy+worldOrigin)/vec2(16.,9.)+.5;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }`;
const fragment = `uniform sampler2D image; uniform vec3 multiplyColor; varying vec2 sourceUv;
  void main() {
    gl_FragColor=vec4(texture2D(image,sourceUv).rgb,1.0);
    #include <colorspace_fragment>
    gl_FragColor.rgb*=multiplyColor;
  }`;

/** INT01: source-left anchored width wipe with multiply color; progress is already eased by the caller. */
export function YellowAccent({texture, roi, progress, opacity = 1}: YellowProps) {
  const frame = useCurrentFrame();
  const material = useRef<THREE.ShaderMaterial>(null);
  const box = sourceBox(roi), reveal = clamp(progress), strength = .65 * clamp(opacity);
  const width = (box.width + 6 * PIXEL) * Math.max(.00001, reveal);
  const height = Math.max(PIXEL, box.height - 5 * PIXEL);
  const geometry = useMemo(() => new THREE.ShapeGeometry(brushShape(width, height), 16), [width, height]);
  const originX=box.left-3*PIXEL,originY=box.top-3*PIXEL-height;
  const uniforms = useMemo(() => ({
    // The same current video texel is multiplied after sRGB encoding. This
    // retains dark letters without depending on framebuffer blending state.
    image:{value:texture},worldOrigin:{value:new THREE.Vector2(originX,originY)},
    multiplyColor:{value:new THREE.Vector3(1,1-strength*(1-233/255),1-strength*(1-73/255))},
  }),[]);
  useLayoutEffect(() => {
    const shader = material.current;
    if (!shader) return;
    shader.uniforms.image.value = texture;
    shader.uniforms.worldOrigin.value.set(originX, originY);
    shader.uniforms.multiplyColor.value.set(1, 1 - strength * (1 - 233 / 255), 1 - strength * (1 - 73 / 255));
    shader.uniformsNeedUpdate = true;
  }, [frame, texture, originX, originY, strength]);
  if (reveal <= 0 || strength <= 0) return null;
  return <mesh geometry={geometry} position={[originX,originY,.016]} renderOrder={2}>
    <shaderMaterial ref={material} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} blending={THREE.NoBlending} depthWrite={false} depthTest={false} side={THREE.DoubleSide} toneMapped={false}/>
  </mesh>;
}

function maskShape(box: ReturnType<typeof sourceBox>) {
  const shape = new THREE.Shape();
  // Follow the video's .10 world-unit rounded surface, avoiding dark square corners.
  const r0 = .10;
  shape.moveTo(-W / 2 + r0, -H / 2); shape.lineTo(W / 2 - r0, -H / 2);
  shape.absarc(W / 2 - r0, -H / 2 + r0, r0, -Math.PI / 2, 0, false);
  shape.lineTo(W / 2, H / 2 - r0); shape.absarc(W / 2 - r0, H / 2 - r0, r0, 0, Math.PI / 2, false);
  shape.lineTo(-W / 2 + r0, H / 2); shape.absarc(-W / 2 + r0, H / 2 - r0, r0, Math.PI / 2, Math.PI, false);
  shape.lineTo(-W / 2, -H / 2 + r0); shape.absarc(-W / 2 + r0, -H / 2 + r0, r0, Math.PI, Math.PI * 1.5, false);
  shape.closePath();
  // Source mask aperture: x-6, y-5, width+12, height+10, rx=4 source pixels.
  const left = box.left - 6 * PIXEL, right = box.left + box.width + 6 * PIXEL;
  const top = box.top + 5 * PIXEL, bottom = box.top - box.height - 5 * PIXEL;
  const r = Math.min(4 * PIXEL, (right - left) / 2, (top - bottom) / 2);
  const hole = new THREE.Path();
  hole.moveTo(left + r, top); hole.lineTo(right - r, top);
  hole.absarc(right - r, top - r, r, Math.PI / 2, 0, true);
  hole.lineTo(right, bottom + r); hole.absarc(right - r, bottom + r, r, 0, -Math.PI / 2, true);
  hole.lineTo(left + r, bottom); hole.absarc(left + r, bottom + r, r, -Math.PI / 2, -Math.PI, true);
  hole.lineTo(left, top - r); hole.absarc(left + r, top - r, r, Math.PI, Math.PI / 2, true);
  hole.closePath(); shape.holes.push(hole);
  return shape;
}

/** INT02: original video stays unchanged in the padded aperture while surrounding context dims. */
export function MaskAccent({roi, progress}: AccentProps) {
  const box = sourceBox(roi), amount = clamp(progress);
  const geometry = useMemo(() => new THREE.ShapeGeometry(maskShape(box), 16), [box.left, box.top, box.width, box.height]);
  if (amount <= 0) return null;
  return <mesh geometry={geometry} position={[0, 0, .020]} renderOrder={3}>
    <meshBasicMaterial color="#000000" opacity={.76 * amount} transparent depthWrite={false} depthTest={false} side={THREE.DoubleSide} toneMapped={false}/>
  </mesh>;
}
