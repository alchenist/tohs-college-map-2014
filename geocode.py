#! /usr/bin/env python

'''
Geocodes colleges.
'''

import sys
import csv
from geopy import geocoders
from collections import defaultdict

def main():
    dests = defaultdict(list)
    g = geocoders.GoogleV3()
    fieldnames = None

    with open(sys.argv[1], 'rb') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for entry in reader:
            dests[entry['Destination'].strip()].append(entry)
    
    with open(sys.argv[2], 'wb') as f:
        writer = csv.DictWriter(f, fieldnames + ['lat', 'lng'])
        writer.writeheader()
        for dest in dests:
            name = dest
            if len(name.split()) > 0 and name.split()[-1] == "CC":
                name = dest.split()
                _ = name.pop()
                name.append("Community College")
                name = ' '.join(name)
            input = name + ", " + dests[dest][0]['Location']
            if name.startswith("LDS mission in") or name == "Global Citizen Year":
                input = dests[dest][0]['Location']
            try:
                _, (lat, lng) = g.geocode(input, exactly_one=True)
                if name == "N/A":
                    lat, lng = None, None
                for entry in dests[dest]:
                    entry['lat'] = lat
                    entry['lng'] = lng
                    writer.writerow(entry)
            except TypeError:
                print name
                for entry in dests[dest]:
                    entry['lat'] = None
                    entry['lng'] = None
                    writer.writerow(entry)



if __name__ == "__main__":
    main()