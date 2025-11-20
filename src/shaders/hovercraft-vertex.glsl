uniform mat4 clipFromEye;
uniform mat4 eyeFromWorld;
uniform mat4 worldFromModel;

in vec3 position;
in vec3 normal;
in vec4 color;
in vec4 joints;
in vec4 weights;

out vec3 mixNormal;
out vec3 mixColor;
out vec3 mixEyePosition;

void main() {
  gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(position, 1.0);
  mixNormal = vec3(eyeFromWorld * worldFromModel * vec4(normal, 0.0));
  mixEyePosition = vec3(eyeFromWorld * worldFromModel * vec4(position, 1.0));

  mixColor = color.rgb;
}
