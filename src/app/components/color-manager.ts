export interface ColorIndicator {
    color: string;
    isAvailable: boolean;
}

interface ColorRegister {
    color: string;
    id: number | undefined;
}

export class ColorManager {
    private COLORS = ['red', 'yellow', 'green', 'blue', 'black', 'grey'];

    private colorRegistry = this.COLORS.map<ColorRegister>((color) => ({ color, id: undefined }));
    private idColorMap = new Map<number, string>();
    private defaultColor = 'white';

    public getDefaultColor = () => this.defaultColor;

    public getColorIndicators = () => this.colorRegistry.map(({ color, id }) => ({ color, isAvailable: !id }));

    private assignNextColor = (id: number) => {
        const unassignedColorIndex = this.colorRegistry.findIndex(({ id }) => id === undefined);

        if (unassignedColorIndex !== -1) {
            this.colorRegistry[unassignedColorIndex].id = id;
            return this.colorRegistry[unassignedColorIndex].color;
        } else {
            return this.getDefaultColor();
        }
    };

    public getColor = (id: number) => {
        return this.idColorMap.getOrInsertComputed(id, this.assignNextColor);
    };

    public releaseColor = (id: number) => {
        const color = this.idColorMap.get(id);

        if (color) {
            const register = this.colorRegistry.find((register) => register.id === id);

            if (register) {
                register.id = undefined;
            }

            this.idColorMap.delete(id);
        }
    };

    public releaseAllColors = () => {
        this.idColorMap.clear();
        this.colorRegistry.forEach((register) => (register.id = undefined));
    };
}
