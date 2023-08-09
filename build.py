#!/usr/bin/env python
import os
import re
import glob
import zipfile


def build(build_target):
    if type(build_target) is not str:
        raise TypeError("build_target must be string")
    if build_target == "firefox":
        manifest_file = "mv2.json"
    elif build_target == "chrome":
        manifest_file = "mv3.json"
    else:
        raise ValueError("invalid build target")

    os.makedirs("dist", exist_ok=True)

    regex_ignored = r"README|mv[23].json|^dist|.py$"

    with zipfile.ZipFile(f"dist/check-x-rate-limits-for-{build_target}.zip", "w") as zf:
        [
            zf.write(filename)
            for filename in glob.glob("**", recursive=True)
            if os.path.isfile(filename) and not re.search(regex_ignored, filename)
        ]
        zf.write(manifest_file, arcname="manifest.json")


if __name__ == "__main__":
    build("firefox")
    build("chrome")
