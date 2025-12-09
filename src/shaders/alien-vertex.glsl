uniform mat4 clipFromEye;
uniform mat4 eyeFromWorld;
uniform mat4 worldFromModel;
uniform mat4 jointMatrices[52];

in vec3 position;
in vec3 normal;
in vec3 color;
in vec4 joints;
in vec4 weights;

out vec3 mixNormal;
out vec3 mixColor;
out vec3 mixEyePosition;

void main() {
  mat4 poseFromModel =
    weights.x * jointMatrices[int(joints.x)] +
    weights.y * jointMatrices[int(joints.y)] +
    weights.z * jointMatrices[int(joints.z)] +
    weights.w * jointMatrices[int(joints.w)];

  gl_Position = clipFromEye * eyeFromWorld * worldFromModel * poseFromModel * vec4(position, 1.0);
  mixNormal = vec3(eyeFromWorld * worldFromModel * vec4(normal, 0.0));
  mixEyePosition = vec3(eyeFromWorld * worldFromModel * vec4(position, 1.0));

  mixColor = color;
}
