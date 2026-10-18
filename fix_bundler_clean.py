with open('src/services/microTradeBundler.ts', 'r') as f:
    code = f.read()

# Replace whatever signature exists for executeQueuedBundle with a clean async one
old_sig = 'public executeQueuedBundle()'
if old_sig in code:
    code = code.replace(old_sig, 'public async executeQueuedBundle()')

old_sig_async = 'public async async executeQueuedBundle()'
if old_sig_async in code:
    code = code.replace(old_sig_async, 'public async executeQueuedBundle()')

with open('src/services/microTradeBundler.ts', 'w') as f:
    f.write(code)

print("Cleaned and fixed executeQueuedBundle signature!")
