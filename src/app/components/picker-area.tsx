'use client';

import { Touch, TouchEvent, useState } from 'react';
import { useTimer } from 'react-timer-hook';

const componentToHex = (component: number) => {
    const hex = component.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
};

const rgbToHex = (transparency: number) =>
    `#${componentToHex(transparency)}${componentToHex(transparency)}${componentToHex(transparency)}`;

type PickerState = 'idle' | 'countdown' | 'picked' | 'display-winner';

interface TouchTracker {
    x: number;
    y: number;
    color: string;
}

const COUNTDOWN_LENGTH_MS = 4000;
const TOUCH_TARGET_COLORS = ['#E50000', '#FF8D00', '#FFEE00', '#028121', '#004CFF', '#770088'];

export const PickerArea: React.FC = () => {
    const [debugMessages, setDebugMessages] = useState<string[]>([]);

    const [pickerState, setPickerState] = useState<PickerState>('idle');
    const [touchTrackers, setTouchTrackers] = useState<TouchTracker[]>([]);

    const onCountdownEnd = () => {
        if (pickerState === 'countdown') {
            const pickedTouchTrackerIndex = Math.floor(Math.random() * touchTrackers.length);

            setTouchTrackers([touchTrackers[pickedTouchTrackerIndex]]);
            setPickerState('picked');
        }
    };

    const { isRunning, seconds, totalMilliseconds, pause, restart } = useTimer({
        expiryTimestamp: new Date(),
        autoStart: false,
        onExpire: onCountdownEnd,
        interval: 30,
    });

    const restartCountdown = (touches: Touch[]) => {
        const time = new Date();
        time.setMilliseconds(time.getMilliseconds() + COUNTDOWN_LENGTH_MS);

        restart(time, true);

        setPickerState('countdown');
        updateTouchTrackers(touches);
    };

    const cancelCountdown = (touches: Touch[]) => {
        pause();

        setPickerState('idle');
        updateTouchTrackers(touches);
    };

    const updateTouchTrackers = (touches: Touch[]) => {
        setTouchTrackers(
            touches.map(({ clientX, clientY }, index) => ({
                x: clientX,
                y: clientY,
                color: TOUCH_TARGET_COLORS[index],
            })),
        );
    };

    const displayWinner = () => {
        setPickerState('display-winner');
    };

    const resetPicker = (touches: Touch[]) => {
        updateTouchTrackers(touches);
        setPickerState('idle');
    };

    const onTouchEvent = (e: TouchEvent) => {
        const touches: Touch[] = [];

        for (let index = 0; index < e.touches.length; index += 1) {
            touches.push(e.touches.item(index));
        }
        setDebugMessages(
            touches.map(
                ({ clientX, clientY }, index) =>
                    `${TOUCH_TARGET_COLORS[index]}: ${Math.round(clientX)}, ${Math.round(clientY)}`,
            ),
        );

        switch (pickerState) {
            case 'idle':
                if (touches.length > 1) {
                    restartCountdown(touches);
                } else {
                    updateTouchTrackers(touches);
                }
                break;
            case 'countdown':
                if (touches.length !== touchTrackers.length) {
                    if (touches.length > 1) {
                        restartCountdown(touches);
                    } else {
                        cancelCountdown(touches);
                    }
                } else {
                    updateTouchTrackers(touches);
                }
                break;
            case 'picked':
                if (touches.length === 0) {
                    displayWinner();
                }
                break;
            case 'display-winner':
                if (touches.length > 0) {
                    resetPicker(touches);
                }
                break;
        }
    };

    const containerBackgroundColor = (() => {
        switch (pickerState) {
            case 'idle':
                return '#000000';
            case 'countdown':
                return rgbToHex(Math.floor((1 - totalMilliseconds / COUNTDOWN_LENGTH_MS) * 255));
            case 'picked':
            case 'display-winner':
                return '#ffffff';
        }
    })();

    return (
        <div id="container" className="flex h-screen">
            <div
                id="interaction-area"
                className="flex-1 touch-none pointer-none select-none"
                onTouchStart={onTouchEvent}
                onTouchMove={onTouchEvent}
                onTouchEnd={onTouchEvent}
                onTouchCancel={onTouchEvent}
                style={{ backgroundColor: containerBackgroundColor }}
            >
                {touchTrackers.map(({ x, y, color }, index) => (
                    <TouchTracker key={`touch-tracker-${index}`} x={x} y={y} color={color} />
                ))}
            </div>
            <div
                id="debug-area"
                className="absolute top-0 w-screen touch-none pointer-none select-none whitespace-pre bg-gray-800 text-white"
            >
                <code>
                    {[pickerState, isRunning ? `picking in: ${seconds}s` : 'waiting...', ...debugMessages].join('\n')}
                </code>
            </div>
        </div>
    );
};

interface TouchTrackerProps {
    x: number;
    y: number;
    color: string;
}

const SIZE = 100;

const TouchTracker: React.FC<TouchTrackerProps> = ({ x, y, color }) => {
    const top = y - SIZE / 2;
    const left = x - SIZE / 2;

    return (
        <div
            className="absolute touch-none pointer-none"
            style={{ top, left, width: SIZE, height: SIZE, borderRadius: SIZE, backgroundColor: color }}
        />
    );
};
