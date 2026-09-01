// src/components/gig/GigSheetBody.jsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { DEMO } from '@/screens/main/gig/gigDemo';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

/**
 * Bottom-sheet body content for each step of an active gig job.
 * Keeps GigJobScreen lean — all step-specific UI lives here.
 */
export default function GigSheetBody({
  step,
  setStep,
  primaryHex,
  warningHex,
  successHex,
  colors,
  isDark,
  etaDistance,
  etaDuration,
  total,
  routeLoading,
  checkedItems,
  toggleItem,
  beforePhoto,
  afterPhoto,
  takeBeforePhoto,
  takeAfterPhoto,
  notes,
  setNotes,
  callPhone,
}) {
  const muted = isDark ? '#7DD3FC' : '#64748B';
  const fg = isDark ? '#F0F9FF' : '#0F172A';
  const cardBg = isDark ? '#0D1E32' : '#F8FAFC';
  const border = isDark ? '#1E3A5F' : '#E2E8F0';

  // ── Shared info card ──────────────────────────────────────────────────────
  const InfoCard = () => (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: cardBg,
        padding: 12,
        gap: 8,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text style={{ color: muted, fontSize: 11, fontWeight: '600' }}>
          {DEMO.category.toUpperCase()}
        </Text>
        <Text style={{ color: primaryHex, fontSize: 15, fontWeight: '700' }}>
          ${Number(total).toFixed(2)}
        </Text>
      </View>
      <Text style={{ color: fg, fontSize: 15, fontWeight: '600' }}>
        {DEMO.title}
      </Text>
      <View className="flex-row items-center gap-1.5">
        <Icon name="map-marker-outline" size={14} color={muted} />
        <Text style={{ color: muted, fontSize: 12, flex: 1 }} numberOfLines={2}>
          {DEMO.customerAddress}
        </Text>
      </View>
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Icon name="clock-outline" size={13} color={muted} />
          <Text style={{ color: muted, fontSize: 12 }}>
            {DEMO.estimatedDuration}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Icon name="account-outline" size={13} color={muted} />
          <Text style={{ color: muted, fontSize: 12 }}>{DEMO.customerName}</Text>
        </View>
      </View>
    </View>
  );

  // ── Checklist ─────────────────────────────────────────────────────────────
  const Checklist = () => (
    <View style={{ gap: 8 }}>
      <Text style={{ color: muted, fontSize: 11, fontWeight: '600' }}>
        TASK CHECKLIST
      </Text>
      {DEMO.checklist.map((item) => {
        const done = !!checkedItems[item.id];
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleItem(item.id)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: done ? successHex : border,
              backgroundColor: done ? `${successHex}14` : cardBg,
            }}
          >
            <Icon
              name={done ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={22}
              color={done ? successHex : muted}
            />
            <Text
              style={{
                flex: 1,
                color: fg,
                fontSize: 14,
                fontWeight: done ? '600' : '400',
                textDecorationLine: done ? 'line-through' : 'none',
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ── Photo slot ────────────────────────────────────────────────────────────
  const PhotoSlot = ({ label, uri, onPress, required }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flex: 1,
        height: 110,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: uri ? successHex : border,
        borderStyle: uri ? 'solid' : 'dashed',
        backgroundColor: cardBg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      ) : (
        <>
          <Icon name="camera-outline" size={26} color={muted} />
          <Text style={{ color: muted, fontSize: 12, marginTop: 4 }}>
            {label}
            {required ? ' *' : ''}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );

  // ── Step bodies ───────────────────────────────────────────────────────────
  if (step === 'to_location') {
    return (
      <>
        <InfoCard />
        <View className="flex-row items-center gap-2">
          <Icon name="navigation-variant-outline" size={16} color={primaryHex} />
          <Text style={{ color: muted, fontSize: 13 }}>
            {routeLoading
              ? 'Calculating route…'
              : `${etaDistance || DEMO.distanceToJob} · ${etaDuration || DEMO.durationToJob}`}
          </Text>
        </View>
        <Button
          variant="outline"
          size="sm"
          leftIcon="phone-outline"
          onPress={() => callPhone(DEMO.customerPhone, DEMO.customerName)}
        >
          Call customer
        </Button>
      </>
    );
  }

  if (step === 'arrived') {
    return (
      <>
        <InfoCard />
        <Text style={{ color: muted, fontSize: 13 }}>
          Confirm you are at the job site, then start the work.
        </Text>
        <View className="flex-row gap-2">
          <View className="flex-1">
            <Button
              variant="outline"
              size="sm"
              leftIcon="phone-outline"
              onPress={() => callPhone(DEMO.customerPhone, DEMO.customerName)}
            >
              Call
            </Button>
          </View>
          <View className="flex-1">
            <Button
              variant="primary"
              size="sm"
              leftIcon="play-circle-outline"
              onPress={() => setStep('start_job')}
            >
              Start Job
            </Button>
          </View>
        </View>
      </>
    );
  }

  if (step === 'start_job') {
    return (
      <>
        <Text style={{ color: muted, fontSize: 13, marginBottom: 4 }}>
          Review the tasks, then begin. You can check items off as you go.
        </Text>
        <Checklist />
        {DEMO.requirements?.length > 0 && (
          <View style={{ gap: 4 }}>
            <Text style={{ color: muted, fontSize: 11, fontWeight: '600' }}>
              REQUIREMENTS
            </Text>
            {DEMO.requirements.map((r) => (
              <Text key={r} style={{ color: fg, fontSize: 13 }}>
                • {r}
              </Text>
            ))}
          </View>
        )}
      </>
    );
  }

  if (step === 'in_progress') {
    return (
      <>
        <Checklist />
        <Text style={{ color: muted, fontSize: 12 }}>
          Mark all tasks when done, then complete the job with photos.
        </Text>
      </>
    );
  }

  if (step === 'complete_photos') {
    return (
      <>
        <Text style={{ color: muted, fontSize: 13, marginBottom: 4 }}>
          Take before & after photos as proof of work.
        </Text>
        <View className="flex-row gap-3">
          <PhotoSlot
            label="Before"
            uri={beforePhoto}
            onPress={takeBeforePhoto}
            required
          />
          <PhotoSlot
            label="After"
            uri={afterPhoto}
            onPress={takeAfterPhoto}
            required
          />
        </View>
        <Text style={{ color: muted, fontSize: 11 }}>
          Photos help resolve disputes and unlock faster payouts.
        </Text>
      </>
    );
  }

  return null;
}
