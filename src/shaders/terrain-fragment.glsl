uniform vec3 lightPosition;
uniform vec2 textureScale;
uniform sampler2D textureSource;

in float height;
in vec3 mixNormal;
in vec3 mixEyePosition;
in vec2 mixTexPosition;

out vec4 fragmentColor;

const float shininess = 500.0;
const float ambientFactor = 0.6;

const float topLevelWeight = 0.4;

void main() {
    vec3 lightDirection = normalize(lightPosition - mixEyePosition);
    vec3 normal = normalize(mixNormal);
    float litness = max(0.0, dot(normal, lightDirection));

    vec3 textureColor = texture(textureSource, mixTexPosition * textureScale).rgb;

    vec3 ambient = textureColor * ambientFactor;
    vec3 diffuse = litness * textureColor * (1.0 - ambientFactor);

    vec3 eyeDirection = normalize(-mixEyePosition);
    vec3 halfDirection = normalize(eyeDirection + lightDirection);
    float specularity = pow(max(0.0, dot(halfDirection, normal)), shininess);
    vec3 specular = specularity * vec3(1.0, 1.0, 1.0);

    vec3 rgb = ambient + diffuse + specular;
    fragmentColor = vec4(rgb, 1.0);
}
