import zlib
import struct
import math

def create_png(width, height, file_path):
    # Generates a PNG with a dark high-tech WuWa resonance core icon
    raw_data = bytearray()
    cx, cy = width / 2.0, height / 2.0
    radius = min(width, height) * 0.42

    for y in range(height):
        row = bytearray([0]) # Filter type 0: None
        for x in range(width):
            dx = (x - cx) / radius
            dy = (y - cy) / radius
            dist = math.sqrt(dx * dx + dy * dy)

            # Deep dark background with subtle vignette
            r = int(10 + 6 * (1.0 - min(dist, 1.0)))
            g = int(14 + 10 * (1.0 - min(dist, 1.0)))
            b = int(22 + 20 * (1.0 - min(dist, 1.0)))
            a = 255

            # Outer ring: dist between 0.85 and 0.95
            if 0.82 <= dist <= 0.92:
                # Cyan ring
                intensity = 1.0 - abs(dist - 0.87) / 0.05
                r = int(min(255, r + 20 * intensity))
                g = int(min(255, g + 210 * intensity))
                b = int(min(255, b + 240 * intensity))

            # Inner ring: dist between 0.55 and 0.65
            if 0.58 <= dist <= 0.68:
                # Cyan-amber tech ring
                intensity = 1.0 - abs(dist - 0.63) / 0.05
                r = int(min(255, r + 50 * intensity))
                g = int(min(255, g + 190 * intensity))
                b = int(min(255, b + 220 * intensity))

            # Core diamond / center pulse
            diamond = abs(dx) + abs(dy)
            if diamond <= 0.35:
                intensity = (1.0 - diamond / 0.35)
                # Golden-cyan energy center
                r = int(min(255, r + int(245 * intensity)))
                g = int(min(255, g + int(190 * intensity)))
                b = int(min(255, b + int(110 * intensity)))

            row.extend([r, g, b, a])
        raw_data.extend(row)

    compressed = zlib.compress(bytes(raw_data), 9)

    def png_chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    png_bytes = (
        b'\x89PNG\r\n\x1a\n' +
        png_chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)) +
        png_chunk(b'IDAT', compressed) +
        png_chunk(b'IEND', b'')
    )

    with open(file_path, 'wb') as f:
        f.write(png_bytes)
    print(f"Generated {file_path} ({width}x{height})")

if __name__ == '__main__':
    create_png(192, 192, 'public/pwa-192x192.png')
    create_png(512, 512, 'public/pwa-512x512.png')
    create_png(180, 180, 'public/apple-touch-icon.png')
