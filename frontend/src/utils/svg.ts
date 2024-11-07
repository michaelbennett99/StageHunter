export function getTextWidth(text: string, fontSize: number): number {
  // Create temporary SVG element
  const svg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const textElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  );

  // Set the text and styling
  textElement.textContent = text;
  textElement.style.fontSize = `${fontSize}px`;

  // Add to DOM temporarily to measure
  svg.appendChild(textElement);
  document.body.appendChild(svg);

  // Get the width
  const width = textElement.getComputedTextLength();

  // Clean up
  document.body.removeChild(svg);

  return width;
}
