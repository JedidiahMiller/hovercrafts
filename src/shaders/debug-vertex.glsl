uniform mat4 clipFromEye;
uniform mat4 eyeFromWorld;
uniform mat4 worldFromModel;

in vec3 position;

void main() {
  gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(position, 1.0);
}
