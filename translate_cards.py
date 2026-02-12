# Quick Python script to help verify current translation progress
# Run this to see how many cards are already translated

import re

# Read the data.js file
with open('js/modules/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all Korean readings sections
ko_sections = re.findall(r'ko: \[(.*?)\]', content, re.DOTALL)

# Count how many have been translated (not English text)
translated_count = 0
total_count = len(ko_sections)

for section in ko_sections:
    # Check if it contains Korean characters (Hangul)
    if re.search(r'[\uac00-\ud7af]', section):
        translated_count += 1

print(f"Progress: {translated_count}/{total_count} cards translated ({int(translated_count/total_count*100)}%)")
print(f"Remaining: {total_count - translated_count} cards")
