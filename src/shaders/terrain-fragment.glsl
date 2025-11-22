uniform vec3 lightPosition;
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

    vec3 textureColorBig = texture(textureSource, mixTexPosition * 0.6).rgb;
    textureColorBig = mix(vec3(0.0), vec3(0.7), textureColorBig);

    vec3 textureColorSmall = texture(textureSource, mixTexPosition * 200.0).rgb;
    textureColorSmall = mix(vec3(0.1, 0.0, 0.0), vec3(0.7, 0.2, 0.1), textureColorSmall);

    vec3 textureColor = mix(textureColorSmall, textureColorBig, topLevelWeight);

    vec3 rgb = textureColor * ambientFactor + (1.0 - ambientFactor) * lighting;
    fragmentColor = vec4(rgb, 1.0);
}
