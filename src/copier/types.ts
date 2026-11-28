export interface CopierFontSpec {
  fontFamily?: string;
  fontWeight?: number | string;
  fontStyle?: string;
}

export interface CopierThemePalette {
  body?: string;
  tray?: string;
  accent?: string;
  paper?: string;
  ink?: string;
  shadow?: string;
  strength?: number;
}

export interface CopierProps {
  label?: string;
  value?: string;
  mark?: string;
  theme?: 'light' | 'dark' | 'auto';
  light?: CopierThemePalette;
  dark?: CopierThemePalette;
  sound?: boolean;
  haptics?: boolean;
  keepCopies?: boolean;
  canvasState?: 'rest' | 'tray';
  valueFont?: CopierFontSpec;
  labelFont?: CopierFontSpec;
  onCopy?: (copiedValue: string) => void;
  className?: string;
}
