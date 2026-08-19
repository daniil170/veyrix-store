import re

with open('../../public/favicon.svg', 'r') as f:
    svg = f.read()

match = re.search(r'd="([^"]+)"', svg)
if not match:
    print("No path found")
    exit(1)

path = match.group(1).replace(',', ' ')
tokens = []
for tok in re.findall(r'[a-zA-Z]|-?[\d.]+', path):
    tokens.append(tok)

x_coords = []
y_coords = []

x, y = 0.0, 0.0
i = 0
mode = 'M'

while i < len(tokens):
    tok = tokens[i]
    if tok.isalpha():
        mode = tok
        i += 1
        continue
    
    # Depending on mode, parse x and y
    if mode.upper() in ['M', 'L', 'T']:
        dx = float(tokens[i])
        dy = float(tokens[i+1])
        if mode.islower():
            x += dx
            y += dy
        else:
            x = dx
            y = dy
        x_coords.append(x)
        y_coords.append(y)
        i += 2
        # Implicitly continue as L if M
        if mode == 'M': mode = 'L'
        if mode == 'm': mode = 'l'
        
    elif mode.upper() in ['C']:
        # 3 pairs
        x1 = float(tokens[i])
        y1 = float(tokens[i+1])
        x2 = float(tokens[i+2])
        y2 = float(tokens[i+3])
        x3 = float(tokens[i+4])
        y3 = float(tokens[i+5])
        if mode.islower():
            x_coords.extend([x+x1, x+x2, x+x3])
            y_coords.extend([y+y1, y+y2, y+y3])
            x += x3
            y += y3
        else:
            x_coords.extend([x1, x2, x3])
            y_coords.extend([y1, y2, y3])
            x = x3
            y = y3
        i += 6
        
    elif mode.upper() == 'Z':
        i += 1
    else:
        # Ignore other modes for now, we just want a rough bounding box
        i += 1

print(f"X: {min(x_coords)} to {max(x_coords)}")
print(f"Y: {min(y_coords)} to {max(y_coords)}")
print(f"Width: {max(x_coords) - min(x_coords)}")
print(f"Height: {max(y_coords) - min(y_coords)}")
