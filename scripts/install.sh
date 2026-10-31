#!/bin/sh
set -e

# OMP Coding Agent Installer (Spirit412/oh-my-pi fork)
# Usage: curl -fsSL https://raw.githubusercontent.com/Spirit412/oh-my-pi/main/scripts/install.sh | sh
#        curl -fsSL .../scripts/install.sh | sh -s -- --binary --ref v18.8.9
#
# Options:
#   --source       Install from source (clones the repo, builds the native
#                  addon, links omp; installs bun if needed)
#   --binary       Install a prebuilt binary instead of building from source
#   --ref <ref>    Install specific tag/commit/branch (source mode); binary
#                  mode takes a release tag (v<version>)
#   -r <ref>       Shorthand for --ref
#
# Other branches of the same repository can install from their own ref with
# --ref/--source. Override the fork with PI_REPO, the source checkout with
# PI_SOURCE_DIR, or send binary installs to the upstream build service with
# PI_BUILD_URL. Without PI_BUILD_URL, binaries come from this repository's
# GitHub Releases and are checked against SHA256SUMS.txt.

REPO="${PI_REPO:-Spirit412/oh-my-pi}"
INSTALL_DIR="${PI_INSTALL_DIR:-$HOME/.local/bin}"
SOURCE_DIR="${PI_SOURCE_DIR:-$HOME/.omp/source}"
BUILD_URL="${PI_BUILD_URL:-}"
while [ "${BUILD_URL%/}" != "$BUILD_URL" ]; do
    BUILD_URL="${BUILD_URL%/}"
done
MIN_BUN_VERSION="1.4.4"

# Parse arguments
MODE=""
REF=""
while [ $# -gt 0 ]; do
    case "$1" in
        --source)
            MODE="source"
            shift
            ;;
        --binary)
            MODE="binary"
            shift
            ;;
        --ref)
            shift
            if [ -z "$1" ]; then
                echo "Missing value for --ref"
                exit 1
            fi
            REF="$1"
            shift
            ;;
        --ref=*)
            REF="${1#*=}"
            if [ -z "$REF" ]; then
                echo "Missing value for --ref"
                exit 1
            fi
            shift
            ;;
        -r)
            shift
            if [ -z "$1" ]; then
                echo "Missing value for -r"
                exit 1
            fi
            REF="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# If a ref is provided, default to source install
if [ -n "$REF" ] && [ -z "$MODE" ]; then
    MODE="source"
fi

# Check if bun is available
has_bun() {
    command -v bun >/dev/null 2>&1
}

# Normalized host architecture (x64|arm64). On macOS this uses
# `sysctl hw.optional.arm64` so it stays correct inside a Rosetta session,
# where `uname -m` reports the translated x86_64.
host_arch() {
    if [ "$(uname -s)" = "Darwin" ]; then
        if [ "$(sysctl -in hw.optional.arm64 2>/dev/null || /usr/sbin/sysctl -in hw.optional.arm64 2>/dev/null)" = "1" ]; then
            echo "arm64"
        else
            echo "x64"
        fi
        return
    fi
    case "$(uname -m)" in
        x86_64|amd64)  echo "x64" ;;
        arm64|aarch64) echo "arm64" ;;
        *)             uname -m ;;
    esac
}

# Bun's own architecture (x64|arm64), or empty when it can't be determined.
bun_arch() {
    bun -e 'process.stdout.write(process.arch)' 2>/dev/null
}

# True when Bun's architecture matches the host. If Bun's arch can't be read,
# assume a match rather than block the install.
bun_arch_matches_host() {
    ba="$(bun_arch)"
    [ -z "$ba" ] && return 0
    [ "$ba" = "$(host_arch)" ]
}

version_ge() {
    current="$1"
    minimum="$2"

    current_major="${current%%.*}"
    current_rest="${current#*.}"
    current_minor="${current_rest%%.*}"
    current_patch="${current_rest#*.}"
    current_patch="${current_patch%%.*}"

    minimum_major="${minimum%%.*}"
    minimum_rest="${minimum#*.}"
    minimum_minor="${minimum_rest%%.*}"
    minimum_patch="${minimum_rest#*.}"
    minimum_patch="${minimum_patch%%.*}"

    if [ "$current_major" -ne "$minimum_major" ]; then
        [ "$current_major" -gt "$minimum_major" ]
        return $?
    fi

    if [ "$current_minor" -ne "$minimum_minor" ]; then
        [ "$current_minor" -gt "$minimum_minor" ]
        return $?
    fi

    [ "$current_patch" -ge "$minimum_patch" ]
}

