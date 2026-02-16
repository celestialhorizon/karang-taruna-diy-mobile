import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { StepVideo } from './ui/StepVideo';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { BottomNavigation } from './ui/BottomNavigation';
import { ImageZoomModal } from './ui/ImageZoomModal';
import { useTheme } from '../context/ThemeContext';
import apiService from '../services/api';

interface DetailPageProps {
  tutorialId: string;
  user: any;
  onNavigate: (page: string) => void;
}

export function DetailPage({ tutorialId, user, onNavigate }: DetailPageProps) {
  const { colors } = useTheme();
  const [tutorial, setTutorial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [displayTime, setDisplayTime] = useState<number>(0);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const totalTimeSpentRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(Date.now());
  const isReadyRef = useRef<boolean>(false);

  useEffect(() => {
    loadTutorial();
  }, [tutorialId]);

  useEffect(() => {
    if (tutorial) {
      loadProgress();
      addToLearning();
      sessionStartRef.current = Date.now();
      isReadyRef.current = true;
    }
  }, [tutorial]);

  // Track time spent - only runs once
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      if (!isReadyRef.current) return;
      
      const currentTime = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      
      // Display total time (saved + current session)
      setDisplayTime(totalTimeSpentRef.current + currentTime);
      
      // Save to database every 60 seconds
      if (currentTime >= 60) {
        const newTotalTime = totalTimeSpentRef.current + currentTime;
        console.log('Saving time after 60 seconds:', currentTime);
        apiService.updateTimeSpent(tutorialId, currentTime).catch(error => {
          console.error('Failed to save time spent:', error);
        });
        
        sessionStartRef.current = Date.now();
        totalTimeSpentRef.current = newTotalTime;
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      // Save remaining time only when leaving the page
      if (isReadyRef.current && user) {
        const finalTime = Math.floor((Date.now() - sessionStartRef.current) / 1000);
        console.log('Saving time on unmount:', finalTime);
        apiService.updateTimeSpent(tutorialId, finalTime).catch(error => {
          console.error('Failed to save final time spent:', error);
        });
      }
    };
  }, [user, tutorialId]); // No sessionStartTime dependency!

  const loadTutorial = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTutorialById(tutorialId);
      setTutorial(data);
    } catch (error) {
      console.error('Failed to load tutorial:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal memuat tutorial'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    if (!user) return;
    console.log('Loading progress for tutorial:', tutorialId);
    try {
      const progress = await apiService.getTutorialProgress(tutorialId.toString());
      if (progress) {
        setCompletedSteps(progress.completedSteps || []);
        setIsCompleted(progress.isCompleted || false);
        const timeSpent = progress.timeSpent || 0;
        console.log('Loaded timeSpent from database:', timeSpent);
        totalTimeSpentRef.current = timeSpent;
        setDisplayTime(timeSpent); // Initialize with total saved time
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  useEffect(() => {
    loadProgress();
    addToLearning();
  }, [tutorialId, user]);

  const saveProgress = async (step: number, completed: number[]) => {
    if (!user) return;
    try {
      await apiService.updateProgress(tutorialId.toString(), step, completed.includes(step));
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Fallback to AsyncStorage
      const progressKey = `progress_${user.email}_${tutorialId}`;
      await AsyncStorage.setItem(progressKey, JSON.stringify({ currentStep: step, completedSteps: completed }));
    }
  };

  const addToLearning = async () => {
    const learningKey = `learning_${user.email}`;
    const data = await AsyncStorage.getItem(learningKey);
    const learning = data ? JSON.parse(data) : [];
    if (!learning.find((item: any) => item.tutorialId === tutorialId)) {
      learning.push({ tutorialId, startedAt: new Date().toISOString(), completed: false });
      await AsyncStorage.setItem(learningKey, JSON.stringify(learning));
    }
  };

  const markTutorialComplete = async () => {
    const learningKey = `learning_${user.email}`;
    const data = await AsyncStorage.getItem(learningKey);
    const learning = data ? JSON.parse(data) : [];
    const updated = learning.map((item: any) =>
      item.tutorialId === tutorialId ? { ...item, completed: true, completedAt: new Date().toISOString() } : item
    );
    await AsyncStorage.setItem(learningKey, JSON.stringify(updated));
    setIsCompleted(true);
  };

  const handleStepComplete = () => {
    const newCompleted = [...completedSteps];
    if (!newCompleted.includes(currentStep)) newCompleted.push(currentStep);
    setCompletedSteps(newCompleted);
    if (currentStep === totalSteps) {
      markTutorialComplete();
      Toast.show({ type: 'success', text1: 'Selamat!', text2: 'Anda telah menyelesaikan tutorial ini!' });
    }
    saveProgress(currentStep, newCompleted);
  };

  const handleNext = () => {
    if (!tutorial) return;
    const totalSteps = tutorial.steps?.length || 0;
    if (currentStep < totalSteps) {
      const next = currentStep + 1;
      setCurrentStep(next);
      saveProgress(next, completedSteps);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      saveProgress(prev, completedSteps);
    }
  };

  const currentStepData = tutorial?.steps?.[currentStep - 1];
  const isStepCompleted = completedSteps.includes(currentStep);
  const totalSteps = tutorial?.steps?.length || 0;
  const progress = tutorial ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'Pemula': return { bg: '#dcfce7', text: '#15803d' };
      case 'Menengah': return { bg: '#fef9c3', text: '#a16207' };
      case 'Mahir': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleImageZoom = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setZoomModalVisible(true);
  };

  const closeZoomModal = () => {
    setZoomModalVisible(false);
    setSelectedImageUrl(null);
  };

  const diffColor = tutorial ? getDifficultyColor(tutorial.difficulty) : { bg: '#f3f4f6', text: '#374151' };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>Memuat tutorial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tutorial) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Error</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center' }}>Tutorial tidak ditemukan</Text>
          <Button onPress={() => onNavigate('home')} style={{ marginTop: 16 }}>
            <Text style={{ color: '#fff' }}>Kembali ke Beranda</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <MaterialIcons name="chevron-left" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{tutorial.title || 'Tutorial'}</Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Langkah {currentStep}/{totalSteps} • {progress}% • {formatTime(displayTime)}</Text>
              </View>
            </View>
            <Progress value={progress} height={4} />
          </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Tutorial Info - step 1 only */}
        {currentStep === 1 && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              onPress={() => handleImageZoom(tutorial.imageUrl)}
              activeOpacity={0.8}
            >
              <ImageWithFallback 
                src={tutorial.imageUrl} 
                alt={tutorial.title} 
                style={{ width: '100%', height: 192, borderRadius: 12 }} 
              />
              <View style={styles.zoomHint}>
                <MaterialIcons name="zoom-in" size={16} color="#6b7280" />
                <Text style={styles.zoomHintText}>Ketuk untuk zoom</Text>
              </View>
            </TouchableOpacity>
            <View style={{ padding: 16 }}>
              <View style={styles.tagRow}>
                <Badge variant="secondary">{tutorial.category}</Badge>
                <Badge style={{ backgroundColor: diffColor.bg }} textStyle={{ color: diffColor.text }}>
                  {tutorial.difficulty}
                </Badge>
              </View>
              <Text style={[styles.tutorialTitle, { color: colors.text }]}>{tutorial.title}</Text>
              <Text style={[styles.tutorialDesc, { color: colors.textSecondary }]}>{tutorial.description}</Text>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.toolsTitle, { color: colors.text }]}><MaterialIcons name="build" size={16} color={colors.textSecondary} /> Alat yang Dibutuhkan</Text>
              <View style={styles.tagRow}>
                {(tutorial.materials || []).map((material: any, i: number) => (
                  <View key={i} style={[styles.toolChip, { backgroundColor: colors.background }]}>
                    <Text style={[styles.toolChipText, { color: colors.text }]}>{material.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step Content */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepCircle, isStepCompleted ? styles.stepCircleComplete : styles.stepCircleActive]}>
              {isStepCompleted ? (
                <MaterialIcons name="check" size={16} color="#fff" />
              ) : (
                <Text style={styles.stepCircleText}>{currentStep}</Text>
              )}
            </View>
            <Text style={[styles.stepTitle, { color: colors.text }]}>{currentStepData.title}</Text>
          </View>

          {currentStepData.imageUrl && (
            <TouchableOpacity 
              onPress={() => handleImageZoom(currentStepData.imageUrl)}
              activeOpacity={0.8}
            >
              <ImageWithFallback 
                src={currentStepData.imageUrl} 
                alt={currentStepData.title} 
                style={{ width: '100%', height: 192, borderRadius: 12, marginBottom: 16 }} 
              />
              <View style={styles.zoomHint}>
                <MaterialIcons name="zoom-in" size={16} color="#6b7280" />
                <Text style={styles.zoomHintText}>Ketuk untuk zoom</Text>
              </View>
            </TouchableOpacity>
          )}

          {currentStepData.videoUrl ? (
            <StepVideo uri={currentStepData.videoUrl} />
          ) : null}

          {/* Step Description */}
          {currentStepData.description && (
            <View style={styles.descriptionBox}>
              <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                <MaterialIcons name="check-circle" size={16} color="#22c55e" /> Deskripsi Langkah
              </Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {currentStepData.description}
              </Text>
            </View>
          )}

          <Text style={[styles.stepContent, { color: colors.textSecondary }]}>{currentStepData.content}</Text>

          {currentStepData.details && currentStepData.details.length > 0 && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {currentStepData.details.map((detail: string, i: number) => (
                <View key={i} style={styles.detailRow}>
                  <View style={styles.detailDot} />
                  <Text style={[styles.detailText, { color: colors.text }]}>{detail}</Text>
                </View>
              ))}
            </View>
          )}

          {currentStepData.tips && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}><MaterialIcons name="lightbulb" size={16} color="#92400e" /> Tips</Text>
              <Text style={styles.tipsText}>{currentStepData.tips}</Text>
            </View>
          )}

          {currentStepData.safetyNote && (
            <View style={styles.safetyBox}>
              <Text style={styles.safetyTitle}>
                <MaterialIcons name="warning" size={16} color="#d97706" /> Catatan Keselamatan:
              </Text>
              <Text style={styles.safetyText}>{currentStepData.safetyNote}</Text>
            </View>
          )}
        </View>

        {/* Step Indicators */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.progressLabel, { color: colors.text }]}>Progress Langkah</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.stepIndicatorRow}>
              {tutorial.steps.map((_: any, index: number) => {
                const stepNum = index + 1;
                const isCurrent = stepNum === currentStep;
                const isDone = completedSteps.includes(stepNum);
                return (
                  <TouchableOpacity
                    key={stepNum}
                    onPress={() => { setCurrentStep(stepNum); saveProgress(stepNum, completedSteps); }}
                    style={[
                      styles.stepIndicator,
                      isCurrent && styles.stepIndicatorCurrent,
                      isDone && !isCurrent && styles.stepIndicatorDone,
                    ]}
                  >
                    <Text style={[styles.stepIndicatorText, (isCurrent || isDone) && { color: '#fff' }]}>
                      {isDone ? <MaterialIcons name="check" size={14} color="#fff" /> : stepNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Complete Step Button */}
        {!isStepCompleted && (
          <Button onPress={handleStepComplete} style={styles.completeBtn}>
            <Text style={styles.completeBtnText}><MaterialIcons name="check" size={16} color="#fff" /> Tandai Langkah Ini Selesai</Text>
          </Button>
        )}

        {/* Completion Card */}
        {isCompleted && currentStep === totalSteps && (
          <View style={styles.completionCard}>
            <View style={styles.completionIcon}>
              <MaterialIcons name="check-circle" size={32} color="#fff" />
            </View>
            <Text style={styles.completionTitle}>Tutorial Selesai!</Text>
            <Text style={styles.completionDesc}>Selamat! Anda telah menyelesaikan tutorial ini dengan baik.</Text>
            <Button onPress={() => onNavigate('my-learning')} style={{ backgroundColor: '#16a34a' }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Lihat Pembelajaran Saya</Text>
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        visible={zoomModalVisible}
        imageUrl={selectedImageUrl}
        onClose={closeZoomModal}
      />

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Button onPress={handlePrevious} disabled={currentStep === 1} variant="outline" style={{ flex: 1, height: 48 }}>
          <Text style={{ color: currentStep === 1 ? colors.textSecondary : colors.text, fontWeight: '600' }}><MaterialIcons name="chevron-left" size={18} color={colors.text} /> Sebelumnya</Text>
        </Button>
        <Button onPress={handleNext} disabled={currentStep === totalSteps} style={{ flex: 1, height: 48, backgroundColor: currentStep === totalSteps ? colors.textSecondary : colors.primary }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Selanjutnya <MaterialIcons name="chevron-right" size={18} color="#fff" /></Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  backBtn: { padding: 8, marginLeft: -8 },
  backIcon: { fontSize: 28, color: '#374151', fontWeight: '300' },
  headerTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
  headerSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 },
  tutorialTitle: { fontWeight: 'bold', fontSize: 18, color: '#111827', marginBottom: 8 },
  tutorialDesc: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  toolsTitle: { fontWeight: '600', fontSize: 14, color: '#111827', marginBottom: 12 },
  toolChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  toolChipText: { fontSize: 13, color: '#374151' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: '#dc2626' },
  stepCircleComplete: { backgroundColor: '#22c55e' },
  stepCircleText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  stepTitle: { fontWeight: 'bold', fontSize: 17, color: '#111827', flex: 1 },
  stepContent: { fontSize: 14, color: '#374151', lineHeight: 22 },
  detailRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  detailDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fecaca', marginTop: 6 },
  detailText: { fontSize: 13, color: '#374151', flex: 1 },
  tipsBox: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, padding: 16, marginTop: 16 },
  tipsTitle: { fontWeight: '600', fontSize: 13, color: '#92400e', marginBottom: 4 },
  tipsText: { fontSize: 13, color: '#a16207' },
  descriptionBox: { backgroundColor: 'transparent', borderRadius: 12, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  descriptionTitle: { fontWeight: '600', fontSize: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  descriptionText: { fontSize: 14, lineHeight: 20 },
  safetyBox: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fbbf24', borderRadius: 12, padding: 16, marginTop: 16 },
  safetyTitle: { fontWeight: '600', fontSize: 13, color: '#d97706', marginBottom: 4, flexDirection: 'row', alignItems: 'center' },
  safetyText: { fontSize: 13, color: '#92400e' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#6b7280' },
  statValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  progressLabel: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 12 },
  stepIndicatorRow: { flexDirection: 'row', gap: 8 },
  stepIndicator: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  stepIndicatorCurrent: { backgroundColor: '#dc2626', borderWidth: 3, borderColor: '#fecaca' },
  stepIndicatorDone: { backgroundColor: '#22c55e' },
  stepIndicatorText: { fontWeight: '600', fontSize: 13, color: '#4b5563' },
  completeBtn: { backgroundColor: '#16a34a', height: 52, marginBottom: 16 },
  completeBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  completionCard: { backgroundColor: '#f0fdf4', borderWidth: 2, borderColor: '#bbf7d0', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  completionIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  completionTitle: { fontWeight: 'bold', fontSize: 20, color: '#14532d', marginBottom: 8 },
  completionDesc: { fontSize: 14, color: '#15803d', textAlign: 'center', marginBottom: 16 },
  bottomNav: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  zoomHint: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    marginTop: -8, 
    marginBottom: 8 
  },
  zoomHintText: { fontSize: 12, color: '#6b7280' },
});
