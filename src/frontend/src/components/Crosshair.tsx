export function Crosshair() {
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "white",
        fontSize: 28,
        fontWeight: 100,
        userSelect: "none",
        pointerEvents: "none",
        textShadow:
          "1px 1px 3px rgba(0,0,0,0.8), -1px -1px 3px rgba(0,0,0,0.8)",
        lineHeight: 1,
        zIndex: 100,
      }}
    >
      +
    </div>
  );
}
