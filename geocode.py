#! /usr/bin/env python

'''
Geocodes colleges.
'''

import sys
import csv
from collections import defaultdict

def main():
    colleges = defaultdict(list)

    with open(sys.argv[1], 'rb') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # if not college is blank, push to cluster
            print row


if __name__ == "__main__":
    main()