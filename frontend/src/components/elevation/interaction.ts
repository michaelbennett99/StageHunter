export function handleSVGMouseMove(
    event: React.MouseEvent<SVGSVGElement>,
    cb: (x: number, y: number) => void
) {
    // Get the mouse position relative to the SVG element
    const svgElement = event.currentTarget;
    const rect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Call the callback with the mouse position
    cb(mouseX, mouseY);
}
