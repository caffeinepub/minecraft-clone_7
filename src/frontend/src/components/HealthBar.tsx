interface HealthBarProps {
  health?: number;
}

export function HealthBar({ health = 20 }: HealthBarProps) {
  return (
    <div
      data-ocid="hud.panel"
      style={{
        position: "fixed",
        bottom: 92,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 1,
        zIndex: 100,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {Array.from({ length: 10 }, (_, i) => {
        const full = health >= (i + 1) * 2;
        const half = health === i * 2 + 1;
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: static 10-heart array, never reordered
            key={i}
            style={{
              fontSize: 16,
              lineHeight: 1,
              filter: full
                ? "none"
                : half
                  ? "grayscale(50%)"
                  : "grayscale(100%) brightness(0.4)",
            }}
          >
            ❤️
          </span>
        );
      })}
    </div>
  );
}
