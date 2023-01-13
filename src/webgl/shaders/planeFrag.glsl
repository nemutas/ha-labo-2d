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
  vec2 uv = (v_uv - 0.5) * u_image.coveredScale + 0.5;
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 mouse = u_mouse * 0.5 + 0.5;

  float n = cnoise(uv * 3.0 + u_time * 0.3) * 0.02;

  float dist = distance(mouse * aspect, v_uv * aspect) + n;
  float limit = 1.0 - smoothstep(radius, radius + 0.003, dist);

  vec2 direction = v_uv - mouse;
  float range = smoothstep(0.1, radius + 0.003, dist);
  range = pow(range, 3.0);
  vec2 distortion = direction * range * limit * 0.8;

  float inCircle_r = texture2D(u_image.texture, uv - (distortion + 0.001)).r;
  float inCircle_g = texture2D(u_image.texture, uv - (distortion + 0.002)).g;
  float inCircle_b = texture2D(u_image.texture, uv - (distortion + 0.003)).b;
  vec3 inCircle = vec3(inCircle_r, inCircle_g, inCircle_b);

  float shadow = (1.0 - range) * (1.0 - 0.8) + 0.8;
  inCircle *= shadow;

  vec4 tex = texture2D(u_image.texture, uv);
  vec3 color = mix(tex.rgb, inCircle, limit);

  gl_FragColor = vec4(color, 1.0);
}