'use client';

export type TeamMode = 'none' | 2 | 3;

interface ControlsProps {
    disabled: boolean;
    teamMode: TeamMode;
    onTeamModeChange: (mode: TeamMode) => void;
    stickyMode: boolean;
    onStickyModeChange: (stickyMode: boolean) => void;
}

type Value = string | number | boolean;

const SegmentedControl: React.FC<{
    disabled: boolean;
    selected: Value;
    options: { value: Value; label: string }[];
    onChange: (value: Value) => void;
}> = ({ disabled, options, selected, onChange }) => {
    return (
        <div className="flex items-center border border-white/20 rounded-full overflow-hidden">
            {options.map(({ label, value }, index) => (
                <button
                    key={label}
                    disabled={disabled}
                    className={`px-3 py-1.5 text-sm font-bold tracking-wider uppercase transition-colors duration-150 ${
                        selected === value ? `text-white` : 'text-white/30'
                    } ${index > 0 ? 'border-l border-white/20' : ''}`}
                    onClick={() => onChange(value)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export const Controls: React.FC<ControlsProps> = ({ disabled, teamMode, onTeamModeChange, stickyMode, onStickyModeChange }) => (
    <div className={`fixed bottom-0 left-0 right-0 flex justify-center pointer-events-none ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex items-start gap-6 px-4 py-3 pointer-events-auto">
            <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Teams</span>
                <SegmentedControl
                    disabled={disabled}
                    options={[
                        { value: 'none', label: 'NONE' },
                        { value: 2, label: 'TWO' },
                        { value: 3, label: 'THREE' },
                    ]}
                    selected={teamMode}
                    onChange={(value) => onTeamModeChange(value as TeamMode)}
                />
            </div>
            <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Sticky</span>
                <SegmentedControl
                    disabled={disabled}
                    options={[
                        { value: false, label: 'OFF' },
                        { value: true, label: 'ON' },
                    ]}
                    selected={stickyMode}
                    onChange={(value) => onStickyModeChange(value === true)}
                />
            </div>
        </div>
    </div>
);
