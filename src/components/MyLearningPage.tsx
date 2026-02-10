import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface MyLearningPageProps {
  user: any;
  onNavigate: (page: string, tutorialId?: number) => void;
  onLogout: () => void;
}

const tutorialData: Record<number, any> = {
  1: { id: 1, title: 'Cara Memperbaiki Keran Air yang Bocor', category: 'Plambing', image: 'https://images.unsplash.com/photo-1681249537103-9e0c7316d91e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHJlcGFpciUyMHR1dG9yaWFsfGVufDF8fHx8MTc3MDY2MDMxM3ww&ixlib=rb-4.1.0&q=80&w=1080', totalSteps: 7 },
  2: { id: 2, title: 'Instalasi Listrik Dasar untuk Rumah', category: 'Listrik', image: 'https://images.unsplash.com/photo-1767514536575-82aaf8b0afc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwd2lyaW5nJTIwcmVwYWlyfGVufDF8fHx8MTc3MDY2MDMxNHww&ixlib=rb-4.1.0&q=80&w=1080', totalSteps: 8 },
  3: { id: 3, title: 'Teknik Mengecat Dinding dengan Rapi', category: 'Pengecatan', image: 'https://images.unsplash.com/photo-1523250217488-ab35967e9840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMHdhbGwlMjBob21lfGVufDF8fHx8MTc3MDY2MDMxNHww&ixlib=rb-4.1.0&q=80&w=1080', totalSteps: 8 },
  4: { id: 4, title: 'Membuat Rak Kayu Sederhana', category: 'Pertukangan Kayu', image: 'https://images.unsplash.com/flagged/photo-1596715932857-56e359217a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kd29ya2luZyUyMGNyYWZ0c21hbnNoaXB8ZW58MXx8fHwxNzcwNjM2ODczfDA&ixlib=rb-4.1.0&q=80&w=1080', totalSteps: 8 },
  5: { id: 5, title: 'Perawatan Alat-Alat Pertukangan', category: 'Perawatan', image: 'https://images.unsplash.com/photo-1765518440022-10242cc86895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwbWFpbnRlbmFuY2UlMjB0b29sc3xlbnwxfHx8fDE3NzA2NTY3Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080', totalSteps: 6 },
  6: { id: 6, title: 'Dasar-Dasar Penggunaan Alat Pertukangan', category: 'Pertukangan Kayu', image: 'https://images.unsplash.com/photo-1683115098652-db9813ecf284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50cnklMjB0b29scyUyMHdvcmtzaG9wfGVufDF8fHx8MTc3MDY2MDMxM3ww&ixlib=rb-4.1.0&q=80&w=1080', totalSteps: 5 },
};

