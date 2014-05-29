#! /usr/bin/env python

'''
Geocodes colleges.
'''

import sys
import csv
from geopy import geocoders
from collections import defaultdict

def main():
    colleges = defaultdict(list)
    g = geocoders.GoogleV3()
    fieldnames = None

    with open(sys.argv[1], 'rb') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for entry in reader:
            if entry['Not college'] != '1':
                colleges[entry['University'].strip()].append(entry)
    
    with open(sys.argv[2], 'wb') as f:
        writer = csv.DictWriter(f, fieldnames + ['lat', 'lng'])
        writer.writeheader()
        for college in colleges:
            name = college
            if len(name.split()) > 0 and name.split()[-1] == "CC":
                name = college.split()
                _ = name.pop()
                name.append("Community College")
                name = ' '.join(name)
            try:
                _, (lat, lng) = g.geocode(name + ", " + colleges[college][0]['State'], exactly_one=True)
                for entry in colleges[college]:
                    entry['lat'] = lat
                    entry['lng'] = lng
                    writer.writerow(entry)
            except TypeError:
                print name
                continue


if __name__ == "__main__":
    main()