#!/usr/bin/env python3
import sys

filepath = sys.argv[1]

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace curly quotes with straight single quotes
content = content.replace('\u201c', "'")  # Left double quotation mark
content = content.replace('\u201d', "'")  # Right double quotation mark

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Fixed curly quotes in {filepath}')

