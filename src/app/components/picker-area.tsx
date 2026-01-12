'use client';

import { Touch, TouchEvent, useState } from 'react';

interface TouchTracker {
    x: number;
    y: number;
}

const TOUCH_TARGET_COLORS = ['#E50000', '#FF8D00', '#FFEE00', '#028121', '#004CFF', '#770088'];

export const PickerArea: React.FC = () => {
    const [debugMessages, setDebugMessages] = useState<string[]>([]);
    const [touchTrackers, setTouchTrackers] = useState<TouchTracker[]>([]);

    const onTouchEvent = (e: TouchEvent) => {
        const touches: Touch[] = [];

        for (let index = 0; index < e.touches.length; index += 1) {
            touches.push(e.touches.item(index));
        }

        setTouchTrackers(touches.map(({ clientX, clientY }) => ({ x: clientX, y: clientY })));
        setDebugMessages(touches.map(({ clientX, clientY }) => `${Math.round(clientX)}, ${Math.round(clientY)}`));
    };

    return (
        <div id="container" className="flex h-screen">
            <div
                id="interaction-area"
                className="flex-1 touch-none select-none"
                onTouchStart={onTouchEvent}
                onTouchMove={onTouchEvent}
                onTouchEnd={onTouchEvent}
                onTouchCancel={onTouchEvent}
            >
                {touchTrackers.map(({ x, y }, index) => (
                    <TouchTracker key={`touch-tracker-${index}`} x={x} y={y} color={TOUCH_TARGET_COLORS[index]} />
                ))}
            </div>
            <div id="debug-area" className="w-40 overflow-scroll whitespace-pre border border-white rounded-xl">
                <code>{debugMessages.join('\n')}</code>
            </div>
        </div>
    );
};

interface TouchTrackerProps {
    x: number;
    y: number;
    color: string;
}

const SIZE = 30;

const TouchTracker: React.FC<TouchTrackerProps> = ({ x, y, color }) => {
    const top = y;
    const left = x - SIZE / 2;

    return (
        <div
            className="absolute touch-none pointer-none"
            style={{ top, left, width: SIZE, height: SIZE, borderRadius: SIZE, backgroundColor: color }}
        />
    );
};
