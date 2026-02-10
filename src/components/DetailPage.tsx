import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface DetailPageProps {
  tutorialId: number;
  user: any;
  onNavigate: (page: string) => void;
}

const tutorialDetails: Record<number, any> = {
  1: {
    id: 1,
    title: 'Cara Memperbaiki Keran Air yang Bocor',
    description: 'Pelajari teknik dasar memperbaiki keran air yang bocor dengan mudah dan cepat.',
    category: 'Plambing',
    difficulty: 'Pemula',
    duration: '15 menit',
    type: 'video',
    image: 'https://images.unsplash.com/photo-1681249537103-9e0c7316d91e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHJlcGFpciUyMHR1dG9yaWFsfGVufDF8fHx8MTc3MDY2MDMxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    tools: ['Kunci Inggris', 'Obeng', 'Seal Karet', 'Kain Lap'],
    steps: [
      {
        title: 'Persiapan dan Keselamatan',
        content: 'Sebelum memulai perbaikan, pastikan Anda telah mematikan sumber air utama di rumah. Ini sangat penting untuk menghindari kebocoran air yang tidak terkendali saat Anda membongkar keran.',
        details: [
          'Cari dan putar valve air utama searah jarum jam hingga tertutup penuh',
          'Buka keran untuk memastikan air tidak mengalir lagi',
          'Siapkan ember atau wadah di bawah keran untuk menampung sisa air',
          'Pastikan area kerja kering dan aman',
        ],
        tips: 'Foto posisi keran sebelum dibongkar agar mudah saat memasang kembali',
        imageUrl: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800',
      },
      {
        title: 'Melepas Pegangan Keran',
        content: 'Langkah selanjutnya adalah melepas pegangan keran dengan hati-hati menggunakan obeng yang sesuai.',
        details: [
          'Cari sekrup kecil di bagian atas atau samping pegangan keran',
          'Gunakan obeng minus atau plus sesuai jenis sekrup',
          'Putar sekrup berlawanan arah jarum jam untuk melepas',
          'Angkat pegangan keran dengan perlahan',
          'Simpan sekrup di tempat aman agar tidak hilang',
        ],
        tips: 'Gunakan magnet kecil untuk menyimpan sekrup agar tidak jatuh ke saluran air',
      },
      {
        title: 'Membuka Komponen Keran',
        content: 'Setelah pegangan terlepas, Anda akan melihat komponen internal keran yang perlu dibuka.',
        details: [
          'Gunakan kunci inggris untuk melepas mur pengunci',
          'Putar berlawanan arah jarum jam dengan hati-hati',
          'Angkat cartridge atau valve stem dari dalam keran',
          'Periksa kondisi seal karet dan O-ring',
          'Bersihkan area di sekitar komponen dari kotoran',
        ],
        tips: 'Lapisi rahang kunci inggris dengan kain agar tidak merusak chrome keran',
      },
      {
        title: 'Mengganti Seal Karet',
        content: 'Bagian ini adalah inti dari perbaikan - mengganti seal karet yang aus atau rusak.',
        details: [
          'Lepaskan seal karet lama dari cartridge dengan hati-hati',
          'Periksa ukuran seal untuk memastikan pengganti yang tepat',
          'Bersihkan area dudukan seal dari kerak atau kotoran',
          'Pasang seal karet baru dengan posisi yang benar',
          'Pastikan seal terpasang rata dan tidak miring',
        ],
        tips: 'Bawa seal lama ke toko untuk mendapatkan ukuran yang pas',
      },
      {
        title: 'Memasang Kembali Komponen',
        content: 'Setelah seal baru terpasang, saatnya memasang kembali semua komponen keran.',
        details: [
          'Masukkan cartridge kembali ke dalam lubang keran',
          'Pasang dan kencangkan mur pengunci dengan kunci inggris',
          'Jangan terlalu kencang agar tidak merusak thread',
          'Pasang kembali pegangan keran',
          'Kencangkan sekrup pegangan dengan obeng',
        ],
        tips: 'Kencangkan dengan feeling - jangan terlalu keras yang bisa merusak komponen',
      },
      {
        title: 'Testing dan Finishing',
        content: 'Langkah terakhir adalah menguji hasil perbaikan dan memastikan tidak ada kebocoran.',
        details: [
          'Buka kembali valve air utama secara perlahan',
          'Biarkan air mengalir sebentar untuk mengeluarkan udara',
          'Tutup dan buka keran beberapa kali untuk testing',
          'Periksa seluruh area keran apakah ada tetesan air',
          'Lap area keran hingga kering dan bersih',
        ],
        tips: 'Tunggu 10-15 menit dan periksa lagi untuk memastikan tidak ada kebocoran lambat',
      },
      {
        title: 'Selesai',
        content: 'Selamat! Anda telah berhasil memperbaiki keran air yang bocor. Dengan mengikuti langkah-langkah ini dengan teliti, keran Anda seharusnya sudah tidak bocor lagi.',
        details: [],
        tips: 'Jika masih bocor setelah diperbaiki, kemungkinan ada komponen lain yang rusak. Konsultasikan dengan ahli plambing.',
      },
    ],
  },
};

