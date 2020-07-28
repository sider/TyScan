#!/bin/bash
set -euxo pipefail

current_dir="$(cd "$(dirname "$0")" && pwd)"
work_dir="${current_dir}/tmp"

mkdir -p "${work_dir}"
cd "${work_dir}"

tyscan() {
  docker run --rm -v "${work_dir}:/work" sider/tyscan:dev "$@"
}

tyscan --version
tyscan --help
tyscan init

echo 'console.log("Hello, TyScan!");' > hello.ts
tyscan scan

rm -rf "${work_dir}"
