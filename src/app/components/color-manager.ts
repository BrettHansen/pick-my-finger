export interface ColorIndicator {
    color: string;
    isAvailable: boolean;
}

export class ColorManager {
    private COLORS = ['red', 'yellow', 'green', 'blue', 'black', 'grey'];

    private availableColors = [...this.COLORS];
    private idColorMap = new Map<number, string>();
    private defaultColor = 'white';

    public getDefaultColor = () => this.defaultColor;

    public getColorIndicators = (): ColorIndicator[] => {
        const assignedColors = new Set([...this.idColorMap.values()]);
        return this.COLORS.map((color) => ({
            color,
            isAvailable: !assignedColors.has(color),
        }));
    };

    public getColor = (id: number) => {
        return this.idColorMap.getOrInsertComputed(id, () => this.availableColors.shift() ?? this.getDefaultColor());
    };

    public releaseColor = (id: number) => {
        const color = this.idColorMap.get(id);

        if (color) {
            if (color !== this.getDefaultColor()) {
                this.availableColors.unshift(color);
            }

            this.idColorMap.delete(id);
        }
    };

    public releaseAllColors = () => {
        this.idColorMap.keys().forEach((id) => this.releaseColor(id));
    };
}
