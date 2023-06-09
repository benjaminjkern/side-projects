from collections import Counter

counter = Counter()

lines = open('results.txt').read().split('\n')

for line in lines:
    for option in line.split(';'):
        counter[option] += 1

print(counter)
