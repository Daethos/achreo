precision mediump float;

uniform float uTime;
varying vec2 vUv;

void main() {
    float drop = fract(vUv.y * 10.0 + uTime * 5.0);
    float intensity = smoothstep(0.45, 0.55, drop);
    vec3 rainColor = vec3(0.6, 0.6, 0.8);
    
    gl_FragColor = vec4(rainColor * intensity, 1.0);
}