export function DetailPage({ tutorialId, user, onNavigate }: DetailPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const tutorial = tutorialDetails[tutorialId] || tutorialDetails[1];
  const totalSteps = tutorial.steps.length;
  const progress = Math.round((completedSteps.length / totalSteps) * 100);

  useEffect(() => {
    loadProgress();
    addToLearning();
  }, [tutorialId, user]);

  const loadProgress = async () => {
    const progressKey = `progress_${user.email}_${tutorialId}`;
    const saved = await AsyncStorage.getItem(progressKey);
    if (saved) {
      const { currentStep: s, completedSteps: c } = JSON.parse(saved);
      setCurrentStep(s || 1);
      setCompletedSteps(c || []);
    }
  };

  const saveProgress = async (step: number, completed: number[]) => {
    const progressKey = `progress_${user.email}_${tutorialId}`;
    await AsyncStorage.setItem(progressKey, JSON.stringify({ currentStep: step, completedSteps: completed }));
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

  const currentStepData = tutorial.steps[currentStep - 1];
  const isStepCompleted = completedSteps.includes(currentStep);

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'Pemula': return { bg: '#dcfce7', text: '#15803d' };
      case 'Menengah': return { bg: '#fef9c3', text: '#a16207' };
      case 'Mahir': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const diffColor = getDifficultyColor(tutorial.difficulty);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>{tutorial.title}</Text>
            <Text style={styles.headerSub}>Langkah {currentStep}/{totalSteps} • {progress}%</Text>
          </View>
        </View>
        <Progress value={progress} height={4} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Tutorial Info - step 1 only */}
        {currentStep === 1 && (
          <View style={styles.card}>
            <ImageWithFallback src={tutorial.image} alt={tutorial.title} style={{ width: '100%', height: 192, borderRadius: 12 }} />
            <View style={{ padding: 16 }}>
              <View style={styles.tagRow}>
                <Badge variant="secondary">{tutorial.category}</Badge>
                <Badge style={{ backgroundColor: diffColor.bg }} textStyle={{ color: diffColor.text }}>
                  {tutorial.difficulty}
                </Badge>
              </View>
              <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
              <Text style={styles.tutorialDesc}>{tutorial.description}</Text>

              <View style={styles.divider} />
              <Text style={styles.toolsTitle}>🔧 Alat yang Dibutuhkan</Text>
              <View style={styles.tagRow}>
                {tutorial.tools.map((tool: string, i: number) => (
                  <View key={i} style={styles.toolChip}>
                    <Text style={styles.toolChipText}>{tool}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Step Content */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepCircle, isStepCompleted ? styles.stepCircleComplete : styles.stepCircleActive]}>
              {isStepCompleted ? (
                <Text style={styles.stepCircleText}>✓</Text>
              ) : (
                <Text style={styles.stepCircleText}>{currentStep}</Text>
              )}
            </View>
            <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          </View>

          {currentStepData.imageUrl && (
            <ImageWithFallback src={currentStepData.imageUrl} alt={currentStepData.title} style={{ width: '100%', height: 192, borderRadius: 12, marginBottom: 16 }} />
          )}

          <Text style={styles.stepContent}>{currentStepData.content}</Text>

          {currentStepData.details && currentStepData.details.length > 0 && (
            <View style={{ marginTop: 12, gap: 8 }}>
              {currentStepData.details.map((detail: string, i: number) => (
                <View key={i} style={styles.detailRow}>
                  <View style={styles.detailDot} />
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>
          )}

          {currentStepData.tips && (
            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>💡 Tips</Text>
              <Text style={styles.tipsText}>{currentStepData.tips}</Text>
            </View>
          )}
        </View>

        {/* Step Indicators */}
        <View style={styles.card}>
          <Text style={styles.progressLabel}>Progress Langkah</Text>
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
                      {isDone ? '✓' : stepNum}
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
            <Text style={styles.completeBtnText}>✓ Tandai Langkah Ini Selesai</Text>
          </Button>
        )}

        {/* Completion Card */}
        {isCompleted && currentStep === totalSteps && (
          <View style={styles.completionCard}>
            <View style={styles.completionIcon}>
              <Text style={{ fontSize: 32, color: '#fff' }}>✓</Text>
            </View>
            <Text style={styles.completionTitle}>Tutorial Selesai!</Text>
            <Text style={styles.completionDesc}>Selamat! Anda telah menyelesaikan tutorial ini dengan baik.</Text>
            <Button onPress={() => onNavigate('my-learning')} style={{ backgroundColor: '#16a34a' }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Lihat Pembelajaran Saya</Text>
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Button onPress={handlePrevious} disabled={currentStep === 1} variant="outline" style={{ flex: 1, height: 48 }}>
          <Text style={{ color: currentStep === 1 ? '#9ca3af' : '#374151', fontWeight: '600' }}>‹ Sebelumnya</Text>
        </Button>
        <Button onPress={handleNext} disabled={currentStep === totalSteps} style={{ flex: 1, height: 48, backgroundColor: currentStep === totalSteps ? '#9ca3af' : '#dc2626' }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Selanjutnya ›</Text>
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
});
