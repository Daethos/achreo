export const Wind = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;       // Time passed (to animate the wind)
uniform float intensity;
uniform vec2 resolution;  // Screen resolution
uniform sampler2D uMainSampler; // Main texture/sprite
varying vec2 outTexCoord;       // Texture coordinates

void main(void) {
    vec2 uv = outTexCoord;

    // Calculate wind displacement using a sine wave
    float wave = sin(uv.y * 20.0 + time * intensity) * 0.001; // Adjust frequency & strength
    uv.x = clamp(uv.x + wave, 0.0, 1.0);              // Clamp to avoid wrapping artifacts

    // Sample the displaced texture
    vec4 color = texture2D(uMainSampler, uv);

    gl_FragColor = color;
}`;