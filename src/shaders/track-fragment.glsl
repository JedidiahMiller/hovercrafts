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
    vec3 N = normalize(mixNormal);
    vec3 L = normalize(lightPosition - mixEyePosition);
    vec3 V = normalize(-mixEyePosition);
    vec3 H = normalize(L + V);

    float diff = max(0.0, dot(N, L));
    float spec = pow(max(0.0, dot(N, H)), shininess);

    vec3 tex = texture(textureSource, mixTexPosition * 0.1).rgb;

    vec3 rgb = tex * ambientFactor
             + (1.0 - ambientFactor) * (diff + spec);

    fragmentColor = vec4(rgb, 1.0);
}
