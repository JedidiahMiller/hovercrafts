from PIL import Image, ImageDraw, ImageFilter
import random

# Smallest size to fit the trench
height = 1000
width = 100  # enough for the trench to wander

# White background
img = Image.new('RGB', (width, height), (255, 255, 255))
draw = ImageDraw.Draw(img)

# Starting x somewhere near center
x = width // 2
line_color = 0

prev_x = x
trench_margin = 5  # keep trench inside white bounds

for y in range(height):
    # Smooth horizontal drift
    x += random.randint(-3, 3)
    # Clamp so the trench never touches edges
    x = max(trench_margin, min(width - trench_margin - 1, x))
    
    smooth_x = (prev_x + x) // 2
    prev_x = smooth_x
    
    # Variable trench width
    w = random.randint(25, 75)
    
    # Draw trench
    draw.line([(smooth_x, y), (smooth_x, y + 1)], fill=(line_color, line_color, line_color), width=w)

# Feather edges slightly
img = img.filter(ImageFilter.GaussianBlur(radius=3))

img.save('maps/trench.png')
img.show()
