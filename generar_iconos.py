import os, struct, zlib

def png(path, size):
    bg, fg = (79, 70, 229), (255, 255, 255)   
    m = size // 4                               
    top = size // 3
    rows = []
    for y in range(size):
        row = bytearray([0])
        for x in range(size):
            en_bolsa = m <= x < size - m and top <= y < size - m
            asa = (size // 3 <= x < size - size // 3) and (top - size // 12 <= y < top) \
                  and not (size // 2.6 < x < size - size // 2.6 and y > top - size // 20)
            row += bytes(fg if (en_bolsa or asa) else bg)
        rows.append(bytes(row))
    raw = b"".join(rows)

    def chunk(t, d):
        c = struct.pack(">I", len(d)) + t + d
        return c + struct.pack(">I", zlib.crc32(t + d) & 0xFFFFFFFF)

    data = b"\x89PNG\r\n\x1a\n"
    data += chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0))
    data += chunk(b"IDAT", zlib.compress(raw, 9))
    data += chunk(b"IEND", b"")
    open(path, "wb").write(data)

os.makedirs("icons", exist_ok=True)
png("icons/icon-192.png", 192)
png("icons/icon-512.png", 512)
print("Iconos generados en /icons")