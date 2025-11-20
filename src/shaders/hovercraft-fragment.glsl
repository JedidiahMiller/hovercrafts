uniform vec3 lightPosition;

in vec3 mixNormal;
in vec3 mixEyePosition;
in vec3 mixColor;

out vec4 fragmentColor;

const float ambientFactor = 0.2;
const vec3 specularColor = vec3(1.0, 1.0, 1.0);
const float shininess = 50.0;

void main() {
    vec3 lightDirection = normalize(lightPosition - mixEyePosition);
    vec3 normal = normalize(mixNormal);
    float litness = max(0.0, dot(normal, lightDirection));

    vec3 ambient = mixColor.rgb * ambientFactor;
    vec3 diffuse = litness * mixColor.rgb * (1.0 - ambientFactor);

    vec3 eyeDirection = normalize(-mixEyePosition);
    vec3 halfDirection = normalize(eyeDirection + lightDirection);
    float specularity = pow(max(0.0, dot(halfDirection, normal)), shininess);
    vec3 specular = specularity * specularColor;

    vec3 rgb = ambient + diffuse + specular;
    fragmentColor = vec4(rgb, 1.0);
}
