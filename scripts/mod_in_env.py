#! /usr/bin/env python3

import sys
import pkg_resources

# If not present, fails with a DistributionNotFound exception
if pkg_resources.get_distribution(str(sys.argv[1])).version:
    exit(0)
