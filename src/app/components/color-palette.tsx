'use client';

import type { ColorIndicator } from './color-manager';

interface ColorPaletteProps {
    colorIndicators: ColorIndicator[];
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ colorIndicators }) => {
    return (
        <div className="flex items-center gap-1.5">
            {colorIndicators.map(({ color, isAvailable }) => (
                <div
                    key={color}
                    className="w-3 h-3 rounded-full border border-white/20 transition-opacity duration-150"
                    style={{
                        backgroundColor: color,
                        opacity: isAvailable ? 1 : 0.25,
                    }}
                />
            ))}
        </div>
    );
};
