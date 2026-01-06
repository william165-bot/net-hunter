#!/bin/bash
#
# Script to rebuild DEX files from modified Java sources
# Requires: Android SDK with d8 tool installed
#

set -e

echo "Android App DEX Rebuild Script"
echo "================================"

# Configuration
ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
BUILD_TOOLS="$ANDROID_HOME/build-tools"
PLATFORM_JAR="$ANDROID_HOME/platforms/android-28/android.jar"
SOURCE_DIR="modified_sources"
BUILD_DIR="build"
OUTPUT_DIR="output"

# Check prerequisites
if [ ! -d "$ANDROID_HOME" ]; then
    echo "ERROR: Android SDK not found at $ANDROID_HOME"
    echo "Please set ANDROID_HOME environment variable or install Android SDK"
    exit 1
fi

# Find build tools
if [ -d "$BUILD_TOOLS" ]; then
    LATEST_BUILD_TOOLS=$(ls -1 "$BUILD_TOOLS" | sort -V | tail -1)
    D8="$BUILD_TOOLS/$LATEST_BUILD_TOOLS/d8"
    echo "Using build tools: $LATEST_BUILD_TOOLS"
else
    echo "ERROR: Build tools not found"
    exit 1
fi

if [ ! -f "$D8" ]; then
    echo "ERROR: d8 tool not found at $D8"
    exit 1
fi

if [ ! -f "$PLATFORM_JAR" ]; then
    echo "ERROR: Android platform JAR not found at $PLATFORM_JAR"
    echo "Please install Android SDK Platform 28"
    exit 1
fi

# Create build directories
echo "Creating build directories..."
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

# Compile Java sources
echo "Compiling Java sources..."
javac -source 1.8 -target 1.8 \
    -bootclasspath "$PLATFORM_JAR" \
    -d "$BUILD_DIR" \
    -sourcepath "$SOURCE_DIR" \
    "$SOURCE_DIR"/com/transsnet/gcd/sdk/util/SystemProperties.java \
    "$SOURCE_DIR"/com/transsnet/gcd/sdk/util/PhoneUtils.java \
    "$SOURCE_DIR"/com/transsnet/gcd/sdk/util/DeviceUtils.java

if [ $? -ne 0 ]; then
    echo "ERROR: Compilation failed"
    exit 1
fi

echo "Compilation successful!"

# Convert to DEX
echo "Converting to DEX format..."
"$D8" --release \
    --lib "$PLATFORM_JAR" \
    --output "$OUTPUT_DIR" \
    "$BUILD_DIR"/com/transsnet/gcd/sdk/util/*.class

if [ $? -ne 0 ]; then
    echo "ERROR: DEX conversion failed"
    exit 1
fi

echo "DEX conversion successful!"

# Merge with original dex
echo ""
echo "Next steps:"
echo "1. Extract your original APK"
echo "2. Replace the classes in classes2.dex with the newly generated classes"
echo "3. Repackage and sign your APK"
echo ""
echo "Generated DEX file: $OUTPUT_DIR/classes.dex"
echo ""
echo "To merge with original APK:"
echo "  unzip your_app.apk -d app_temp"
echo "  # Manually merge the dex or use dex merge tools"
echo "  cd app_temp && zip -r ../app_modified.apk *"
echo ""

echo "Build complete!"
