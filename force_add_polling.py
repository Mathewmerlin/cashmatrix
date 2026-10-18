with open('src/services/microTradeBundler.ts', 'r') as f:
    code = f.read()

# Replace the constructor block to ensure the interval is running
if 'setInterval' not in code:
    old_constructor = 'constructor() {'
    new_constructor = '''constructor() {
    // Background polling loop to auto-discover and queue micro-trades
    if (typeof window !== 'undefined') {
      setInterval(() => {
        try {
          this.discoverMicroOpportunity();
          if (this.queuedMicroTrades.length >= 6) {
            this.executeQueuedBundle();
          }
        } catch (e) {}
      }, 5000);
    }'''
    code = code.replace(old_constructor, new_constructor, 1)
    with open('src/services/microTradeBundler.ts', 'w') as f:
        f.write(code)
    print("Forced background polling loop into constructor successfully!")
else:
    print("Polling loop is already present in code.")
