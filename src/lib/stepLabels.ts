// Maps shell command text to human-readable activity feed labels
export function shellCommandToStep(command: string): string {
  if (command.includes("git clone")) return "Cloning repo";
  if (command.includes("find . -type f")) return "Scanning files";
  if (command.includes("cat package.json")) return "Reading package.json";
  if (command.includes("npm ls")) return "Resolving dependencies";
  if (command.includes("lizard")) return "Computing complexity";
  return "Running command";
}

// The final step when the prompt is sent to the model
export const FINAL_STEP = "Building report";
