// src/screens/main/PayoutSettingsScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import ScreenHeader from "@/components/ui/ScreenHeader";
import AppTextInput from "@/components/ui/AppTextInput";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import BalanceCard from "@/components/ui/BalanceCard";
import SelectableListRow from "@/components/ui/SelectableListRow";

const PAYOUT_SCHEDULES = [
  {
    id: "instant",
    label: "Instant",
    sub: "1.5% fee per transfer",
    icon: "lightning-bolt",
  },
  {
    id: "daily",
    label: "Daily",
    sub: "Every day at 8:00 AM",
    icon: "calendar-today",
  },
  {
    id: "weekly",
    label: "Weekly",
    sub: "Every Monday",
    icon: "calendar-week",
  },
];

export default function PayoutSettingsScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const primary = colors?.primary ?? (isDark ? "#38BDF8" : "#0EA5E9");
  const muted = isDark ? "#7DD3FC" : "#64748B";

  const [schedule, setSchedule] = useState("weekly");
  const [bankName, setBankName] = useState("Chase Bank");
  const [accountNum, setAccountNum] = useState("••••4242");
  const [routingNum, setRoutingNum] = useState("••••0021");
  const [loading, setLoading] = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate API call
    setLoading(false);
    setEditingBank(false);
    Alert.alert("Saved", "Payout settings updated!");
  };

  const handleWithdraw = () => {
    Alert.alert(
      "Withdraw Funds",
      "Transfer your balance to your bank account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw $284.50",
          onPress: () =>
            Alert.alert(
              "Initiated",
              "Transfer will arrive in 1–2 business days.",
            ),
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-5 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader title="Payout Settings" className="mb-4" />

          <BalanceCard
            label="Available Balance"
            amount={284.5}
            actionLabel="Withdraw Now"
            onActionPress={handleWithdraw}
            className="mb-7"
          />

          <Heading subtitle="Payout Schedule" size="xs" align="left" className="mb-3" subtitleClassName="font-inter-semibold uppercase tracking-[0.5px]" />

          <SelectableListRow
            items={PAYOUT_SCHEDULES}
            value={schedule}
            onChange={setSchedule}
            className="mb-7"
            radioSize="md"
            radioVariant="primary"
          />

          {/* Bank account */}
          <View className="mb-3 flex-row items-center justify-between">
            <Heading subtitle="Bank Account" size="xs" align="left" subtitleClassName="font-inter-semibold uppercase tracking-[0.5px]" />
            <TouchableOpacity
              onPress={() => setEditingBank(!editingBank)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-sm font-inter-medium text-primary">
                {editingBank ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-5 flex-row gap-3.5 rounded-2xl border border-border bg-card p-4">
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
              <Icon name="bank-outline" size={24} color={primary} />
            </View>

            {editingBank ? (
              <View className="flex-1 gap-3.5">
                <AppTextInput
                  label="Bank Name"
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="e.g. Chase Bank"
                />
                <AppTextInput
                  label="Account Number"
                  value={accountNum}
                  onChangeText={setAccountNum}
                  keyboardType="number-pad"
                  placeholder="Account number"
                />
                <AppTextInput
                  label="Routing Number"
                  value={routingNum}
                  onChangeText={setRoutingNum}
                  keyboardType="number-pad"
                  placeholder="Routing number"
                />
              </View>
            ) : (
              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-inter-semibold text-foreground">
                  {bankName}
                </Text>
                <Text className="text-[13px] font-inter text-foreground-muted">
                  Account {accountNum}
                </Text>
                <Text className="text-[13px] font-inter text-foreground-muted">
                  Routing {routingNum}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row justify-between items-center gap-2">
            {editingBank && (
              <Button
                variant="primary"
                onPress={handleSave}
                loading={loading}
                disabled={loading}
                className="flex-1 mb-3"
              >
                Save Bank Details
              </Button>
            )}

            <Button
              variant="primary"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              className={editingBank ? "flex-1 mb-3" : "flex-1 mt-2 mb-3"}
            >
              Save Schedule
            </Button>
          </View>

          <Heading subtitle="🔒 Bank details are encrypted. Payouts processed via Stripe Connect." size="xs" align="center" className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}