require_bun_version() {
    version_raw=$(bun --version 2>/dev/null || true)
    if [ -z "$version_raw" ]; then
        echo "Failed to read bun version"
        exit 1
    fi

    version_clean=${version_raw%%-*}
    if ! version_ge "$version_clean" "$MIN_BUN_VERSION"; then
        echo "Bun ${MIN_BUN_VERSION} or newer is required. Current version: ${version_clean}"
        echo "Upgrade Bun at https://bun.sh/docs/installation"
        exit 1
    fi
}

# Check if git is available
has_git() {
    command -v git >/dev/null 2>&1
}

# Install bun
install_bun() {
    echo "Installing bun..."
    if command -v bash >/dev/null 2>&1; then
        curl -fsSL https://bun.sh/install | bash
    else
        echo "bash not found; attempting install with sh..."
        curl -fsSL https://bun.sh/install | sh
    fi
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    require_bun_version
}

# Check if git-lfs is available
has_git_lfs() {
    command -v git-lfs >/dev/null 2>&1
}

# Install from source: clone the fork, install the workspace, build the native
# addon, and link the coding-agent package. The checkout is kept under
# SOURCE_DIR because `bun link` points the global `omp` binary at its source.
install_via_bun() {
    echo "Installing from source (${REPO})..."
    if ! has_git; then
        echo "git is required for source installs"
        exit 1
    fi
    if ! command -v cargo >/dev/null 2>&1; then
        echo "A Rust toolchain is required to build the native addon."
        echo "Install Rust from https://rustup.rs and re-run this installer,"
        echo "or use --binary to install a prebuilt release instead."
        exit 1
    fi

    case "$SOURCE_DIR" in
        ""|"/"|"$HOME")
            echo "Refusing to use PI_SOURCE_DIR=${SOURCE_DIR}"
            exit 1
            ;;
    esac

    TMP_DIR="$(mktemp -d)"
    trap 'rm -rf "$TMP_DIR"' EXIT

    REPO_URL="https://github.com/${REPO}.git"
    if [ -n "$REF" ]; then
        if git clone --depth 1 --branch "$REF" "$REPO_URL" "$TMP_DIR" >/dev/null 2>&1; then
            :
        else
            # A failed --branch clone (e.g. a commit sha) can leave a partial
            # directory behind; the fallback needs an empty destination.
            rm -rf "$TMP_DIR"
            mkdir -p "$TMP_DIR"
            git clone "$REPO_URL" "$TMP_DIR" || {
                echo "Failed to clone ${REPO_URL}"
                exit 1
            }
            (cd "$TMP_DIR" && git checkout "$REF") || {
                echo "Failed to checkout ${REF}"
                exit 1
            }
        fi
    else
        git clone --depth 1 "$REPO_URL" "$TMP_DIR" || {
            echo "Failed to clone ${REPO_URL}"
            exit 1
        }
    fi

    # Pull LFS files
    if has_git_lfs; then
        (cd "$TMP_DIR" && git lfs pull)
    fi

    if [ ! -d "$TMP_DIR/packages/coding-agent" ]; then
        echo "Expected package at ${TMP_DIR}/packages/coding-agent"
        exit 1
    fi

    # `bun link` symlinks the global binary into the package, so keep the
    # checkout instead of deleting it with the temporary directory.
    rm -rf "$SOURCE_DIR"
    mkdir -p "$(dirname "$SOURCE_DIR")"
    mv "$TMP_DIR" "$SOURCE_DIR"
    trap - 0

    (cd "$SOURCE_DIR" && bun install --frozen-lockfile) || {
        echo "Failed to install workspace dependencies"
        exit 1
    }
    (cd "$SOURCE_DIR" && bun --cwd=packages/natives run build) || {
        echo "Failed to build the native addon"
        exit 1
    }
    (cd "$SOURCE_DIR/packages/coding-agent" && bun link) || {
        echo "Failed to link omp"
        exit 1
    }

    echo ""
    echo "✓ Installed omp from ${REPO} via bun"
    echo "Run 'omp' to get started!"
}

# The string value of field "$1" in the one-line JSON on stdin (last
# occurrence). Escaped quotes inside JSON strings never end in `"<key>"`, so
# string contents cannot fake a key.
json_string() {
    sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p"
}

# The members of the build service answer's top-level `file` object (the
# requested target's file). `build.files[]` lists every target's file under the
# `files` key, so its sha256s never match here.
json_file_object() {
    sed -n 's/.*"file"[[:space:]]*:[[:space:]]*{\([^}]*\)}.*/\1/p'
}

