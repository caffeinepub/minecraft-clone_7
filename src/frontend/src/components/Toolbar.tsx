import {
  BLOCK_COLORS,
  BLOCK_NAMES,
  type BlockType,
  PLACEABLE_BLOCKS,
} from "../game/types";

interface ToolbarProps {
  selectedBlock: BlockType;
  onSelect: (block: BlockType) => void;
}

export function Toolbar({ selectedBlock, onSelect }: ToolbarProps) {
  return (
    <div
      data-ocid="toolbar.panel"
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 6,
        background: "rgba(0,0,0,0.7)",
        padding: "8px 12px",
        borderRadius: 8,
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(255,255,255,0.15)",
        zIndex: 100,
        userSelect: "none",
      }}
    >
      {PLACEABLE_BLOCKS.map((block, i) => {
        const isSelected = block === selectedBlock;
        return (
          <button
            key={block}
            type="button"
            data-ocid={`toolbar.item.${i + 1}`}
            onClick={() => onSelect(block)}
            style={{
              width: 56,
              height: 56,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              borderRadius: 6,
              border: isSelected
                ? "2px solid #fff"
                : "2px solid rgba(255,255,255,0.2)",
              background: isSelected
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.05)",
              transition: "all 0.1s ease",
              gap: 4,
              position: "relative",
              padding: 0,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                background: BLOCK_COLORS[block],
                borderRadius: 4,
                border: "1px solid rgba(0,0,0,0.3)",
                boxShadow: isSelected
                  ? `0 0 8px ${BLOCK_COLORS[block]}88`
                  : "none",
              }}
            />
            <span
              style={{
                color: isSelected ? "#fff" : "rgba(255,255,255,0.7)",
                fontSize: 9,
                fontFamily: "monospace",
                fontWeight: isSelected ? 700 : 400,
                letterSpacing: 0.5,
              }}
            >
              {BLOCK_NAMES[block]}
            </span>
            <span
              style={{
                position: "absolute",
                top: 3,
                left: 5,
                color: "rgba(255,255,255,0.5)",
                fontSize: 9,
                fontFamily: "monospace",
              }}
            >
              {i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}