export function MyLearningPage({ user, onNavigate }: MyLearningPageProps) {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [learningData, setLearningData] = useState<any[]>([]);

  useEffect(() => {
    loadLearningData();
  }, [user]);

  const loadLearningData = async () => {
    if (!user) return;
    const data = await AsyncStorage.getItem(`learning_${user.email}`);
    setLearningData(data ? JSON.parse(data) : []);
  };

  const getTutorialProgress = async (tutorialId: number) => {
    const progressKey = `progress_${user.email}_${tutorialId}`;
    const saved = await AsyncStorage.getItem(progressKey);
    const progress = saved ? JSON.parse(saved) : { currentStep: 1, completedSteps: [] };
    const tutorial = tutorialData[tutorialId];
    const totalSteps = tutorial?.totalSteps || 1;
    const completedCount = progress.completedSteps?.length || 0;
    const percentage = Math.round((completedCount / totalSteps) * 100);
    return { ...progress, percentage, completedCount, totalSteps };
  };

  const ongoingTutorials = learningData.filter((item) => !item.completed);
  const completedTutorials = learningData.filter((item) => item.completed);

  const TutorialCard = ({ tutorialId, isCompleted }: { tutorialId: number; isCompleted: boolean }) => {
    const tutorial = tutorialData[tutorialId];
    const [progress, setProgress] = useState<any>({ percentage: 0, completedCount: 0, totalSteps: 1 });

    useEffect(() => {
      getTutorialProgress(tutorialId).then(setProgress);
    }, [tutorialId]);

    if (!tutorial) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate('detail', tutorialId)}
        style={styles.tutorialCard}
      >
        <View style={{ height: 160, position: 'relative' }}>
          <ImageWithFallback src={tutorial.image} alt={tutorial.title} style={{ width: '100%', height: 160 }} />
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>
            </View>
          )}
        </View>
        <View style={{ padding: 16 }}>
          <Badge variant="secondary" style={{ marginBottom: 8 }}>{tutorial.category}</Badge>
          <Text style={styles.cardTitle} numberOfLines={2}>{tutorial.title}</Text>

          {!isCompleted && (
            <View style={{ marginTop: 12, gap: 6 }}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>{progress.percentage}%</Text>
              </View>
              <Progress value={progress.percentage} height={6} />
              <Text style={styles.progressDetail}>
                {progress.completedCount} dari {progress.totalSteps} langkah selesai
              </Text>
            </View>
          )}

          {isCompleted && (
            <View style={styles.completedRow}>
              <Text style={{ color: '#16a34a', fontSize: 14 }}>✓</Text>
              <Text style={styles.completedText}>Tutorial Selesai</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembelajaran Saya</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
          <Text style={[styles.statLabel, { color: '#dc2626' }]}>Sedang Belajar</Text>
          <Text style={[styles.statValue, { color: '#dc2626' }]}>{ongoingTutorials.length}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
          <Text style={[styles.statLabel, { color: '#16a34a' }]}>Selesai</Text>
          <Text style={[styles.statValue, { color: '#16a34a' }]}>{completedTutorials.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('ongoing')}
          style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.tabTextActive]}>
            🕐 Sedang Belajar ({ongoingTutorials.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            ✓ Selesai ({completedTutorials.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        {activeTab === 'ongoing' && (
          ongoingTutorials.length > 0 ? (
            ongoingTutorials.map((item) => (
              <TutorialCard key={item.tutorialId} tutorialId={item.tutorialId} isCompleted={false} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>📖</Text>
              <Text style={styles.emptyTitle}>Belum Ada Tutorial</Text>
              <Text style={styles.emptySubtitle}>Mulai belajar tutorial baru dari beranda</Text>
              <Button onPress={() => onNavigate('home')} style={{ marginTop: 16 }}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Jelajahi Tutorial</Text>
              </Button>
            </View>
          )
        )}

        {activeTab === 'completed' && (
          completedTutorials.length > 0 ? (
            completedTutorials.map((item) => (
              <TutorialCard key={item.tutorialId} tutorialId={item.tutorialId} isCompleted={true} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 16 }}>✓</Text>
              <Text style={styles.emptyTitle}>Belum Ada yang Selesai</Text>
              <Text style={styles.emptySubtitle}>Selesaikan tutorial untuk melihatnya di sini</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Belajar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  backIcon: { fontSize: 28, color: '#374151', fontWeight: '300' },
  headerTitle: { fontWeight: '600', fontSize: 16, color: '#111827' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  tabActive: { backgroundColor: '#dc2626' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  tabTextActive: { color: '#fff' },
  tutorialCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  completedBadge: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontWeight: '600', fontSize: 15, color: '#111827', marginBottom: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 12, color: '#6b7280' },
  progressValue: { fontSize: 12, fontWeight: '500', color: '#6b7280' },
  progressDetail: { fontSize: 12, color: '#9ca3af' },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  completedText: { fontSize: 14, fontWeight: '500', color: '#16a34a' },
  emptyState: { backgroundColor: '#fff', borderRadius: 16, padding: 48, alignItems: 'center', marginTop: 8 },
  emptyTitle: { fontWeight: '600', fontSize: 18, color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', paddingVertical: 8, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, color: '#6b7280' },
  navActive: { color: '#dc2626', fontWeight: '600' },
});
