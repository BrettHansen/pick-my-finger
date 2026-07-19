import { ColorManager } from './color-manager';

export interface TouchTracker {
    id: number;
    x: number;
    y: number;
    color: string;
    active: boolean;
    live: boolean;
    rank?: number;
    teamId?: number;
}

export class TouchTrackerManager {
    private touchTrackers = new Map<number, TouchTracker>();
    private colorManager = new ColorManager();

    public getTrackers = () => [...this.touchTrackers.values()];

    public getActiveTrackers = () => this.getTrackers().filter(({ active }) => active);

    public getLiveTrackers = () => this.getTrackers().filter(({ live }) => live);

    public addTracker = (id: number, x: number, y: number, assignColor: boolean = true) => {
        this.touchTrackers.set(id, {
            id,
            x,
            y,
            active: true,
            live: true,
            color: assignColor ? this.colorManager.getColor(id) : this.colorManager.getDefaultColor(),
        });
    };

    public updateTrackerPosition = (id: number, x: number, y: number) => {
        const existingTracker = this.touchTrackers.get(id);
        if (existingTracker) {
            existingTracker.x = x;
            existingTracker.y = y;
        }
    };

    public killTracker = (id: number) => {
        const existingTracker = this.touchTrackers.get(id);
        if (existingTracker) {
            existingTracker.live = false;
        }
    };

    public deactivateTracker = (id: number) => {
        const existingTracker = this.touchTrackers.get(id);
        if (existingTracker) {
            existingTracker.active = false;
            this.colorManager.releaseColor(id);

            if (existingTracker.teamId !== undefined) {
                this.colorManager.releaseColor(existingTracker.teamId);
            }
        }
    };

    public deactivateAllTrackers = () => {
        this.touchTrackers.forEach(({ id }) => this.deactivateTracker(id));
    };

    public removeTracker = (id: number) => {
        this.deactivateTracker(id);
        this.touchTrackers.delete(id);
    };

    public removeDeadTrackers = () => {
        this.touchTrackers.forEach(({ id, live }) => {
            if (!live) {
                this.removeTracker(id);
            }
        });
    };

    public getColorManager = () => this.colorManager;

    public removeAllTrackers = () => {
        this.touchTrackers.forEach(({ id }) => this.removeTracker(id));
    };

    public rankTrackers = () => {
        this.getShuffledTrackers().forEach(([tracker], index) => (tracker.rank = index));
    };

    public resetTrackerRanks = () => {
        this.touchTrackers.forEach((tracker) => (tracker.rank = undefined));
    };

    public assignTeams = (numberOfTeams: number) => {
        this.getShuffledTrackers().forEach(([tracker], index) => {
            const teamId = index % numberOfTeams;
            const teamColor = this.colorManager.getColor(teamId);
            tracker.teamId = teamId;
            tracker.rank = index % numberOfTeams;
            tracker.color = teamColor;
        });
    };

    private getShuffledTrackers = () => {
        const shuffledTrackers = [...this.touchTrackers.values().map<[TouchTracker, number]>((tracker) => [tracker, Math.random()])];
        shuffledTrackers.sort((a, b) => a[1] - b[1]);
        return shuffledTrackers;
    };
}
