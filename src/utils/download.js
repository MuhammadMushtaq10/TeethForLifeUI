// Triggers a browser download for a blob received from an axios { responseType: 'blob' } request.
// Centralised so every "Download PDF" button behaves identically (STEP 7).
export function downloadBlob(data, filename) {
  const href = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
