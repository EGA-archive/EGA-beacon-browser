// Downloads table as a CSV file
// This function reads the table exactly as it is rendered in the UI

export const downloadCSV = (tableContainer, filename = "table.csv") => {
  // Safety check: if the container ref is missing, do nothing
  if (!tableContainer) return;

  // Find the <table> element inside the container
  const table = tableContainer.querySelector("table");
  if (!table) return;

  // Collect all table rows (<tr>), including header and body rows
  const rows = Array.from(table.querySelectorAll("tr"));

  // Build the CSV content row by row
  const csv = rows
    .map((row) => {
      const cells = row.querySelectorAll("th, td");

      // Detect liftover dataset row via icon
      const isLiftedDataset =
        row.querySelector('img[alt="lifted-over"]') !== null;

      return Array.from(cells)
        .map((cell, index) => {
          let text = cell.innerText.replace(/"/g, '""').trim();

          // Add liftover tag only to the dataset label cell
          if (isLiftedDataset && index === 0) {
            text = `${text} - Lifted-over`;
          }

          return `"${text}"`;
        })
        .join(",");
    })
    .join("\n");

  // Create a Blob containing the CSV data
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary <a> element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Append the link, trigger the download, then clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
