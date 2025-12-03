import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";
import { useEffect, useState } from "react";
import React from "react";

interface AeroSpaceWindow {
  id: string;
  appName: string;
  title: string;
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

      const workspace = await runAppleScript(
        "do shell script \"/opt/homebrew/bin/aerospace list-workspaces --focused --format '%{workspace}'\"",
      );
      setCurrentWorkspace(workspace.trim());

      const windowsOutput = await runAppleScript(
        "do shell script \"/opt/homebrew/bin/aerospace list-windows --workspace S --format '%{window-id}%{tab}%{app-name}%{tab}%{window-title}'\"",
      );

      const lines = windowsOutput.trim().split(/\r|\n/).filter(Boolean);
      const parsed = lines.map((line) => {
        const [id, appName, title] = line.split("\t");
        return { id, appName, title };
      });

      setWindows(parsed);
    } catch {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to load windows",
        message: "Check that AeroSpace is running",
      });
      setWindows([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function moveWindow(windowId: string) {
    try {
      await runAppleScript(
        `do shell script "/opt/homebrew/bin/aerospace move-node-to-workspace ${currentWorkspace} --window-id ${windowId}"`,
      );
      await runAppleScript(`do shell script "/opt/homebrew/bin/aerospace focus --window-id ${windowId}"`);

      showToast({
        style: Toast.Style.Success,
        title: "Window moved",
      });

      loadWindows();
    } catch {
      showToast({
        style: Toast.Style.Failure,
        title: "Failed to move window",
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
