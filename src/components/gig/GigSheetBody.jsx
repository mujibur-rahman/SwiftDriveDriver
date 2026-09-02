// src/components/gig/GigSheetBody.jsx
// Step bodies for mandatory gig flow fields
import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DEMO, formatMoney, getJobTotal } from '@/screens/main/gig/gigDemo';
import Button from '@/components/ui/Button';
import AppTextInput from '@/components/ui/AppTextInput';
import Checklist from '@/components/ui/Checklist';
import PhotoSlot from '@/components/ui/PhotoSlot';

export default function GigSheetBody({
  step,
  job,
  primaryHex,
  successHex,
  warningHex,
  isDark,
  etaDistance,
  etaDuration,
  routeLoading,
  checkedItems,
  toggleItem,
  arrivalPhoto,
  takeArrivalPhoto,
  beforePhoto,
  takeBeforePhoto,
  afterPhoto,
  takeAfterPhoto,
  notes,
  setNotes,
  extraWork,
  onAddExtraWork,
  workSeconds,
  cancelSecondsLeft,
  callPhone,
  onStartNavigation,
  onImOnTheWay,
  onCancelJob,
}) {
  const j = job || DEMO;
  const total = getJobTotal(j);
  const muted = isDark ? '#7DD3FC' : '#64748B';
  const fg = isDark ? '#F0F9FF' : '#0F172A';
  const cardBg = isDark ? '#0D1E32' : '#F8FAFC';
  const border = isDark ? '#1E3A5F' : '#E2E8F0';
  const checklist = j.checklist || [];

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const InfoMini = () => (
    <View
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 12,
        gap: 6,
      }}
    >
      <View className="flex-row justify-between items-center">
        <Text style={{ color: muted, fontSize: 11, fontWeight: '600' }}>
          {(j.category || 'GIG').toUpperCase()}
        </Text>
        <Text style={{ color: primaryHex, fontSize: 15, fontWeight: '700' }}>
          {formatMoney(total, j)}
        </Text>
      </View>
      <Text style={{ color: fg, fontSize: 14, fontWeight: '600' }}>{j.title}</Text>
      <Text style={{ color: muted, fontSize: 12 }} numberOfLines={2}>
        {j.customerAddress}
      </Text>
    </View>
  );

  // ── accepted: Job Accepted – Go to location ─────────────────────────────
  if (step === 'accepted') {
    return (
      <>
        <InfoMini />
        <Text style={{ color: muted, fontSize: 13 }}>
          {routeLoading
            ? 'Calculating route…'
            : `${etaDistance || j.distanceToJob} · ${etaDuration || j.durationToJob}`}
        </Text>
        <Button
          variant="primary"
          leftIcon="navigation-variant"
          onPress={onStartNavigation}
        >
          Start Navigation
        </Button>
        <Button variant="outline" leftIcon="run" onPress={onImOnTheWay}>
          I'm on the way
        </Button>
        {cancelSecondsLeft > 0 ? (
          <Button variant="ghost" leftIcon="close" onPress={onCancelJob}>
            {`Cancel Job (${Math.ceil(cancelSecondsLeft / 60)} min left)`}
          </Button>
        ) : null}
      </>
    );
  }

  // ── on_the_way ──────────────────────────────────────────────────────────
  if (step === 'on_the_way') {
    return (
      <>
        <InfoMini />
        <View className="flex-row items-center gap-2">
          <Icon name="navigation-variant-outline" size={16} color={primaryHex} />
          <Text style={{ color: muted, fontSize: 13 }}>
            {etaDistance || j.distanceToJob} · {etaDuration || j.durationToJob}
          </Text>
        </View>
        <Button
          variant="outline"
          size="sm"
          leftIcon="phone-outline"
          onPress={() => callPhone(j.customerPhone, j.customerName)}
        >
          Call customer
        </Button>
        {cancelSecondsLeft > 0 ? (
          <Button variant="ghost" leftIcon="close" onPress={onCancelJob}>
            {`Cancel Job (${Math.ceil(cancelSecondsLeft / 60)} min left)`}
          </Button>
        ) : null}
      </>
    );
  }

  // ── arrive_checkin: GPS + mandatory arrival photo ────────────────────────
  if (step === 'arrive_checkin') {
    return (
      <>
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: `${successHex}55`,
            backgroundColor: `${successHex}14`,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Icon name="map-marker-check" size={22} color={successHex} />
          <View className="flex-1">
            <Text style={{ color: successHex, fontSize: 13, fontWeight: '700' }}>
              GPS verification
            </Text>
            <Text style={{ color: muted, fontSize: 12 }}>
              You are near the job site. Take a check-in photo to confirm arrival.
            </Text>
          </View>
        </View>
        <Text style={{ color: muted, fontSize: 12, fontWeight: '600' }}>
          ARRIVAL PHOTO (required)
        </Text>
        <PhotoSlot
          label="Arrival photo"
          uri={arrivalPhoto}
          onPress={takeArrivalPhoto}
          required
          tall
        />
      </>
    );
  }

  // ── start_job: checklist + before photo + Add Extra Work ────────────────
  if (step === 'start_job') {
    return (
      <>
        <Checklist
          title="CHECKLIST"
          items={checklist}
          checked={checkedItems}
          onToggle={toggleItem}
        />
        <Text style={{ color: muted, fontSize: 12, fontWeight: '600' }}>
          BEFORE PHOTO (required)
        </Text>
        <PhotoSlot
          label="Before work"
          uri={beforePhoto}
          onPress={takeBeforePhoto}
          required
          tall
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon="plus-circle-outline"
          onPress={onAddExtraWork}
        >
          Add Extra Work
        </Button>
        {extraWork?.length > 0 ? (
          <View style={{ gap: 4 }}>
            {extraWork.map((e, i) => (
              <Text key={i} style={{ color: fg, fontSize: 13 }}>
                {`• ${e.label} (+${formatMoney(e.amount, j)})`}
              </Text>
            ))}
          </View>
        ) : null}
      </>
    );
  }

  // ── in_progress: timer + notes + extra work list + checklist ───────────
  if (step === 'in_progress') {
    return (
      <>
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 8,
            borderRadius: 14,
            backgroundColor: `${primaryHex}14`,
            borderWidth: 1,
            borderColor: `${primaryHex}40`,
          }}
        >
          <Text style={{ color: muted, fontSize: 11, fontWeight: '600' }}>
            WORK TIMER
          </Text>
          <Text
            style={{
              color: primaryHex,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: 1,
            }}
          >
            {formatTimer(workSeconds)}
          </Text>
        </View>
        <Checklist
          title="CHECKLIST"
          items={checklist}
          checked={checkedItems}
          onToggle={toggleItem}
        />
        <AppTextInput
          label="Work notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Write notes about the job…"
          multiline
          numberOfLines={4}
          minHeight={88}
        />
        {extraWork?.length > 0 ? (
          <View style={{ gap: 4 }}>
            <Text style={{ color: muted, fontSize: 11, fontWeight: '600' }}>
              EXTRA WORK
            </Text>
            {extraWork.map((e, i) => (
              <Text key={i} style={{ color: fg, fontSize: 13 }}>
                {`• ${e.label} (+${formatMoney(e.amount, j)})`}
              </Text>
            ))}
          </View>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          leftIcon="plus-circle-outline"
          onPress={onAddExtraWork}
        >
          Add Extra Work
        </Button>
      </>
    );
  }

  // ── proof: before auto + after required ─────────────────────────────────
  if (step === 'proof') {
    return (
      <>
        <Text style={{ color: muted, fontSize: 13 }}>
          Before photo is already attached. Take an after photo to submit.
        </Text>
        <View className="flex-row gap-3">
          <PhotoSlot label="Before" uri={beforePhoto} locked required />
          <PhotoSlot
            label="After"
            uri={afterPhoto}
            onPress={takeAfterPhoto}
            required
          />
        </View>
        {notes ? (
          <Text style={{ color: muted, fontSize: 12 }}>{`Notes: ${notes}`}</Text>
        ) : null}
      </>
    );
  }

  return null;
}
