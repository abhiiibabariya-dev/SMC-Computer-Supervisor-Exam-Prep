#!/bin/bash
# Script to check for and pull updated study materials
# Customize this script based on your actual update sources

set -euo pipefail

echo "Starting study materials update check..."

# Navigate to repository root
cd "$(dirname "$0")/../.."

# Log current timestamp
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
echo "Check started at: $TIMESTAMP"

# Define directories to check for updates
STUDY_DIRS=(
    "assistant_auditor"
    "assistant_engineer_civil"
    "assistant_engineer_electrical"
    "assistant_engineer_mechanical"
    "assistant_town_planner"
    # Add more directories as needed
)

# Track if any updates were made
UPDATES_MADE=0

# Function to check for updates in a directory
check_directory_updates() {
    local dir="$1"
    echo "Checking for updates in: $dir"
    
    # TODO: Implement your actual update logic here
    # Examples of what you might do:
    # 1. Check if there are new files in an incoming/staging area
    # 2. Download updated materials from a remote URL
    # 3. Check if source materials have been modified externally
    # 4. Generate PDFs from markdown if needed
    
    # Placeholder: Check if there's an incoming directory with updates
    if [ -d "./incoming_updates/$dir" ]; then
        echo "Found incoming updates for $dir"
        # Copy new/updated files
        cp -r ./incoming_updates/$dir/* ./$dir/ 2>/dev/null || true
        if [ $? -eq 0 ]; then
            echo "Applied updates to $dir"
            ((UPDATES_MADE++))
        fi
    fi
    
    # TODO: Add your custom update logic here
    # For example:
    # - Check for new mock tests or question papers
    # - Update ALL_IN_ONE_EXAM_GUIDE.md when sections change
    # - Generate PDF versions of study materials
    # - Pull updates from official SMC notifications
}

# Check each study directory
for dir in "${STUDY_DIRS[@]}"; do
    if [ -d "./$dir" ]; then
        check_directory_updates "$dir"
    else
        echo "Directory $dir not found, skipping"
    fi
done

# Check for updates to the main exam guide
if [ -f "./incoming_updates/ALL_IN_ONE_EXAM_GUIDE.md" ]; then
    echo "Found update for ALL_IN_ONE_EXAM_GUIDE.md"
    cp ./incoming_updates/ALL_IN_ONE_EXAM_GUIDE.md ./ALL_IN_ONE_EXAM_GUIDE.md
    echo "Updated ALL_IN_ONE_EXAM_GUIDE.md"
    ((UPDATES_MADE++))
fi

# Check for updates to PDF materials
if [ -d "./incoming_updates" ]; then
    # Copy any new PDF files to root
    find ./incoming_updates -name "*.pdf" -type f -exec cp {} ./ \; 2>/dev/null || true
    # Copy PDFs to subject directories if needed
    find ./incoming_updates -name "*.pdf" -type f -exec sh -c '
        for pdf; do
            # Example: put PDFs in relevant subject directory
            # This is just an example - customize as needed
            dir=$(dirname "$pdf")
            base=$(basename "$pdf")
            if [ -d "./$dir" ]; then
                cp "$pdf" "./$dir/"
                echo "Copied $base to $dir/"
            fi
        done
    ' sh {} +
fi

# Summary
if [ $UPDATES_MADE -gt 0 ]; then
    echo "Updates applied: $UPDATES_MADE"
    # Configure git for committing
    git config user.name "github-actions[bot]"
    git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
    
    # Add changes
    git add -A
    
    # Check if there are changes to commit
    if ! git diff --staged --quiet; then
        git commit -m "chore: update study materials [$TIMESTAMP]"
        echo "Changes committed"
        
        # Push changes
        git push origin HEAD:master
        echo "Changes pushed to origin/master"
    else
        echo "No changes to commit after update check"
    fi
else
    echo "No updates found"
fi

echo "Study materials update check completed at: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
exit 0
