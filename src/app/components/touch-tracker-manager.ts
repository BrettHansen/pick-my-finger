import { ColorManager } from './color-manager';

export interface TouchTracker {
    id: number;
    x: number;
    y: number;
    color: string;
    active: boolean;
    rank?: number;
}

export class TouchTrackerManager {
    private touchTrackers = new Map<number, TouchTracker>();
    private colorManager = new ColorManager();

    getTrackers = () => [...this.touchTrackers.values()];

    getActiveTrackers = () => this.getTrackers().filter(({ active }) => active);

    addTracker = (id: number, x: number, y: number) => {
        this.touchTrackers.set(id, { id, x, y, active: true, color: this.colorManager.getColor(id) });
    };

    updateTrackerPosition = (id: number, x: number, y: number) => {
        const existingTracker = this.touchTrackers.get(id);
        if (existingTracker) {
            existingTracker.x = x;
            existingTracker.y = y;
        }
    };

    deactivateTracker = (id: number) => {
        const existingTracker = this.touchTrackers.get(id);
        if (existingTracker) {
            existingTracker.active = false;
        }
    };

    removeTracker = (id: number) => {
        this.touchTrackers.delete(id);
        this.colorManager.releaseColor(id);
    };

    removeInactiveTrackers = () => {
        this.touchTrackers.forEach(({ id, active }) => {
            if (!active) {
                this.removeTracker(id);
            }
        });
    };

    rankTrackers = () => {
        const shuffledTrackers = [...this.touchTrackers.values().map<[TouchTracker, number]>((tracker) => [tracker, Math.random()])];
        shuffledTrackers.sort((a, b) => a[1] - b[1]);
        shuffledTrackers.forEach(([tracker], index) => (tracker.rank = index));
    };

    resetTrackerRanks = () => {
        this.touchTrackers.forEach((tracker) => (tracker.rank = undefined));
    };
}
