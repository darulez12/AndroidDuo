export async function captureLayer(
  node: HTMLElement,
  pixelRatio: number,
): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import("html2canvas-pro");
  const width = Math.max(1, Math.round(node.offsetWidth));
  const height = Math.max(1, Math.round(node.offsetHeight));
  return html2canvas(node, {
    scale: pixelRatio,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    backgroundColor: "#f2f2f7",
    useCORS: true,
    logging: false,
    imageTimeout: 4000,
    foreignObjectRendering: false,
    onclone: (_document, cloned) => {
      cloned.style.opacity = "1";
      cloned.style.visibility = "visible";
      cloned.style.transform = "none";
    },
  });
}
