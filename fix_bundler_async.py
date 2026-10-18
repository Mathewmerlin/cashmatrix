with open('src/services/microTradeBundler.ts', 'r') as f:
    content = f.read()

# Replace synchronous method signature with async
content = content.replace('public executeQueuedBundle() {', 'public async executeQueuedBundle() {')

with open('src/services/microTradeBundler.ts', 'w') as f:
    f.write(content)

print("Fixed async method signature in microTradeBundler.ts!")
