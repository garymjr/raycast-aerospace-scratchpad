# AeroSpace Scratchpad

A Raycast extension that lists all windows from AeroSpace's scratchpad workspace (S) and allows you to move selected windows to your current workspace.

## Features

- Lists all windows currently on workspace S (scratchpad)
- Shows detailed window titles and application names
- Moves selected windows to your current workspace and focuses them
- Handles multiple windows from the same application as separate items
- Shows helpful hint when no windows are on workspace S

## Requirements

- [AeroSpace](https://github.com/nikitabobko/AeroSpace) tiling window manager installed via Homebrew (expected at `/opt/homebrew/bin/aerospace`)
- [Raycast](https://raycast.com/) application launcher
- macOS (with Accessibility permissions for AeroSpace)

## Usage

1. Open Raycast and search for "Search Scratchpad"
2. Browse the list of windows currently on workspace S
3. Select a window to move it to your current workspace and focus it

## Setup

1. Install AeroSpace and ensure it's running
2. Grant Accessibility permissions to AeroSpace in System Preferences
3. Install this Raycast extension
4. Use the "Search Scratchpad" command from Raycast
