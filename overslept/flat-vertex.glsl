uniform mat4 clipFromEye;
uniform mat4 eyeFromWorld;
uniform mat4 worldFromModel;

in vec3 position;
in vec3 normal;
in vec3 color;
in vec2 texPosition;

out vec3 mixNormal;
out vec3 mixColor;
out vec3 mixEyePosition;
out vec2 mixTexPosition;

void main() {
  gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(position, 1.0);
  mixNormal = vec3(eyeFromWorld * worldFromModel * vec4(normal, 0.0));
  mixEyePosition = vec3(eyeFromWorld * worldFromModel * vec4(position, 1.0));
  mixTexPosition = texPosition;
  mixColor = color;
}
