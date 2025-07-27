#!/usr/bin/env -S deno run --allow-run

/**
 * Calculate the total storage used by all Ollama models
 * @returns {string} Total size with appropriate unit
 */
async function getOllamaTotal() {
  try {
    // Run the ollama list command
    const command = new Deno.Command("ollama", {
      args: ["list"],
      stdout: "piped",
    });

    const { stdout } = await command.output();
    const output = new TextDecoder().decode(stdout);

    // Skip the header line and process the output
    const lines = output.trim().split("\n").slice(1);

    // Regular expression to match size values like "2.7 GB", "17 GB", "800 MB", etc.
    const sizePattern = /(\d+(?:\.\d+)?) (MB|GB|TB)/;

    let totalBytes = 0;

    // Process each line
    for (const line of lines) {
      const match = line.match(sizePattern);
      if (match) {
        const sizeValue = parseFloat(match[1]);
        const sizeUnit = match[2];

        // Convert to bytes for consistent calculation
        switch (sizeUnit) {
          case "MB":
            totalBytes += sizeValue * 1000000;
            break;
          case "GB":
            totalBytes += sizeValue * 1000000000;
            break;
          case "TB":
            totalBytes += sizeValue * 1000000000000;
            break;
        }
      }
    }

    // Convert back to the most appropriate unit with one decimal place
    if (totalBytes >= 1000000000000) {
      return `Total Ollama models' size: ${(totalBytes / 1000000000000).toFixed(1)} TB`;
    } else if (totalBytes >= 1000000000) {
      return `Total Ollama models' size: ${(totalBytes / 1000000000).toFixed(1)} GB`;
    } else if (totalBytes >= 1000000) {
      return `Total Ollama models' size: ${(totalBytes / 1000000).toFixed(1)} MB`;
    } else {
      return `Total Ollama models' size: ${totalBytes} B`;
    }
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

// Output the result when run directly
if (import.meta.main) {
  console.log(await getOllamaTotal());
}

// Export for use as a module
export { getOllamaTotal };
