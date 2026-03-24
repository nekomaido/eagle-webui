import { IconFile } from "@tabler/icons-react";
import { getExtensionLabel } from "@/utils/item";
import classes from "./UnsupportedMediaFallback.module.css";

interface UnsupportedMediaFallbackProps {
  ext: string;
  variant: "grid" | "viewer";
}

export function UnsupportedMediaFallback({
  ext,
  variant,
}: UnsupportedMediaFallbackProps) {
  const iconSize = variant === "grid" ? 28 : 56;
  const label = getExtensionLabel(ext) || "FILE";

  return (
    <div
      className={`${classes.root} ${variant === "grid" ? classes.grid : classes.viewer}`}
      data-testid="unsupported-media-fallback"
    >
      <div className={classes.content}>
        <IconFile size={iconSize} stroke={1.4} />
        <span className={classes.label}>{label}</span>
      </div>
    </div>
  );
}
