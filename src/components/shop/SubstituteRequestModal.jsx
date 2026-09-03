// src/components/shop/SubstituteRequestModal.jsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import AppModal from '@/components/ui/AppModal';
import AppTextInput from '@/components/ui/AppTextInput';
import PhotoSlot from '@/components/ui/PhotoSlot';
import Button from '@/components/ui/Button';

/**
 * Opened from ShopItemRow's "Can't find it" action. Two outcomes:
 *  - Suggest a substitute  → onSuggest({ name, price, photoUri }) — item
 *    goes to pending_approval and (in a real backend) is pushed to the
 *    customer over the socket for a yes/no.
 *  - Skip this item        → onSkip() — refunded, no approval needed.
 *
 * One reusable modal regardless of which item triggered it — the parent
 * screen just passes the current `item` in, so nothing here is hard-coded
 * to a specific product.
 */
export default function SubstituteRequestModal({ visible, item, onClose, onSuggest, onSkip, onTakePhoto }) {
    const { colors, isDark } = useTheme();
    const warningHex = isDark ? '#FBBF24' : '#D97706';
    const [subName, setSubName] = useState('');
    const [subPrice, setSubPrice] = useState('');
    const [subPhoto, setSubPhoto] = useState(null);

    const reset = () => {
        setSubName('');
        setSubPrice('');
        setSubPhoto(null);
    };

    const handleClose = () => {
        reset();
        onClose?.();
    };

    const handleSuggest = () => {
        const priceNum = parseFloat(subPrice);
        if (!subName.trim() || Number.isNaN(priceNum)) return;
        onSuggest?.({ name: subName.trim(), price: priceNum, photoUri: subPhoto });
        reset();
    };

    const handleSkip = () => {
        onSkip?.();
        reset();
    };

    return (
        <AppModal
            visible={visible}
            onClose={handleClose}
            title="Item not available"
            subtitle={item ? `${item.name} · ${item.unit ? `${item.qty} × ${item.unit}` : `Qty ${item.qty}`}` : ''}
            hideActions
        >
            <View className="gap-3">
                <View className="flex-row items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3.5 py-3">
                    <Icon name="information-outline" size={16} color={warningHex} style={{ marginTop: 1 }} />
                    <Text className="flex-1 text-xs font-inter text-foreground-muted leading-4.5">
                        Suggest a close substitute for the customer to approve, or skip the item — it'll be refunded from their total.
                    </Text>
                </View>

                <AppTextInput
                    label="Substitute item"
                    placeholder="e.g. Pran Basmati rice (5kg)"
                    value={subName}
                    onChangeText={setSubName}
                    leftIcon="tag-outline"
                />
                <AppTextInput
                    label="Price"
                    placeholder="0.00"
                    value={subPrice}
                    onChangeText={setSubPrice}
                    keyboardType="decimal-pad"
                    leftIcon="cash"
                />
                <PhotoSlot
                    label="Photo of substitute (optional)"
                    uri={subPhoto}
                    onPress={async () => {
                        const uri = await onTakePhoto?.();
                        if (uri) setSubPhoto(uri);
                    }}
                    isDark={isDark}
                    height={110}
                />

                <Button
                    variant="warning"
                    leftIcon="send-outline"
                    onPress={handleSuggest}
                    disabled={!subName.trim() || !subPrice.trim()}
                >
                    Send to customer for approval
                </Button>
                <Button variant="outline" leftIcon="close" onPress={handleSkip}>
                    Skip this item instead
                </Button>
            </View>
        </AppModal>
    );
}
