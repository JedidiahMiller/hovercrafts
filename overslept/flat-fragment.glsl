uniform vec3 lightPosition;
uniform float emissive; // 0 for normal surfaces, 1 for glowing sun
uniform sampler2D terrainTexture;


in vec3 mixNormal;
in vec3 mixEyePosition;
in vec3 mixColor;
in vec2 mixTexPosition;

out vec4 fragmentColor;

const float ambientFactor = 0.2;
const float shininess = 50.0;

void main() {
    vec3 lightDirection = normalize(lightPosition - mixEyePosition);
    vec3 normal = normalize(mixNormal);
    float litness = max(0.0, dot(normal, lightDirection));

    vec3 ambient = mixColor * ambientFactor;
    vec3 diffuse = litness * mixColor * (1.0 - ambientFactor);

    vec3 eyeDirection = normalize(-mixEyePosition);
    vec3 halfDirection = normalize(eyeDirection + lightDirection);
    float specularity = pow(max(0.0, dot(halfDirection, normal)), shininess);
    vec3 specular = specularity * vec3(1.0);

    vec3 glow = mixColor * emissive; // add unlit color for sun

    // vec3 rgb = ambient + diffuse + specular + glow;
    vec3 rgb = texture(terrainTexture, mixTexPosition).rgb;
    fragmentColor = vec4(rgb, 1.0);
}
