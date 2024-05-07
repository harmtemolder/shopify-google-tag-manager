#!/usr/bin/env sh
# This file is intended to help bump a semver version number.
# Usage
#   ./semver.sh [RELEASE_TYPE] [PREVIOUS_VERSION]
#   ./semver.sh alpha 1.1.2-alpha2
#     > 1.1.2-alpha3
#   ./semver.sh minor 1.1.2-alpha2
#     > 1.2.0

_error() {
  [ -n "${1}" ] && echo "${1}"
  exit 1
}

REGEX_NUMBER_PATTERN="[0-9]+"
RELEASE_TYPE="${1}"
# LATEST=$(git tag --sort=committerdate | tail -1)
LATEST="${2}"

# Version parts
MAJOR=""
MINOR=""
PATCH=""
PRERELEASE_TYPE=""
PRERELEASE_VERSION=""

# Logic gate to check for valid release type
case "${RELEASE_TYPE}" in
  major|minor|patch|alpha|beta) ;;
  *) _error "Invalid release type: '${RELEASE_TYPE}'. Allowed: major|minor|patch|alpha|beta";;
esac

# Regular expression matching against a string
# Usage:
#   _match [PATTERN] [INPUT]
_match() {
    PATTERN="${1}"
    INPUT="${2}"
    printf "%s" "${INPUT}" | grep -oE "${PATTERN}" | head -1
}

RELEASE=$(printf "%s" "${LATEST}" | cut -d '-' -f 1)
PRERELEASE=$(printf "%s" "${LATEST}" | cut -d '-' -f 2)
[ "${RELEASE}" = "${PRERELEASE}" ] && PRERELEASE=""

MAJOR=$(printf "%s" "${RELEASE}" | cut -d '.' -f 1)
MAJOR=$(_match "^${REGEX_NUMBER_PATTERN}" "${MAJOR}")
[ -n "${MAJOR}" ] || _error "Invalid major version: '${MAJOR}'"

MINOR=$(printf "%s" "${RELEASE}" | cut -d '.' -f 2)
MINOR=$(_match "^${REGEX_NUMBER_PATTERN}" "${MINOR}")
[ -n "${MINOR}" ] || _error "Invalid minor version: '${MINOR}'"

PATCH=$(printf "%s" "${RELEASE}" | cut -d '.' -f 3)
PATCH=$(_match "^${REGEX_NUMBER_PATTERN}" "${PATCH}")
[ -n "${PATCH}" ] || _error "Invalid patch version: '${PATCH}'"

# Parse prerelease
if [ -n "${PRERELEASE}" ]; then
  PRERELEASE_TYPE=$(_match "^[a-z]+" "${PRERELEASE}")
  [ "${PRERELEASE_TYPE}" = "alpha" ] || [ "${PRERELEASE_TYPE}" = "beta" ] \
    || _error "Invalid prerelease type: '${PRERELEASE_TYPE}' for '${PRERELEASE}'"

  PRERELEASE_VERSION=$(_match "${REGEX_NUMBER_PATTERN}$" "${PRERELEASE}")
  [ -n "${PATCH}" ] || _error "Invalid prerelease version: '${PATCH}'"
fi

# Major
case "${RELEASE_TYPE}" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR="0"
    PATCH="0"
    PRERELEASE=""
    PRERELEASE_TYPE=""
    PRERELEASE_VERSION=""
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH="0"
    PRERELEASE=""
    PRERELEASE_TYPE=""
    PRERELEASE_VERSION=""
    ;;
  patch)
    PATCH=$((PATCH + 1))
    PRERELEASE=""
    PRERELEASE_TYPE=""
    PRERELEASE_VERSION=""
    ;;
esac

# Alpha
if [ "${RELEASE_TYPE}" = "alpha" ]; then
  case "${PRERELEASE_TYPE}" in
    alpha)
      PRERELEASE_VERSION=$((PRERELEASE_VERSION + 1))
      ;;
    beta)
      # Only allow forward progression
      # (cannot go from beta --> alpha)
      _error "Previous release is 'beta'. Cannot release 'alpha'."
      ;;
    *)
      PATCH=$((PATCH + 1))
      PRERELEASE_TYPE="alpha"
      PRERELEASE_VERSION="1"
      ;;
  esac
fi

# Beta
if [ "${RELEASE_TYPE}" = "beta" ]; then
  case "${PRERELEASE_TYPE}" in
    alpha)
      PRERELEASE_VERSION="1"
      PRERELEASE_TYPE="beta"
      ;;
    beta)
      PRERELEASE_VERSION=$((PRERELEASE_VERSION + 1))
      ;;
    *)
      PATCH=$((PATCH + 1))
      PRERELEASE_TYPE="beta"
      PRERELEASE_VERSION="1"
      ;;
  esac
fi

# Compose the final version
_version() {
  VERSION="${MAJOR}.${MINOR}.${PATCH}"

  if [ -n "${PRERELEASE_TYPE}" ]; then
    VERSION="${VERSION}-${PRERELEASE_TYPE}${PRERELEASE_VERSION}"
  fi

  printf "%s" "${VERSION}"
}

_version
