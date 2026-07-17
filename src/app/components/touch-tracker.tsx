interface TouchCircle {
    x: number;
    y: number;
    color: string;
    state: 'neutral' | 'loser' | 'winner';
    rank?: number;
}

const SIZE = 100;

export const TouchCircle: React.FC<TouchCircle> = ({ x, y, color, rank }) => {
    const top = y - SIZE / 2;
    const left = x - SIZE / 2;

    const renderCircle = (rank?: number, additionalClasses = '') => (
        <div
            className={`absolute touch-none pointer-none shadow-xl/20 ${additionalClasses}`}
            style={{
                top,
                left,
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE,
                backgroundColor: color,
                justifyContent: 'center',
                alignContent: 'center',
                textAlign: 'center',
            }}
        >
            {rank !== undefined && <p className="text-8xl font-sans text-white text-shadow-lg">{rank + 1}</p>}
        </div>
    );

    return (
        <>
            {rank === 0 && renderCircle(undefined, 'animate-ping')}
            {renderCircle(rank)}
        </>
    );
};
