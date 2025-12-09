uniform mat4 clipFromEye;
uniform mat4 eyeFromWorld;
uniform mat4 worldFromModel;
uniform vec3 cameraRight;
uniform vec3 cameraUp;
uniform float grassScale;

in vec3 position;
in vec2 texPosition;
out vec2 mixTexPosition;

void main() {
  vec2 factors = vec2(texPosition.x * 2.0 - 1.0, texPosition.y * 2.0 - 1.0);
  vec3 outerPosition = position + factors.x * cameraRight * grassScale + factors.y * cameraUp * grassScale;
  gl_Position = clipFromEye * eyeFromWorld * worldFromModel * vec4(outerPosition, 1.0);
  mixTexPosition = texPosition;
}
