from __future__ import annotations

import sys
import pkg_resources


def get_console_script_path(package_name: str, script_name: str) -> str | None:
    # """
    # Get the absolute path of a console script from a package.

    # @param package_name: The name of the package.
    # @param script_name: The name of the console script.
    # @return The absolute path of the console script.
    # """
    try:
        # Get the distribution object for the package
        dist = pkg_resources.get_distribution(package_name)
        # Get the entry point for the console script
        entry_point = dist.get_entry_info("console_scripts", script_name)
        # Get the path to the script
        script_path = entry_point.module_name.split(":")[0]
        # Return the absolute path of the script
        return pkg_resources.resource_filename(dist, script_path)
    except Exception as e:
        # Handle any exceptions that occur
        print(f"Error: {e}")
        return None


print(get_console_script_path(sys.argv[1], sys.argv[2]))
