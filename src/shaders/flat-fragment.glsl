uniform vec3 lightPosition;
uniform sampler2D terrainTexture;

in vec3 mixNormal;
in vec3 mixEyePosition;
in vec3 mixColor;
in vec2 mixTexPosition;

out vec4 fragmentColor;

const float ambientFactor = 0.3;
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

    vec3 lighting = ambient + diffuse + specular;
    vec3 textureColor = texture(terrainTexture, mixTexPosition).rgb;
    // vec3 rgb = lighting * textureColor;
    fragmentColor = vec4(lighting, 1.0);
}
