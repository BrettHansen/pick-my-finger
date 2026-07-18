'use client';

import { TouchEvent, useRef, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import { TouchCircle } from './touch-circle';
import { TouchTracker, TouchTrackerManager } from './touch-tracker-manager';
import { Controls, TeamMode } from './controls';
import { CountdownDisplay } from './countdown-display';

export type PickerState = 'idle' | 'countdown' | 'picked' | 'reset';

const COUNTDOWN_LENGTH_MS = 3500;

export const PickerArea: React.FC = () => {
    const [pickerState, setPickerState] = useState<PickerState>('idle');
    const [touchTrackers, setTouchTrackers] = useState<TouchTracker[]>([]);
    const [teamsMode, setTeamsMode] = useState<TeamMode>('none');
    const [stickyMode, setStickyMode] = useState(false);
    const [isControlLocked, setIsControlLocked] = useState(false);

    const trackerManager = useRef(new TouchTrackerManager()).current;

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

            setPickerState('picked');
            updateGameState();
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

        for (let index = 0; index < e.changedTouches.length; index += 1) {
            const touch = e.changedTouches.item(index);
            trackerManager.addTracker(touch.identifier, touch.clientX, touch.clientY, teamsMode === 'none');
        }

        updateGameState();
    };

    const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();

        for (let index = 0; index < e.changedTouches.length; index += 1) {
            const touch = e.changedTouches.item(index);
            trackerManager.updateTrackerPosition(touch.identifier, touch.clientX, touch.clientY);
        }

        updateGameState();
    };

    const onTouchEnd = (e: TouchEvent) => {
        e.preventDefault();

        for (let index = 0; index < e.changedTouches.length; index += 1) {
            const touch = e.changedTouches.item(index);
            trackerManager.deactivateTracker(touch.identifier);
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
                    trackerManager.removeInactiveTrackers();
                }

                if (trackerManager.getTrackers().length > 1) {
                    restartCountdown();
                }
                break;
            case 'countdown':
                if (!stickyMode) {
                    trackerManager.removeInactiveTrackers();
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
                if (trackerManager.getActiveTrackers().length === 0) {
                    setPickerState('reset');
                }
                break;
            case 'reset':
                if (trackerManager.getTrackers().length > 0) {
                    trackerManager.removeInactiveTrackers();
                    setPickerState('idle');
                }
                break;
        }

        setTouchTrackers(trackerManager.getTrackers());
        setIsControlLocked(trackerManager.getActiveTrackers().length > 0);
    };

    return (
        <div id="container" className="flex h-screen bg-neutral-700">
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
            />
        </div>
    );
};
