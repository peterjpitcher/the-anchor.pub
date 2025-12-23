import json
import glob

# Load all redirects
all_redirects = {}
redirect_files = glob.glob('*redirects.json') + glob.glob('content/blog/redirects.json')

for file in redirect_files:
    try:
        with open(file, 'r') as f:
            data = json.load(f)
            # Handle different formats
            if isinstance(data, list):
                redirects = data
            elif isinstance(data, dict) and 'redirects' in data:
                redirects = data['redirects']
            else:
                continue
                
            for redirect in redirects:
                if 'source' in redirect and 'destination' in redirect:
                    all_redirects[redirect['source']] = redirect['destination']
    except:
        pass

# Find chains
print("=== REDIRECT CHAINS ===")
chains_found = False
for source, destination in all_redirects.items():
    if destination in all_redirects:
        print(f"Chain: {source} -> {destination} -> {all_redirects[destination]}")
        chains_found = True
        
if not chains_found:
    print("No redirect chains found")

# Find loops
print("\n=== REDIRECT LOOPS ===")
loops_found = False
for source, destination in all_redirects.items():
    if destination in all_redirects and all_redirects[destination] == source:
        print(f"Loop: {source} <-> {destination}")
        loops_found = True
        
if not loops_found:
    print("No redirect loops found")

# Find problematic patterns
print("\n=== PROBLEMATIC PATTERNS ===")

# Check for redirects to the same URL
print("\nRedirects to self:")
for source, destination in all_redirects.items():
    if source == destination:
        print(f"Self-redirect: {source} -> {destination}")

# Check for very similar URLs that might cause issues
print("\nSimilar source/destination:")
for source, destination in all_redirects.items():
    # Remove trailing slashes for comparison
    clean_source = source.rstrip('/')
    clean_dest = destination.rstrip('/')
    if clean_source == clean_dest and source \!= destination:
        print(f"Trailing slash issue: {source} -> {destination}")

# Find URLs mentioned in GSC errors
gsc_errors = [
    "/whats-on",
    "/drinks",
    "/food-menu",
    "/sunday-lunch",
    "/christmas-parties",
    "/find-us",
    "/private-parties",
    "/about-us",
    "/airport-parking"
]

print("\n=== GSC ERROR URLS IN REDIRECTS ===")
for url in gsc_errors:
    if url in all_redirects:
        print(f"Source: {url} -> {all_redirects[url]}")
    
    # Check if it's a destination
    destinations = [dest for src, dest in all_redirects.items() if dest == url]
    if destinations:
        print(f"Destination: {len(destinations)} redirects point to {url}")
        # Show first 5 examples
        count = 0
        for src, dest in all_redirects.items():
            if dest == url and count < 5:
                print(f"  {src} -> {url}")
                count += 1
        if len(destinations) > 5:
            print(f"  ... and {len(destinations) - 5} more")
