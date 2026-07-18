'use client';

interface CountdownDisplayProps {
    millis: number;
}

const ORDINAL_STEPS = 3;
const ORDINAL_LENGTH_MS = 667;

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ millis }) => {
    const counter = Math.ceil(millis / ORDINAL_LENGTH_MS);
    if (counter > ORDINAL_STEPS + 1) {
        return null;
    }

    return (
        <div key={counter} className="font-bold text-white text-shadow-lg/20 animate-countdown-pop text-6xl">
            {counter === ORDINAL_STEPS + 1 ? 'Ready?' : counter}
        </div>
    );
};
