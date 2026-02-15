import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Progress } from './ui/Progress';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { Logo } from './ui/Logo';
import { Input } from './ui/Input';
import apiService from '../services/api';

interface Tutorial {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  type: 'video' | 'artikel';
  imageUrl: string;
  createdAt: string;
}

interface HomePageProps {
  user: any | null;
  onNavigate: (page: string, tutorialId?: string) => void;
  onLogout: () => void;
}

export function HomePage({ user, onNavigate, onLogout }: HomePageProps) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [learningData, setLearningData] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // Filter & Sort states
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterProgress, setFilterProgress] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'Pemula' | 'Menengah' | 'Mahir'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration-short' | 'duration-long'>('newest');

  const categories = ['Semua', 'Pertukangan Kayu', 'Pengecatan', 'Listrik', 'Plambing', 'Perawatan'];

  useEffect(() => {
    const loadLearning = async () => {
      if (user) {
        const data = await AsyncStorage.getItem(`learning_${user.email}`);
        setLearningData(data ? JSON.parse(data) : []);
      } else {
        setLearningData([]);
      }
    };
    loadLearning();
  }, [user]);

  useEffect(() => {
    loadTutorials();
  }, []);

  useEffect(() => {
    filterTutorials();
  }, [tutorials, searchQuery, selectedCategory]);

  const loadTutorials = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getTutorials();
      setTutorials(data);
    } catch (error) {
      console.error('Failed to load tutorials:', error);
      setTutorials([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTutorials = () => {
    let filtered = tutorials;
    
    // Filter by category
    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredTutorials(filtered);
  };

  const getTutorialStatus = (tutorialId: string) => {
    if (!user) return null;
    const learning = learningData.find((item: any) => item.tutorialId === tutorialId);
    if (!learning) return null;
    return learning.completed ? 'completed' : 'ongoing';
  };


  const formatDuration = (duration: string): string => {
    const minutes = parseInt(duration);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}j ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const filteredAndSortedTutorials = tutorials
    .filter((tutorial) => {
      const matchesSearch =
        tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || tutorial.category === selectedCategory;

      let matchesProgress = true;
      if (user && filterProgress !== 'all') {
        const status = getTutorialStatus(tutorial._id);
        if (filterProgress === 'ongoing') matchesProgress = status === 'ongoing';
        else if (filterProgress === 'completed') matchesProgress = status === 'completed';
      }

      const matchesDifficulty = filterDifficulty === 'all' || tutorial.difficulty === filterDifficulty;
      return matchesSearch && matchesCategory && matchesProgress && matchesDifficulty;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'duration-short': return parseDuration(a.duration) - parseDuration(b.duration);
        case 'duration-long': return parseDuration(b.duration) - parseDuration(a.duration);
        default: return 0;
      }
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Pemula': return { bg: '#dcfce7', text: '#15803d' };
      case 'Menengah': return { bg: '#fef9c3', text: '#a16207' };
      case 'Mahir': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const handleViewDetail = (tutorialId: string) => {
    if (!user) {
      onNavigate('login', tutorialId);
    } else {
      onNavigate('detail', tutorialId);
    }
  };

  // Profile/Account View
  if (activeTab === 'profile') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
          <Logo size={32} />
          <Text style={styles.headerTitle}>Profil</Text>
        </View>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
          {user ? (
            <View style={styles.card}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.name?.charAt(0) || 'U'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{user.name}</Text>
                  <Text style={styles.profileUsername}>@{user.username}</Text>
                  <Text style={styles.profileEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={{ gap: 16 }}>
                <View>
                  <Text style={styles.labelSmall}>Karang Taruna</Text>
                  <Text style={styles.valueText}>{user.karangTarunaName || '-'}</Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Peran Anggota</Text>
                  <Text style={styles.valueText}>{user.peranAnggota || '-'}</Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Tingkat Keahlian</Text>
                  {user.skillLevel ? (
                    <Badge
                      style={{ backgroundColor: getDifficultyColor(user.skillLevel).bg }}
                      textStyle={{ color: getDifficultyColor(user.skillLevel).text }}
                    >
                      {user.skillLevel}
                    </Badge>
                  ) : (
                    <Text style={styles.valueText}>-</Text>
                  )}
                </View>
                <View>
                  <Text style={styles.labelSmall}>Minat DIY</Text>
                  {user.interests && user.interests.length > 0 ? (
                    <View style={styles.tagRow}>
                      {user.interests.map((interest: string) => (
                        <Badge key={interest} variant="secondary">{interest}</Badge>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.valueText}>-</Text>
                  )}
                </View>

                <View style={styles.divider} />

                <View>
                  <Text style={styles.labelSmall}>Provinsi</Text>
                  <Text style={styles.valueText}>{user.provinsi || '-'}</Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Kabupaten/Kota</Text>
                  <Text style={styles.valueText}>{user.kabupatenKota || '-'}</Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Kecamatan</Text>
                  <Text style={styles.valueText}>{user.kecamatan || '-'}</Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Jalan</Text>
                  <Text style={styles.valueText}>{user.jalan || '-'}</Text>
                </View>
                <View>
                  <Text style={styles.labelSmall}>Nomor Telepon</Text>
                  <Text style={styles.valueText}>{user.phone || '-'}</Text>
                </View>
              </View>

              <Button
                onPress={onLogout}
                variant="outline"
                style={{ marginTop: 24, borderColor: '#fecaca' }}
                textStyle={{ color: '#dc2626' }}
              >
                Keluar
              </Button>
            </View>
          ) : (
            <View style={[styles.card, { alignItems: 'center', paddingVertical: 32 }]}>
              <View style={styles.emptyAvatar}>
                <MaterialIcons name="person" size={40} color="#9ca3af" />
              </View>
              <Text style={styles.emptyTitle}>Belum Login</Text>
              <Text style={styles.emptySubtitle}>Login untuk mengakses fitur lengkap</Text>
              <Button onPress={() => onNavigate('login')} style={{ width: '100%', marginTop: 16 }}>
                Login
              </Button>
              <Button onPress={() => onNavigate('register')} variant="outline" style={{ width: '100%', marginTop: 8 }}>
                Daftar Akun Baru
              </Button>
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
            <MaterialIcons name="home" size={22} color="#6b7280" />
            <Text style={styles.navLabel}>Beranda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => user ? onNavigate('my-learning') : onNavigate('login')}>
            <MaterialIcons name="menu-book" size={22} color="#6b7280" />
            <Text style={styles.navLabel}>Belajar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
            <MaterialIcons name="person" size={22} color="#6b7280" />
            <Text style={[styles.navLabel, styles.navActive]}>Profil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main Home View
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Logo size={32} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Karang Taruna DIY</Text>
            {user && <Text style={styles.headerSubtitle}>Halo, {user.name}</Text>}
          </View>
        </View>

        {/* Search */}
        {showSearch && (
          <View style={styles.searchRow}>
            <Input
              placeholder="Cari tutorial..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1 }}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchQuery(''); setShowSearch(false); }} style={styles.closeBtn}>
              <MaterialIcons name="close" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Category & Filter/Sort Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterBtn, { flex: 1 }]}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={styles.filterBtnText} numberOfLines={1}>
              {selectedCategory === 'Semua' ? 'Kategori' : selectedCategory}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={10} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, showSearch && styles.filterBtnActive]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <MaterialIcons name="search" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, (showFilterMenu || filterProgress !== 'all' || filterDifficulty !== 'all') && styles.filterBtnActive]}
            onPress={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
          >
            <MaterialIcons name="settings" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, (showSortMenu || sortBy !== 'newest') && styles.filterBtnActive]}
            onPress={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
          >
            <MaterialIcons name="sort" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Category Dropdown */}
        {showCategoryDropdown && (
          <View style={styles.dropdown}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => { setSelectedCategory(category); setShowCategoryDropdown(false); }}
                style={[styles.dropdownItem, selectedCategory === category && styles.dropdownItemActive]}
              >
                <Text style={[styles.dropdownItemText, selectedCategory === category && styles.dropdownItemTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Filter Menu */}
        {showFilterMenu && (
          <View style={styles.filterMenu}>
            {user && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.filterMenuLabel}>Status Progress</Text>
                <View style={styles.chipRow}>
                  {(['all', 'ongoing', 'completed'] as const).map((val) => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setFilterProgress(val)}
                      style={[styles.chip, filterProgress === val && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, filterProgress === val && styles.chipTextActive]}>
                        {val === 'all' ? 'Semua' : val === 'ongoing' ? 'Sedang Belajar' : 'Selesai'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            <View>
              <Text style={styles.filterMenuLabel}>Tingkat Keahlian</Text>
              <View style={styles.chipRow}>
                {(['all', 'Pemula', 'Menengah', 'Mahir'] as const).map((val) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setFilterDifficulty(val)}
                    style={[styles.chip, filterDifficulty === val && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, filterDifficulty === val && styles.chipTextActive]}>
                      {val === 'all' ? 'Semua' : val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Sort Menu */}
        {showSortMenu && (
          <View style={styles.filterMenu}>
            <Text style={styles.filterMenuLabel}>Urutkan</Text>
            {([
              { key: 'newest', label: 'Tutorial Terbaru' },
              { key: 'oldest', label: 'Tutorial Terlama' },
              { key: 'duration-short', label: 'Durasi Terpendek' },
              { key: 'duration-long', label: 'Durasi Terpanjang' },
            ] as const).map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => { setSortBy(item.key); setShowSortMenu(false); }}
                style={[styles.sortItem, sortBy === item.key && styles.sortItemActive]}
              >
                <Text style={[styles.sortItemText, sortBy === item.key && styles.sortItemTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Tutorial List */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {selectedCategory === 'Semua' ? 'Semua Tutorial' : selectedCategory}
          </Text>
          <Text style={styles.listCount}>{filteredAndSortedTutorials.length} tutorial</Text>
        </View>

        {isLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <ActivityIndicator size="large" color="#dc2626" />
            <Text style={{ marginTop: 16, color: '#6b7280' }}>Memuat tutorials...</Text>
          </View>
        ) : filteredAndSortedTutorials.length > 0 ? (
          filteredAndSortedTutorials.map((tutorial) => {
            const status = getTutorialStatus(tutorial._id);
            const diffColor = getDifficultyColor(tutorial.difficulty);
            return (
              <TouchableOpacity
                key={tutorial._id}
                activeOpacity={0.8}
                onPress={() => handleViewDetail(tutorial._id)}
                style={styles.tutorialCard}
              >
                <View style={styles.tutorialImageContainer}>
                  <ImageWithFallback
                    src={tutorial.imageUrl}
                    alt={tutorial.title}
                    style={styles.tutorialImage}
                  />
                  <View style={styles.tutorialBadgeRow}>
                    {status === 'completed' && (
                      <Badge style={{ backgroundColor: '#16a34a' }}>
                        <Text style={{ color: '#fff', fontSize: 11 }}><MaterialIcons name="check" size={14} color="#fff" /> Selesai</Text>
                      </Badge>
                    )}
                    {status === 'ongoing' && (
                      <Badge style={{ backgroundColor: '#ea580c' }}>
                        <Text style={{ color: '#fff', fontSize: 11 }}><MaterialIcons name="play-arrow" size={14} color="#fff" /> Sedang Belajar</Text>
                      </Badge>
                    )}
                    <Badge style={{ backgroundColor: tutorial.type === 'video' ? '#dc2626' : '#2563eb' }}>
                      <Text style={{ color: '#fff', fontSize: 11 }}>
                        {tutorial.type === 'video' ? <><MaterialIcons name="videocam" size={14} color="#fff" /> Video</> : <><MaterialIcons name="description" size={14} color="#fff" /> Artikel</>}
                      </Text>
                    </Badge>
                  </View>
                </View>
                <View style={styles.tutorialInfo}>
                  <Text style={styles.tutorialTitle} numberOfLines={2}>{tutorial.title}</Text>
                  <Text style={styles.tutorialDesc} numberOfLines={2}>{tutorial.description}</Text>
                  <View style={styles.tagRow}>
                    <Badge variant="secondary">{tutorial.category}</Badge>
                    <Badge style={{ backgroundColor: diffColor.bg }} textStyle={{ color: diffColor.text }}>
                      {tutorial.difficulty}
                    </Badge>
                    <Text style={styles.durationText}><MaterialIcons name="access-time" size={14} color="#666" /> {formatDuration(tutorial.duration)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Tidak ada tutorial yang tersedia</Text>
            <Text style={styles.emptyStateSubtext}>Tarik ke bawah untuk refresh</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <MaterialIcons name="home" size={22} color="#6b7280" />
          <Text style={[styles.navLabel, styles.navActive]}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => user ? onNavigate('my-learning') : onNavigate('login')}>
          <MaterialIcons name="menu-book" size={22} color="#6b7280" />
          <Text style={styles.navLabel}>Belajar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <MaterialIcons name="person" size={22} color="#6b7280" />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingHorizontal: 16, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 8, marginBottom: 12 },
  logoPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#111827' },
  headerSubtitle: { fontSize: 12, color: '#6b7280' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  closeBtn: { padding: 8 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  filterBtnText: { fontSize: 13, fontWeight: '500', color: '#374151', flex: 1 },
  filterBtnActive: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  dropdown: { backgroundColor: '#fff', borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemActive: { backgroundColor: '#fef2f2' },
  dropdownItemText: { fontSize: 14, color: '#374151' },
  dropdownItemTextActive: { color: '#dc2626', fontWeight: '600' },
  filterMenu: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 12, marginTop: 8 },
  filterMenuLabel: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  chipActive: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  chipText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  chipTextActive: { color: '#fff' },
  sortItem: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, marginBottom: 4, backgroundColor: '#fff' },
  sortItemActive: { backgroundColor: '#dc2626' },
  sortItemText: { fontSize: 13, color: '#374151' },
  sortItemTextActive: { color: '#fff', fontWeight: '600' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  listTitle: { fontWeight: '600', fontSize: 16, color: '#111827' },
  listCount: { fontSize: 12, color: '#6b7280' },
  tutorialCard: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tutorialImageContainer: { height: 192, position: 'relative' },
  tutorialImage: { width: '100%', height: 192 },
  tutorialBadgeRow: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  tutorialInfo: { padding: 16 },
  tutorialTitle: { fontWeight: '600', fontSize: 15, color: '#111827', marginBottom: 8 },
  tutorialDesc: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  durationText: { fontSize: 12, color: '#6b7280' },
  emptyState: { alignItems: 'center', paddingVertical: 48, backgroundColor: '#fff', borderRadius: 16 },
  emptyStateText: { color: '#6b7280', fontSize: 14, fontWeight: '500' },
  emptyStateSubtext: { color: '#9ca3af', fontSize: 12, marginTop: 4 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', flexDirection: 'row', paddingVertical: 8, paddingBottom: 16 },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 11, color: '#6b7280' },
  navActive: { color: '#dc2626', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  profileName: { fontWeight: 'bold', fontSize: 18, color: '#111827' },
  profileUsername: { fontSize: 14, color: '#6b7280' },
  profileEmail: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 16 },
  labelSmall: { fontSize: 12, color: '#9ca3af', marginBottom: 4 },
  valueText: { fontSize: 14, fontWeight: '500', color: '#111827' },
  valueTextSm: { fontSize: 13, color: '#374151' },
  emptyAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontWeight: '600', fontSize: 18, color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
});
