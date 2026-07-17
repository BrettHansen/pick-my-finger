export class ColorManager {
    private COLORS = ['red', 'yellow', 'green', 'blue', 'black', 'grey'];

    private availableColors = [...this.COLORS];
    private idColorMap: Record<number, string> = {};

    getColor = (id: number) => {
        if (id in this.idColorMap) {
            return this.idColorMap[id];
        }

        const color = this.availableColors.shift() ?? 'white';
        this.idColorMap[id] = color;

        return color;
    };

    releaseColor = (id: number) => {
        if (id in this.idColorMap) {
            const color = this.idColorMap[id];

            delete this.idColorMap[id];
            this.availableColors.unshift(color);
        }
    };
}
