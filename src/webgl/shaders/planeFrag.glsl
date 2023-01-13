struct TextureData {
  sampler2D texture;
  vec2 coveredScale;
};

uniform float u_time;
uniform TextureData u_image;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_uv;

const float radius = 0.3;

#include '../glsl/noise.glsl'

void main() {
  // 画像が画面サイズにフィットするようにuvを変換する
  vec2 uv = (v_uv - 0.5) * u_image.coveredScale + 0.5;
  // 画面のアスペクト比を求める
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  // マウスの座標は、-1 ~ 1で取得されるので、0 ~ 1に変換する
  vec2 mouse = u_mouse * 0.5 + 0.5;
  // ノイズを計算する
  float n = cnoise(uv * 3.0 + u_time * 0.3) * 0.02;
  // マウスとunの距離を計算する（noiseも加算しておく）
  float dist = distance(mouse * aspect, v_uv * aspect) + n;
  // 球体の境界を求める（微小値を引くことで、境界をすこしだけぼかす）
  float limit = 1.0 - smoothstep(radius - 0.003, radius, dist);

  // uvからマウスへの方向を求める。大きさは、曲げる量になる。
  vec2 direction = v_uv - mouse;
  // 球体内で屈折する範囲を求める（0.1までは曲げない）
  float range = smoothstep(0.1, radius, dist);
  // 球体の端にいくほど、強く曲がるようにする。
  range = pow(range, 3.0);
  // 曲げる量をもとめる。方向 * 範囲 * 球体内という制限 * 気持ち
  vec2 distortion = direction * range * limit * 0.8;

  // 球体内の色をtextureから取得する。rgbシフトもさせる
  float inCircle_r = texture2D(u_image.texture, uv - (distortion + 0.001)).r;
  float inCircle_g = texture2D(u_image.texture, uv - (distortion + 0.002)).g;
  float inCircle_b = texture2D(u_image.texture, uv - (distortion + 0.003)).b;
  // シフトさせた色要素を合成する
  vec3 inCircle = vec3(inCircle_r, inCircle_g, inCircle_b);

  // 球体の背面に影をつける
  float shadow = smoothstep(radius, radius + 0.1, dist);
  shadow = shadow * (1.0 - 0.9) + 0.9;

  // 球体の外側の色を取得する
  vec4 tex = texture2D(u_image.texture, uv);
  // 影と合成する
  vec3 color = mix(vec3(0.0), tex.rgb, shadow);
  // 球体と合成する
  color = mix(color, inCircle, limit);

  gl_FragColor = vec4(color, 1.0);
}