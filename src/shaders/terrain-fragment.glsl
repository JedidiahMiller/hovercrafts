uniform vec3 lightPosition;
uniform vec2 textureScale;
uniform sampler2D textureSource;

in float height;
in vec3 mixNormal;
in vec3 mixEyePosition;
in vec2 mixTexPosition;

out vec4 fragmentColor;

const float shininess = 5.0;
const float ambientFactor = 0.9;

const float topLevelWeight = 0.4;

void main() {
    vec3 lightDirection = normalize(lightPosition - mixEyePosition);
    vec3 normal = - normalize(mixNormal);
    float litness = max(0.0, dot(normal, lightDirection));

    vec3 eyeDirection = normalize(-mixEyePosition);
    vec3 halfDirection = normalize(eyeDirection + lightDirection);
    float specularity = pow(max(0.0, dot(halfDirection, normal)), shininess);
    vec3 specular = specularity * vec3(1.0);

    vec3 lighting = specular * (1.0 - ambientFactor);

    vec3 textureColor = texture(textureSource, mixTexPosition * textureScale).rgb;

    vec3 rgb = textureColor * ambientFactor + (1.0 - ambientFactor) * lighting;
    fragmentColor = vec4(rgb, 1.0);
}
