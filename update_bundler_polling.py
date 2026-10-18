with open('src/services/microTradeBundler.ts', 'r') as f:
    content = f.read()

target = 'constructor() {'
insertion = '''constructor() {
    // Autonomous background agent swarm polling loop (every 5 seconds)
    if (typeof window !== 'undefined') {
      setInterval(() => {
        try {
          this.discoverMicroOpportunity();
          if (this.queuedMicroTrades.length >= 6) {
            this.executeQueuedBundle();
          }
        } catch (e) {
          // Silent recovery
        }
      }, 5000);
    }'''

if target in content and 'Autonomous background agent swarm' not in content:
    content = content.replace(target, insertion, 1)
    with open('src/services/microTradeBundler.ts', 'w') as f:
        f.write(content)
    print("Enabled autonomous background polling loop!")
else:
    print("Already enabled or target not found.")
