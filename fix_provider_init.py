with open('src/services/microTradeBundler.ts', 'r') as f:
    code = f.read()

# Make sure ethers and BrowserProvider are correctly referenced
# Let's patch line 299 where ethers.providers or new ethers.BrowserProvider is called
old_snippet = 'new ethers.BrowserProvider('
if old_snippet not in code:
    # If it's using old ethers v5 syntax
    code = code.replace('new ethers.providers.Web3Provider(', 'new ethers.BrowserProvider(')

with open('src/services/microTradeBundler.ts', 'w') as f:
    f.write(code)

print("Checked provider initialization reference!")
