import os
import sysconfig


def get_install_bin_dir() -> str:
    """Get the path to the pip install directory for scripts (bin, Scripts).
    Works for virtualenv, conda, and system installs.

    Returns
    -------
    str
        Path to the pip install directory for scripts (bin, Scripts).
    """
    if ("VIRTUAL_ENV" in os.environ) or ("CONDA_PREFIX" in os.environ):
        return sysconfig.get_path("scripts")
    else:
        return sysconfig.get_path("scripts", f"{os.name}_user")


if __name__ == "__main__":
    print(get_install_bin_dir())
