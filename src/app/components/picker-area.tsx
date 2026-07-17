'use client';

import { TouchEvent, useRef, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import { TouchCircle } from './touch-tracker';
import { TouchTracker, TouchTrackerManager } from './touch-tracker-manager';

export type PickerState = 'idle' | 'countdown' | 'picked' | 'reset';

const COUNTDOWN_LENGTH_MS = 4000;

export const PickerArea: React.FC = () => {
    const [pickerState, setPickerState] = useState<PickerState>('idle');
    const [touchTrackers, setTouchTrackers] = useState<TouchTracker[]>([]);

    const trackerManager = useRef(new TouchTrackerManager()).current;

    const onCountdownEnd = () => {
        if (pickerState === 'countdown') {
            trackerManager.rankTrackers();
            setTouchTrackers(trackerManager.getTrackers());
            setPickerState('picked');
        }
    };

    const { isRunning, seconds, pause, restart } = useTimer({
        expiryTimestamp: new Date(),
        autoStart: false,
        onExpire: onCountdownEnd,
        interval: 30,
    });

    const onTouchStart = (e: TouchEvent) => {
        e.preventDefault();

        if (pickerState === 'picked') {
            return;
        }

        for (let index = 0; index < e.changedTouches.length; index += 1) {
            const touch = e.changedTouches.item(index);
            trackerManager.addTracker(touch.identifier, touch.clientX, touch.clientY);
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

        setTouchTrackers(trackerManager.getTrackers());
    };

    const updateGameState = () => {
        switch (pickerState) {
            case 'idle':
                trackerManager.removeInactiveTrackers();

                if (trackerManager.getTrackers().length > 1) {
                    restartCountdown();
                }
                break;
            case 'countdown':
                trackerManager.removeInactiveTrackers();

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
    };

    return (
        <div id="container" className="flex h-screen">
            <div
                id="interaction-area"
                className="flex-1 touch-none pointer-none select-none bg-gray-200"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
            >
                {touchTrackers.map(({ id, x, y, color, rank }) => (
                    <TouchCircle key={`touch-tracker-${id}`} x={x} y={y} color={color} rank={rank} state="neutral" />
                ))}
                {isRunning && seconds < COUNTDOWN_LENGTH_MS / 1000 && (
                    <div className="absolute touch-none pointer-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-sans text-white">
                        {seconds}
                    </div>
                )}
            </div>
        </div>
    );
};
