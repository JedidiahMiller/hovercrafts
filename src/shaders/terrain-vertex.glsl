uniform mat4 clipFromEye;
uniform mat4 eyeFromWorld;
uniform mat4 worldFromModel;

in vec3 position;
in vec3 normal;
in vec2 texPosition;

out vec3 mixNormal;
out vec3 mixEyePosition;
out vec2 mixTexPosition;
out float height;

void main() {
  gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(position, 1.0);
  height = (worldFromModel * vec4(position, 1.0)).y;
  mixNormal = normalize((eyeFromWorld * worldFromModel * vec4(normal, 0.0)).xyz);

  mixEyePosition = (eyeFromWorld * worldFromModel * vec4(position, 1.0)).xyz;
  mixTexPosition = texPosition;
}
