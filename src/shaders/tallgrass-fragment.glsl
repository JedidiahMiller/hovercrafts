uniform sampler2D tallGrassTexture;
in vec2 mixTexPosition;
out vec4 fragmentColor;

void main() {
  // Flip Y coordinate to correct upside-down texture
  vec2 flippedTexCoord = vec2(mixTexPosition.x, 1.0 - mixTexPosition.y);
  fragmentColor = texture(tallGrassTexture, flippedTexCoord);
  
  // Discard transparent pixels for alpha blending
  if (fragmentColor.a < 0.5) {
    discard;
  }
}
