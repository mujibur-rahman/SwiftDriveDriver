// src/components/carInsurance/SeveritySelector.jsx
import { View } from 'react-native';
import Button from '@/components/ui/Button';

const LEVELS = [
    { key: 'minor', label: 'Minor', icon: 'emoticon-happy-outline', variant: 'success' },
    { key: 'moderate', label: 'Moderate', icon: 'alert-outline', variant: 'warning' },
    { key: 'severe', label: 'Severe', icon: 'alert-octagon-outline', variant: 'error' },
];

/**
 * Triage tag for whichever adjuster picks up the claim next — not present
 * in any other module, since only claim inspections need a priority
 * signal. `LEVELS` is a small config array rather than three hard-coded
 * buttons so adding a level later is a one-line change.
 */
export default function SeveritySelector({ value, onChange }) {
    return (
        <View className="flex-row gap-2">
            {LEVELS.map((level) => (
                <View key={level.key} className="flex-1">
                    <Button
                        variant={value === level.key ? level.variant : 'outline'}
                        size="sm"
                        leftIcon={level.icon}
                        onPress={() => onChange(level.key)}
                    >
                        {level.label}
                    </Button>
                </View>
            ))}
        </View>
    );
}
