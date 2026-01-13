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
    id: number;
    x: number;
    y: number;
    color: string;
}

const COUNTDOWN_LENGTH_MS = 4000;
const TOUCH_TARGET_COLORS = ['#009DDC', '#F0C808', '#F26430', '#6761A8', '#009B72'];

export const PickerArea: React.FC = () => {
    const [debugMessages, setDebugMessages] = useState<string[]>([]);

    const [pickerState, setPickerState] = useState<PickerState>('idle');
    const [touchTrackers, setTouchTrackers] = useState<TouchTracker[]>([]);
    const [winnerId, setWinnerId] = useState<number>();

    const onCountdownEnd = () => {
        if (pickerState === 'countdown') {
            setWinnerId(touchTrackers[Math.floor(Math.random() * touchTrackers.length)].id);
            setPickerState('picked');
        }
    };

    const { isRunning, seconds, totalMilliseconds, pause, restart } = useTimer({
        expiryTimestamp: new Date(),
        autoStart: false,
        onExpire: onCountdownEnd,
        interval: 30,
    });

    const restartCountdown = () => {
        const time = new Date();
        time.setMilliseconds(time.getMilliseconds() + COUNTDOWN_LENGTH_MS);

        restart(time, true);
        setPickerState('countdown');
    };

    const cancelCountdown = () => {
        pause();
        setPickerState('idle');
    };

    const updateTouchTrackers = (touches: Touch[]) => {
        setTouchTrackers(
            touches.map(({ clientX, clientY, identifier }, index) => ({
                id: identifier,
                x: clientX,
                y: clientY,
                color: TOUCH_TARGET_COLORS[index],
            })),
        );
    };

    const displayWinner = () => {
        setPickerState('display-winner');
    };

    const resetPicker = () => {
        setPickerState('idle');
        setWinnerId(undefined);
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

        updateTouchTrackers(touches);

        switch (pickerState) {
            case 'idle':
                if (touches.length > 1) {
                    restartCountdown();
                }
                break;
            case 'countdown':
                if (touches.length !== touchTrackers.length) {
                    if (touches.length > 1) {
                        restartCountdown();
                    } else {
                        cancelCountdown();
                    }
                }
                break;
            case 'picked':
                if (touches.length === 0) {
                    displayWinner();
                }
                break;
            case 'display-winner':
                if (touches.length > 0) {
                    resetPicker();
                }
                break;
        }
    };

    return (
        <div id="container" className="flex h-screen">
            <div
                id="interaction-area"
                className="flex-1 touch-none pointer-none select-none bg-gray-800"
                onTouchStart={onTouchEvent}
                onTouchMove={onTouchEvent}
                onTouchEnd={onTouchEvent}
                onTouchCancel={onTouchEvent}
            >
                {touchTrackers.map(({ id, x, y, color }, index) => (
                    <TouchTracker
                        key={`touch-tracker-${index}`}
                        x={x}
                        y={y}
                        color={color}
                        state={winnerId === undefined ? 'neutral' : winnerId === id ? 'winner' : 'loser'}
                    />
                ))}
                {isRunning && seconds < COUNTDOWN_LENGTH_MS / 1000 && (
                    <div className="absolute touch-none pointer-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-sans text-white">
                        {seconds}
                    </div>
                )}
            </div>
            {/* <div
                id="debug-area"
                className="absolute top-0 w-screen touch-none pointer-none select-none whitespace-pre bg-gray-800 text-white"
            >
                <code>
                    {[pickerState, isRunning ? `picking in: ${seconds}s` : 'waiting...', ...debugMessages].join('\n')}
                </code>
            </div> */}
        </div>
    );
};

interface TouchTrackerProps {
    x: number;
    y: number;
    color: string;
    state: 'neutral' | 'loser' | 'winner';
}

const SIZE = 100;

const TouchTracker: React.FC<TouchTrackerProps> = ({ x, y, color, state }) => {
    const top = y - SIZE / 2;
    const left = x - SIZE / 2;

    return (
        <>
            {state === 'winner' && (
                <div
                    className="absolute touch-none pointer-none animate-ping"
                    style={{
                        top,
                        left,
                        width: SIZE,
                        height: SIZE,
                        borderRadius: SIZE,
                        backgroundColor: color,
                    }}
                />
            )}
            <div
                className="absolute touch-none pointer-none shadow-xl/20"
                style={{
                    top,
                    left,
                    width: SIZE,
                    height: SIZE,
                    borderRadius: SIZE,
                    backgroundColor: color,
                }}
            />
        </>
    );
};
