import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { Logo } from './ui/Logo';
import apiService from '../services/api';

interface MyLearningPageProps {
  user: any;
  onNavigate: (page: string, tutorialId?: string) => void;
  onLogout: () => void;
}

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  type: 'video' | 'artikel';
  imageUrl: string;
  createdAt: string;
  steps?: Array<{
    stepNumber: number;
    title: string;
    description: string;
    imageUrl?: string;
    safetyNote?: string;
  }>;
}

export function MyLearningPage({ user, onNavigate }: MyLearningPageProps) {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [learningData, setLearningData] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Load user progress from API
      const progressData = await apiService.getUserProgress();
      console.log('Progress data:', progressData);
      setLearningData(progressData || []);
      
      // Load all tutorials
      const tutorialsData = await apiService.getTutorials();
      console.log('Tutorials data:', tutorialsData);
      setTutorials(tutorialsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTutorialProgress = (tutorialId: string) => {
    // Find progress where tutorial._id matches tutorialId
    const progress = learningData.find((item: any) => {
      // item.tutorial could be an ObjectId or populated object
      if (typeof item.tutorial === 'object' && item.tutorial !== null) {
        return item.tutorial._id === tutorialId;
      }
      return item.tutorial === tutorialId;
    });
    
    if (!progress) {
      console.log('No progress found for tutorialId:', tutorialId);
      return null;
    }
    
    // If tutorial is populated, use it directly
    let tutorial = null;
    if (typeof progress.tutorial === 'object' && progress.tutorial !== null) {
      tutorial = progress.tutorial;
    } else {
      // Otherwise find it in tutorials array
      tutorial = tutorials.find((t: Tutorial) => t._id === tutorialId);
    }
    
    const totalSteps = tutorial?.steps?.length || 1;
    const completedCount = progress.completedSteps?.length || 0;
    const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    
    const result = {
      ...progress,
      tutorialId: typeof progress.tutorial === 'object' ? progress.tutorial._id : progress.tutorial,
      percentage,
      completedCount,
      totalSteps,
      tutorial,
      completed: progress.isCompleted
    };
    
    console.log('Progress result for', tutorialId, ':', result);
    return result;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const ongoingTutorials = learningData.filter((item) => !item.isCompleted);
  const completedTutorials = learningData.filter((item) => item.isCompleted);

  const TutorialCard = ({ progress }: { progress: any }) => {
    if (!progress.tutorial) return null;
    
    return (
      <TouchableOpacity
        style={styles.tutorialCard}
        onPress={() => onNavigate('detail', progress.tutorialId)}
        activeOpacity={0.8}
      >
        <ImageWithFallback
          src={progress.tutorial.imageUrl}
          alt={progress.tutorial.title}
          style={{ width: '100%', height: 160 }}
        />
        {progress.completed && (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check" size={16} color="#fff" />
          </View>
        )}
        <View style={{ padding: 16 }}>
          <Badge variant="secondary" style={{ marginBottom: 8 }}>{progress.tutorial.category}</Badge>
          <Text style={styles.cardTitle}>{progress.tutorial.title}</Text>

          {!progress.completed && (
            <View style={{ marginTop: 12, gap: 6 }}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>{progress.percentage}%</Text>
              </View>
              <Progress value={progress.percentage} height={6} />
              <Text style={styles.progressDetail}>
                {progress.completedCount} dari {progress.totalSteps} langkah selesai
              </Text>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}><MaterialIcons name="timer" size={14} color="#6b7280" /> Waktu</Text>
                <Text style={styles.progressValue}>{formatTime(progress.timeSpent || 0)}</Text>
              </View>
            </View>
          )}

          {progress.completed && (
            <View style={styles.completedRow}>
              <MaterialIcons name="check" size={14} color="#16a34a" />
              <Text style={styles.completedText}>Tutorial Selesai</Text>
            </View>
          )}

          {/* Always show time spent for completed tutorials */}
          {progress.completed && progress.timeSpent > 0 && (
            <View style={styles.completedRow}>
              <MaterialIcons name="timer" size={14} color="#6b7280" />
              <Text style={{ fontSize: 12, color: '#6b7280' }}>{formatTime(progress.timeSpent)}</Text>
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
          <MaterialIcons name="chevron-left" size={28} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <Logo size={32} />
          <Text style={styles.headerTitle}>Pembelajaran Saya</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#dc2626" />
          <Text style={{ marginTop: 16, color: '#6b7280' }}>Memuat data...</Text>
        </View>
      ) : (
        <>
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
            <MaterialIcons name="access-time" size={16} color="#666" /> Sedang Belajar ({ongoingTutorials.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('completed')}
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            <MaterialIcons name="check" size={16} color="#16a34a" /> Selesai ({completedTutorials.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}>
        {activeTab === 'ongoing' && (
          ongoingTutorials.length > 0 ? (
            ongoingTutorials
              .map((item) => {
                const tutorialId = typeof item.tutorial === 'object' ? item.tutorial._id : item.tutorial;
                const progress = getTutorialProgress(tutorialId);
                return progress ? { ...item, progress } : null;
              })
              .filter((item): item is NonNullable<typeof item> => item !== null)
              .map((item) => (
                <TutorialCard key={item.progress.tutorialId} progress={item.progress} />
              ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="menu-book" size={40} color="#9ca3af" />
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
            completedTutorials
              .map((item) => {
                const tutorialId = typeof item.tutorial === 'object' ? item.tutorial._id : item.tutorial;
                const progress = getTutorialProgress(tutorialId);
                return progress ? { ...item, progress } : null;
              })
              .filter((item): item is NonNullable<typeof item> => item !== null)
              .map((item) => (
                <TutorialCard key={item.progress.tutorialId} progress={item.progress} />
              ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="check-circle" size={40} color="#9ca3af" />
              <Text style={styles.emptyTitle}>Belum Ada yang Selesai</Text>
              <Text style={styles.emptySubtitle}>Selesaikan tutorial untuk melihatnya di sini</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
          <MaterialIcons name="home" size={22} color="#6b7280" />
          <Text style={styles.navLabel}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialIcons name="menu-book" size={22} color="#dc2626" />
          <Text style={[styles.navLabel, styles.navActive]}>Belajar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('home')}>
          <MaterialIcons name="person" size={22} color="#6b7280" />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingVertical: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { padding: 8, marginLeft: -8, marginRight: 8 },
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
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', paddingVertical: 8 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, color: '#6b7280' },
  navActive: { color: '#dc2626', fontWeight: '600' },
});
