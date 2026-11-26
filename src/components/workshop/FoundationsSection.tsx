import type { ResolvedTheme } from '../../utils/appearance';
import type {
  DecisionStatus,
  VisualPaletteId,
} from '../../utils/workshopStore';
import { ColourThemesFoundation } from './ColourThemesFoundation';
import { SpacingLayoutFoundation } from './SpacingLayoutFoundation';
import { SurfacesElevationFoundation } from './SurfacesElevationFoundation';
import { TypographyFoundation } from './TypographyFoundation';

export type FoundationsView =
  | 'all'
  | 'colour-themes'
  | 'typography'
  | 'spacing-layout'
  | 'surfaces-elevation';

interface FoundationsSectionProps {
  view?: FoundationsView;
  sandboxPalette: VisualPaletteId;
  sandboxTheme: ResolvedTheme;
  onChangeSandboxPalette: (palette: VisualPaletteId) => void;
  onChangeSandboxTheme: (theme: ResolvedTheme) => void;
  onLogDecision: (payload: {
    subjectType: 'palette' | 'appearance';
    subjectId: string;
    title: string;
    variantLabel: string;
    status: DecisionStatus;
    parameters: Record<string, string | number | boolean>;
    rationale: string;
  }) => void;
}

export function FoundationsSection({
  view = 'all',
  sandboxPalette,
  sandboxTheme,
  onChangeSandboxPalette,
  onChangeSandboxTheme,
  onLogDecision,
}: FoundationsSectionProps) {
  if (view === 'colour-themes') {
    return (
      <ColourThemesFoundation
        sandboxPalette={sandboxPalette}
        sandboxTheme={sandboxTheme}
        onChangeSandboxPalette={onChangeSandboxPalette}
        onChangeSandboxTheme={onChangeSandboxTheme}
        onLogDecision={onLogDecision}
      />
    );
  }

  if (view === 'typography') {
    return <TypographyFoundation />;
  }

  if (view === 'spacing-layout') {
    return <SpacingLayoutFoundation />;
  }

  if (view === 'surfaces-elevation') {
    return (
      <SurfacesElevationFoundation
        sandboxPalette={sandboxPalette}
        sandboxTheme={sandboxTheme}
      />
    );
  }

  return (
    <div className="space-y-20">
      <ColourThemesFoundation
        sandboxPalette={sandboxPalette}
        sandboxTheme={sandboxTheme}
        onChangeSandboxPalette={onChangeSandboxPalette}
        onChangeSandboxTheme={onChangeSandboxTheme}
        onLogDecision={onLogDecision}
      />
      <div className="border-t border-[var(--apple-separator)] pt-16">
        <TypographyFoundation />
      </div>
      <div className="border-t border-[var(--apple-separator)] pt-16">
        <SpacingLayoutFoundation />
      </div>
      <div className="border-t border-[var(--apple-separator)] pt-16">
        <SurfacesElevationFoundation
          sandboxPalette={sandboxPalette}
          sandboxTheme={sandboxTheme}
        />
      </div>
    </div>
  );
}