# Hex sha256 of file "$1".
sha256_of() {
    if command -v sha256sum >/dev/null 2>&1; then
        sha256sum "$1" | cut -d ' ' -f 1
    else
        shasum -a 256 "$1" | cut -d ' ' -f 1
    fi
}

# Install binary from the build service
install_binary() {
    if ! command -v sha256sum >/dev/null 2>&1 && ! command -v shasum >/dev/null 2>&1; then
        echo "sha256sum or shasum is required to verify the downloaded binary"
        exit 1
    fi

    # Detect platform
    OS="$(uname -s)"
    ARCH="$(host_arch)"

    case "$OS" in
        Linux)  PLATFORM="linux" ;;
        Darwin) PLATFORM="macos" ;;
        *)      echo "Unsupported OS: $OS"; exit 1 ;;
    esac

    case "$ARCH" in
        x64)   TARGET_ARCH="x86_64" ;;
        arm64) TARGET_ARCH="arm64" ;;
        *)     echo "Unsupported architecture: $ARCH"; exit 1 ;;
    esac

    if [ "$PLATFORM" = "linux" ]; then
        if [ -f /etc/alpine-release ] || { command -v ldd >/dev/null 2>&1 && ldd --version 2>&1 | grep -qi musl; }; then
            PLATFORM="linux-musl"
        fi
    fi

    SERVICE_TARGET="${PLATFORM}-${TARGET_ARCH}"
    case "$PLATFORM" in
        macos)      RELEASE_PLATFORM="darwin" ;;
        *)          RELEASE_PLATFORM="$PLATFORM" ;;
    esac
    case "$ARCH" in
        x64)   RELEASE_ARCH="x64" ;;
        arm64) RELEASE_ARCH="arm64" ;;
    esac
    BINARY="omp-${RELEASE_PLATFORM}-${RELEASE_ARCH}"

    if [ -n "$BUILD_URL" ]; then
        if [ -n "$REF" ]; then
            if ! printf '%s\n' "$REF" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'; then
                echo "Binary installs take a release tag (v<version>) for --ref, got: $REF"
                echo "For branch/commit installs, use --source with --ref."
                exit 1
            fi
            echo "Fetching omp ${REF#v}..."
            API_URL="${BUILD_URL}/api/products/omp/versions/${REF#v}/${SERVICE_TARGET}"
        else
            echo "Fetching latest release..."
            API_URL="${BUILD_URL}/api/products/omp/latest/${SERVICE_TARGET}?channel=stable"
        fi
        if ! BUILD_JSON=$(curl -fsSL --connect-timeout 10 --max-time 60 "$API_URL"); then
            echo "Failed to resolve an omp build for ${SERVICE_TARGET} from ${API_URL}"
            exit 1
        fi
        BUILD_JSON=$(printf '%s' "$BUILD_JSON" | tr -d '\r\n')

        VERSION=$(printf '%s\n' "$BUILD_JSON" | json_string version)
        FILE_JSON=$(printf '%s\n' "$BUILD_JSON" | json_file_object)
        BINARY=$(printf '%s\n' "$FILE_JSON" | json_string name)
        EXPECTED_SHA256=$(printf '%s\n' "$FILE_JSON" | json_string sha256)
        # Go's JSON encoder writes `&` in the presigned URL as \u0026.
        DOWNLOAD_URL=$(printf '%s\n' "$BUILD_JSON" | json_string download | sed 's/\\u0026/\&/g')
        if [ -z "$VERSION" ] || [ -z "$BINARY" ] || [ -z "$DOWNLOAD_URL" ] ||
            ! printf '%s\n' "$EXPECTED_SHA256" | grep -Eq '^[0-9a-f]{64}$'; then
            echo "Unexpected answer from ${API_URL}"
            exit 1
        fi
        echo "Using version: $VERSION"
    else
        if [ -n "$REF" ]; then
            if ! printf '%s\n' "$REF" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$'; then
                echo "Binary installs take a release tag (v<version>) for --ref, got: $REF"
                echo "For branch/commit installs, use --source with --ref."
                exit 1
            fi
            RELEASE_BASE="https://github.com/${REPO}/releases/download/${REF}"
            echo "Fetching omp ${REF#v}..."
        else
            RELEASE_BASE="https://github.com/${REPO}/releases/latest/download"
            echo "Fetching the latest release of ${REPO}..."
        fi
        DOWNLOAD_URL="${RELEASE_BASE}/${BINARY}"
        CHECKSUM_URL="${RELEASE_BASE}/SHA256SUMS.txt"
        if ! CHECKSUMS=$(curl -fsSL --connect-timeout 10 --max-time 60 "$CHECKSUM_URL"); then
            echo "No release assets found at ${RELEASE_BASE}"
            echo "Publish a release first, or install from source with --source."
            exit 1
        fi
        EXPECTED_SHA256=$(printf '%s\n' "$CHECKSUMS" | tr -d '\r' | awk -v name="$BINARY" '$2 == name { print $1; exit }')
        if ! printf '%s\n' "$EXPECTED_SHA256" | grep -Eq '^[0-9a-f]{64}$'; then
            echo "No SHA-256 for ${BINARY} in ${CHECKSUM_URL}"
            echo "Publish a release first, or install from source with --source."
            exit 1
        fi
        echo "Using ${BINARY} from ${REPO}"
    fi

    mkdir -p "$INSTALL_DIR"
    # Download next to the destination and move it into place only once the
    # checksum matches, so a bad download never replaces a working omp.
    DOWNLOAD_PATH="${INSTALL_DIR}/.omp.download.$$"
    trap 'rm -f "$DOWNLOAD_PATH"' EXIT
    echo "Downloading ${BINARY}..."
    curl -fsSL --connect-timeout 10 --speed-limit 1024 --speed-time 30 "$DOWNLOAD_URL" -o "$DOWNLOAD_PATH"
    ACTUAL_SHA256="$(sha256_of "$DOWNLOAD_PATH")"
    if [ "$ACTUAL_SHA256" != "$EXPECTED_SHA256" ]; then
        echo "Checksum mismatch for ${BINARY}: expected ${EXPECTED_SHA256}, got ${ACTUAL_SHA256}"
        exit 1
    fi
    chmod +x "$DOWNLOAD_PATH"
    mv -f "$DOWNLOAD_PATH" "${INSTALL_DIR}/omp"

    # Verify the freshly installed binary can actually start before reporting
    # success. Bun's musl-target binaries link libstdc++/libgcc dynamically,
    # which stock Alpine/musl systems do not ship, so the download succeeds while
    # the binary exits 127 with relocation errors. Never claim success for a
    # binary that cannot run.
    if ! SMOKE_OUTPUT="$("${INSTALL_DIR}/omp" --version 2>&1)"; then
        echo ""
        echo "✗ omp was downloaded to ${INSTALL_DIR}/omp but cannot start:"
        echo "$SMOKE_OUTPUT" | sed 's/^/    /'
        if [ "$PLATFORM" = "linux-musl" ]; then
            echo ""
            echo "The musl build links libstdc++/libgcc dynamically. Install them, then re-run 'omp':"
            if command -v apk >/dev/null 2>&1; then
                echo "    apk add libstdc++ libgcc"
            else
                echo "    (install the libstdc++ and libgcc runtime packages for your distro)"
            fi
        fi
        exit 1
    fi

    echo ""
    echo "✓ Installed omp to ${INSTALL_DIR}/omp"

    # Check if in PATH
    case ":$PATH:" in
        *":$INSTALL_DIR:"*) echo "Run 'omp' to get started!" ;;
        *) echo "Add ${INSTALL_DIR} to your PATH, then run 'omp'" ;;
    esac
}

# Main logic
case "$MODE" in
    source)
        if ! has_bun; then
            install_bun
        fi
        require_bun_version
        if ! bun_arch_matches_host; then
            echo "Error: bun reports architecture '$(bun_arch)' but this host is '$(host_arch)'."
            echo "Installing from source with this bun would produce a mismatched binary"
            echo "(e.g. x86_64 under Rosetta on Apple Silicon), causing slow startup and AVX warnings."
            echo "Install a native bun for your architecture, or install the prebuilt $(host_arch) binary with --binary."
            exit 1
        fi
        install_via_bun
        ;;
    binary)
        install_binary
        ;;
    *)
        # Default: build from source so the installed code is exactly this
        # fork's checkout. A prebuilt binary is opt-in via --binary because it
        # only exists once this repository publishes release assets.
        if ! has_bun; then
            install_bun
        fi
        require_bun_version
        if ! bun_arch_matches_host; then
            echo "Detected bun with architecture '$(bun_arch)' on a '$(host_arch)' host."
            echo "Install a native bun, or install the prebuilt $(host_arch) binary with --binary."
            exit 1
        fi
        install_via_bun
        ;;
esac
