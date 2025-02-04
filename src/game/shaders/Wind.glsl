#ifdef GL_ES
precision mediump float;
#endif

uniform float time;       // Time passed (to animate the wind)
uniform vec2 resolution;  // Screen resolution
uniform sampler2D uMainSampler; // Main texture/sprite
varying vec2 outTexCoord;       // Texture coordinates

void main(void) {
    vec2 uv = outTexCoord;

    // Base wind parameters
    float windStrength = 0.002; // Overall strength of the wind effect
    float windSpeed = 0.2;     // Speed of the wind
    float windFrequency = 2.0; // Frequency of the wind waves

    // Secondary wind parameters for more natural movement
    float secondaryWindStrength = 0.001;
    float secondaryWindSpeed = 0.15;
    float secondaryWindFrequency = 10.0;

    // Calculate the primary wind effect
    float primaryWave = sin(uv.y * windFrequency + time * windSpeed) * windStrength * (1.0 - uv.y);

    // Calculate the secondary wind effect
    float secondaryWave = cos(uv.y * secondaryWindFrequency + time * secondaryWindSpeed) * secondaryWindStrength * (1.0 - uv.y);

    // Combine the waves
    uv.x = clamp(uv.x + primaryWave + secondaryWave, 0.0, 1.0);

    // Sample the texture with the modified UV coordinates
    vec4 color = texture2D(uMainSampler, uv);

    gl_FragColor = color;
}