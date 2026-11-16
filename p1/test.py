
data = bytes(10)

with open("tiny.img", "wb") as file:
    file.write(data)

print("Created tiny.img")
print("Size:", len(data), "bytes")
