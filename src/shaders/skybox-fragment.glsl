uniform samplerCube skybox;
in vec3 mixTexPosition;
out vec4 fragmentColor;

void main() {
  fragmentColor = texture(skybox, mixTexPosition);
}