'use client';

import { TouchEvent, useEffect, useRef, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import { TouchCircle } from './touch-circle';
import { TouchTracker, TouchTrackerManager } from './touch-tracker-manager';
import { Controls, TeamMode } from './controls';
import { CountdownDisplay } from './countdown-display';
import { ColorIndicator } from './color-manager';

export type PickerState = 'idle' | 'countdown' | 'picked' | 'resetable';

const COUNTDOWN_LENGTH_MS = 3500;
const SHOW_DEBUG_INFO = process.env.SHOW_DEBUG_INFO === 'true';

export const PickerArea: React.FC = () => {
    const [pickerState, setPickerState] = useState<PickerState>('idle');
    const [touchTrackers, setTouchTrackers] = useState<TouchTracker[]>([]);
    const [teamsMode, setTeamsMode] = useState<TeamMode>('none');
    const [stickyMode, setStickyMode] = useState(false);
    const [isControlLocked, setIsControlLocked] = useState(false);
    const [colorIndicators, setColorIndicators] = useState<ColorIndicator[]>();

    const trackerManager = useRef(new TouchTrackerManager()).current;

    useEffect(() => {
        setColorIndicators(trackerManager.getColorManager().getColorIndicators());
    }, []);

    const onTeamModeChange = (newTeamMode: TeamMode) => {
        trackerManager.removeAllTrackers();
        updateGameState();

        setTeamsMode(newTeamMode);
    };

    const onStickyModeChange = (newStickyMode: boolean) => {
        trackerManager.removeAllTrackers();
        updateGameState();

        setStickyMode(newStickyMode);
    };

    const onCountdownEnd = () => {
        if (pickerState === 'countdown') {
            if (teamsMode === 'none') {
                trackerManager.rankTrackers();
            } else {
                trackerManager.assignTeams(teamsMode);
            }

            trackerManager.deactivateAllTrackers();
            updateGameState();

            setPickerState(trackerManager.getLiveTrackers().length > 0 ? 'picked' : 'resetable');
        }
    };

    const { isRunning, totalMilliseconds, pause, restart } = useTimer({
        expiryTimestamp: new Date(),
        autoStart: false,
        onExpire: onCountdownEnd,
        interval: 100,
    });

    const onTouchStart = (e: TouchEvent) => {
        e.preventDefault();

        if (pickerState === 'picked') {
            return;
        }

        for (const touch of Array.from(e.changedTouches)) {
            trackerManager.addTracker(touch.identifier, touch.clientX, touch.clientY, teamsMode === 'none');
        }

        updateGameState();
    };

    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();

        for (const touch of Array.from(e.changedTouches)) {
            trackerManager.updateTrackerPosition(touch.identifier, touch.clientX, touch.clientY);
        }

        updateGameState();
    };

    const onTouchEnd = (e: TouchEvent) => {
        e.preventDefault();

        for (const touch of Array.from(e.changedTouches)) {
            trackerManager.killTracker(touch.identifier);
        }

        updateGameState();
    };

    const restartCountdown = () => {
        const time = new Date();
        time.setMilliseconds(time.getMilliseconds() + COUNTDOWN_LENGTH_MS);

        restart(time, true);
        setPickerState('countdown');
        trackerManager.resetTrackerRanks();
    };

    const updateGameState = () => {
        switch (pickerState) {
            case 'idle':
                if (!stickyMode) {
                    trackerManager.removeDeadTrackers();
                }

                if (trackerManager.getTrackers().length > 1) {
                    restartCountdown();
                }
                break;
            case 'countdown':
                if (!stickyMode) {
                    trackerManager.removeDeadTrackers();
                }

                if (trackerManager.getTrackers().length !== touchTrackers.length) {
                    if (trackerManager.getTrackers().length > 1) {
                        restartCountdown();
                    } else {
                        pause();
                        setPickerState('idle');
                    }
                }
                break;
            case 'picked':
                if (trackerManager.getLiveTrackers().length === 0) {
                    setPickerState('resetable');
                }
                break;
            case 'resetable':
                if (trackerManager.getTrackers().length > 0) {
                    trackerManager.removeDeadTrackers();
                    setPickerState('idle');
                }
                break;
        }

        setTouchTrackers(trackerManager.getTrackers());
        setColorIndicators(trackerManager.getColorManager().getColorIndicators());
        setIsControlLocked(trackerManager.getLiveTrackers().length > 0);
    };

    return (
        <div id="container" className="flex h-screen bg-neutral-700">
            {SHOW_DEBUG_INFO && (
                <div className="absolute top-0 left-0 right-0 z-20 p-2 text-xs font-mono text-white/60 pointer-events-none">state: {pickerState}</div>
            )}
            <div
                id="interaction-area"
                className="flex-1 touch-none pointer-none select-none"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >
                {touchTrackers.map(({ id, x, y, color, rank }) => (
                    <TouchCircle key={`touch-tracker-${id}`} x={x} y={y} color={color} rank={rank} />
                ))}
                {isRunning && (
                    <div className="absolute touch-none pointer-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <CountdownDisplay millis={totalMilliseconds} />
                    </div>
                )}
            </div>
            <Controls
                disabled={isControlLocked}
                teamMode={teamsMode}
                onTeamModeChange={onTeamModeChange}
                stickyMode={stickyMode}
                onStickyModeChange={onStickyModeChange}
                colorIndicators={colorIndicators ?? []}
            />
        </div>
    );
};
