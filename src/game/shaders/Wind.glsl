#ifdef GL_ES
precision mediump float;
#endif

uniform float time;       // Time passed (to animate the wind)
uniform vec2 resolution;  // Screen resolution
uniform sampler2D uMainSampler; // Main texture/sprite
varying vec2 outTexCoord;       // Texture coordinates

void main(void) {
    vec2 uv = outTexCoord;

    float frequency = 40.0;
    float calm = 10000.0;
    float wave = cos(uv.y * frequency + time * 6.2831) / calm * (1.0 - uv.y);
    uv.x = clamp(uv.x + wave, 0.0, 1.0);

    vec4 color = texture2D(uMainSampler, uv);

    gl_FragColor = color;
}