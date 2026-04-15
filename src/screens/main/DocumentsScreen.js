// src/screens/main/DocumentsScreen.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const DOCUMENTS = [
  { id: 'license',      label: "Driver's License",    icon: 'card-account-details-outline', required: true },
  { id: 'insurance',    label: 'Vehicle Insurance',    icon: 'shield-car',                  required: true },
  { id: 'registration', label: 'Vehicle Registration', icon: 'file-document-outline',       required: true },
  { id: 'profile_photo',label: 'Profile Photo',        icon: 'camera-outline',              required: true },
  { id: 'background',   label: 'Background Check',     icon: 'clipboard-check-outline',     required: false },
];

export default function DocumentsScreen({ navigation }) {
  const [docStatus] = useState({
    license:       'pending',   // pending | approved | rejected | missing
    insurance:     'approved',
    registration:  'missing',
    profile_photo: 'approved',
    background:    'pending',
  });
  const [uploading, setUploading] = useState(null);

  const STATUS_CONFIG = {
    approved: { color: '#00D95F', icon: 'check-circle',   label: 'Approved' },
    pending:  { color: '#FFA500', icon: 'clock-outline',  label: 'Under Review' },
    rejected: { color: '#FF4444', icon: 'close-circle',   label: 'Rejected' },
    missing:  { color: '#666',    icon: 'upload-outline', label: 'Upload Required' },
  };

  const handleUpload = async (docId) => {
    // In production: use expo-document-picker or expo-image-picker
    Alert.alert(
      'Upload Document',
      'In production this opens the camera or file picker.\nIntegrate expo-document-picker for real uploads.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Upload', onPress: async () => {
            setUploading(docId);
            await new Promise((r) => setTimeout(r, 1500));
            setUploading(null);
            Alert.alert('Uploaded', 'Document submitted for review.');
          }
        },
      ]
    );
  };

  const pendingCount = Object.values(docStatus).filter((s) => s === 'pending').length;
  const missingCount = Object.values(docStatus).filter((s) => s === 'missing').length;

  return (
    <LinearGradient colors={['#0A0A0A', '#0A0A0A']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Status banner */}
        {missingCount > 0 ? (
          <View style={[styles.banner, styles.bannerWarning]}>
            <Icon name="alert" size={20} color="#FFA500" />
            <Text style={styles.bannerText}>{missingCount} document{missingCount > 1 ? 's' : ''} required to start driving</Text>
          </View>
        ) : pendingCount > 0 ? (
          <View style={[styles.banner, styles.bannerInfo]}>
            <Icon name="clock-outline" size={20} color="#4A9EFF" />
            <Text style={[styles.bannerText, { color: '#4A9EFF' }]}>{pendingCount} document{pendingCount > 1 ? 's' : ''} under review</Text>
          </View>
        ) : (
          <View style={[styles.banner, styles.bannerSuccess]}>
            <Icon name="check-circle" size={20} color="#00D95F" />
            <Text style={[styles.bannerText, { color: '#00D95F' }]}>All documents approved</Text>
          </View>
        )}

        {/* Document list */}
        <View style={styles.docList}>
          {DOCUMENTS.map((doc) => {
            const status = docStatus[doc.id] || 'missing';
            const config = STATUS_CONFIG[status];
            const isUploading = uploading === doc.id;

            return (
              <View key={doc.id} style={styles.docItem}>
                <View style={styles.docIconWrap}>
                  <Icon name={doc.icon} size={24} color="#FF6B35" />
                </View>
                <View style={styles.docInfo}>
                  <View style={styles.docTitleRow}>
                    <Text style={styles.docLabel}>{doc.label}</Text>
                    {doc.required && <View style={styles.requiredBadge}><Text style={styles.requiredText}>Required</Text></View>}
                  </View>
                  <View style={styles.docStatusRow}>
                    <Icon name={config.icon} size={14} color={config.color} />
                    <Text style={[styles.docStatus, { color: config.color }]}>{config.label}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.uploadBtn, status === 'approved' && styles.uploadBtnDisabled]}
                  onPress={() => handleUpload(doc.id)}
                  disabled={status === 'approved' || isUploading}
                >
                  {isUploading
                    ? <ActivityIndicator size="small" color="#FF6B35" />
                    : <Icon name={status === 'approved' ? 'check' : 'upload'} size={18}
                        color={status === 'approved' ? '#00D95F' : '#FF6B35'} />}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Text style={styles.note}>
          Documents are reviewed within 24–48 hours. You'll be notified once approved.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1 },
  bannerWarning: { backgroundColor: '#FFA50015', borderColor: '#FFA50030' },
  bannerInfo:    { backgroundColor: '#4A9EFF15', borderColor: '#4A9EFF30' },
  bannerSuccess: { backgroundColor: '#00D95F15', borderColor: '#00D95F30' },
  bannerText: { color: '#FFA500', fontSize: 14, fontWeight: '500', flex: 1 },
  docList: { gap: 10 },
  docItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#111', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1E1E1E' },
  docIconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FF6B3515', justifyContent: 'center', alignItems: 'center' },
  docInfo: { flex: 1, gap: 6 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  docLabel: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  requiredBadge: { backgroundColor: '#FF6B3520', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  requiredText: { color: '#FF6B35', fontSize: 10, fontWeight: '600' },
  docStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  docStatus: { fontSize: 12 },
  uploadBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#FF6B3515', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FF6B3530' },
  uploadBtnDisabled: { backgroundColor: '#00D95F15', borderColor: '#00D95F30' },
  note: { color: '#444', fontSize: 12, textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
