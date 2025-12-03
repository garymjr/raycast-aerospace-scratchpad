import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { useEffect, useState } from "react";
import React from "react";

interface AeroSpaceWindow {
  id: string;
  appName: string;
  title: string;
}

let cachedAerospacePath: string | null = null;

async function getAerospacePath(): Promise<string> {
  if (cachedAerospacePath) {
    return cachedAerospacePath;
  }

  const commonPaths = ["/opt/homebrew/bin/aerospace", "/usr/local/bin/aerospace", "/opt/aerospace/bin/aerospace"];

  for (const path of commonPaths) {
    try {
      await runAppleScript(`do shell script "test -x '${path}'"`);
      cachedAerospacePath = path;
      return path;
    } catch {
      continue;
    }
  }

  try {
    const whichOutput = await runAppleScript(
      'do shell script "PATH=$PATH:/opt/homebrew/bin:/usr/local/bin which aerospace"',
    );
    const path = whichOutput.trim();
    if (path) {
      cachedAerospacePath = path;
      return path;
    }
  } catch {
    // PATH search failed
  }

  throw new Error("AeroSpace not found. Please install AeroSpace (brew install aerospace) or ensure it's in your PATH");
}

export default function Command() {
  const [windows, setWindows] = useState<AeroSpaceWindow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState("");

  useEffect(() => {
    loadWindows();
  }, []);

  async function loadWindows() {
    try {
      setIsLoading(true);
      const aerospacePath = await getAerospacePath();

      const workspace = await runAppleScript(
        `do shell script "${aerospacePath} list-workspaces --focused --format '%{workspace}'"`,
      );
      setCurrentWorkspace(workspace.trim());

      const windowsOutput = await runAppleScript(
        `do shell script "${aerospacePath} list-windows --workspace S --format '%{window-id}%{tab}%{app-name}%{tab}%{window-title}'"`,
      );

      const lines = windowsOutput.trim().split(/\r|\n/).filter(Boolean);
      const parsed = lines.map((line) => {
        const [id, appName, title] = line.split("\t");
        return { id, appName, title };
      });

      setWindows(parsed);
    } catch (error) {
      let title = "Failed to load windows";
      let message = "Check that AeroSpace is running";

      if (error instanceof Error && error.message.includes("AeroSpace not found")) {
        title = "AeroSpace not found";
        message = "Install AeroSpace (brew install aerospace) or ensure it's in your PATH";
      }

      showToast({
        style: Toast.Style.Failure,
        title,
        message,
      });
      setWindows([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function moveWindow(windowId: string) {
    try {
      const aerospacePath = await getAerospacePath();
      await runAppleScript(
        `do shell script "${aerospacePath} move-node-to-workspace ${currentWorkspace} --window-id ${windowId}"`,
      );
      await runAppleScript(`do shell script "${aerospacePath} focus --window-id ${windowId}"`);

      showToast({
        style: Toast.Style.Success,
        title: "Window moved",
      });

      loadWindows();
    } catch (error) {
      let title = "Failed to move window";
      let message = "";

      if (error instanceof Error && error.message.includes("AeroSpace not found")) {
        title = "AeroSpace not found";
        message = "Install AeroSpace (brew install aerospace) or ensure it's in your PATH";
      }

      showToast({
        style: Toast.Style.Failure,
        title,
        message,
      });
    }
  }

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search scratchpad windows...">
      {windows.length === 0 && !isLoading ? (
        <List.Item
          title="No windows on workspace S"
          subtitle="Open some apps on workspace S to see them here"
          icon="📝"
        />
      ) : (
        windows.map((window) => (
          <List.Item
            key={window.id}
            title={window.title}
            subtitle={window.appName}
            icon={Icon.Window}
            actions={
              <ActionPanel>
                <Action title={`Move to Workspace ${currentWorkspace}`} onAction={() => moveWindow(window.id)} />
              </ActionPanel>
            }
          />
        ))
      )}
    </List>
  );
}
