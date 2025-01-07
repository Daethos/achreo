export const DayNight = `
precision mediump float;

uniform float uTime;

void main() {
    // Calculate a cycle value based on time
    float cycle = sin(uTime * 0.1) * 0.5 + 0.5;

    // Define colors for day and night
    vec3 dayColor = vec3(1.0, 1.0, 1.0);  // Bright white for day
    vec3 nightColor = vec3(0.0, 0.0, 0.3);  // Dark blue for night

    // Mix the colors based on the cycle value
    vec3 color = mix(nightColor, dayColor, cycle);

    gl_FragColor = vec4(color, 1.0);
}`;