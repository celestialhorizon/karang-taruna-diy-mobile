import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { ImageWithFallback } from './ui/ImageWithFallback';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  type: 'video' | 'artikel';
  image: string;
  createdAt: string;
}

interface HomePageProps {
  user: any | null;
  onNavigate: (page: string, tutorialId?: number) => void;
  onLogout: () => void;
}

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: 'Cara Memperbaiki Keran Air yang Bocor',
    description: 'Pelajari teknik dasar memperbaiki keran air yang bocor dengan mudah dan cepat.',
    category: 'Plambing',
    difficulty: 'Pemula',
    duration: '15 menit',
    type: 'video',
    image: 'https://images.unsplash.com/photo-1681249537103-9e0c7316d91e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHJlcGFpciUyMHR1dG9yaWFsfGVufDF8fHx8MTc3MDY2MDMxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    createdAt: '2025-02-05',
  },
  {
    id: 2,
    title: 'Instalasi Listrik Dasar untuk Rumah',
    description: 'Panduan lengkap instalasi listrik sederhana yang aman untuk pemula.',
    category: 'Listrik',
    difficulty: 'Menengah',
    duration: '25 menit',
    type: 'artikel',
    image: 'https://images.unsplash.com/photo-1767514536575-82aaf8b0afc4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwd2lyaW5nJTIwcmVwYWlyfGVufDF8fHx8MTc3MDY2MDMxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    createdAt: '2025-02-03',
  },
  {
    id: 3,
    title: 'Teknik Mengecat Dinding dengan Rapi',
    description: 'Tips dan trik mengecat dinding rumah agar hasilnya profesional dan tahan lama.',
    category: 'Pengecatan',
    difficulty: 'Pemula',
    duration: '20 menit',
    type: 'video',
    image: 'https://images.unsplash.com/photo-1523250217488-ab35967e9840?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGluZyUyMHdhbGwlMjBob21lfGVufDF8fHx8MTc3MDY2MDMxNHww&ixlib=rb-4.1.0&q=80&w=1080',
    createdAt: '2025-02-07',
  },
  {
    id: 4,
    title: 'Membuat Rak Kayu Sederhana',
    description: 'Proyek DIY membuat rak kayu multifungsi untuk penyimpanan di rumah.',
    category: 'Pertukangan Kayu',
    difficulty: 'Menengah',
    duration: '45 menit',
    type: 'video',
    image: 'https://images.unsplash.com/flagged/photo-1596715932857-56e359217a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kd29ya2luZyUyMGNyYWZ0c21hbnNoaXB8ZW58MXx8fHwxNzcwNjM2ODczfDA&ixlib=rb-4.1.0&q=80&w=1080',
    createdAt: '2025-01-28',
  },
  {
    id: 5,
    title: 'Perawatan Alat-Alat Pertukangan',
    description: 'Cara merawat dan menyimpan alat pertukangan agar awet dan siap pakai.',
    category: 'Perawatan',
    difficulty: 'Pemula',
    duration: '10 menit',
    type: 'artikel',
    image: 'https://images.unsplash.com/photo-1765518440022-10242cc86895?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwbWFpbnRlbmFuY2UlMjB0b29sc3xlbnwxfHx8fDE3NzA2NTY3Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    createdAt: '2025-02-01',
  },
  {
    id: 6,
    title: 'Dasar-Dasar Penggunaan Alat Pertukangan',
    description: 'Kenali berbagai jenis alat pertukangan dan cara penggunaannya yang benar.',
    category: 'Pertukangan Kayu',
    difficulty: 'Pemula',
    duration: '30 menit',
    type: 'artikel',
    image: 'https://images.unsplash.com/photo-1683115098652-db9813ecf284?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50cnklMjB0b29scyUyMHdvcmtzaG9wfGVufDF8fHx8MTc3MDY2MDMxM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    createdAt: '2025-02-08',
  },
];

const categories = ['Semua', 'Pertukangan Kayu', 'Pengecatan', 'Listrik', 'Plambing', 'Perawatan'];

export function HomePage({ user, onNavigate, onLogout }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
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

  const getTutorialStatus = (tutorialId: number) => {
    if (!user) return null;
    const learning = learningData.find((item: any) => item.tutorialId === tutorialId);
    if (!learning) return null;
    return learning.completed ? 'completed' : 'ongoing';
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const filteredAndSortedTutorials = tutorials
    .filter((tutorial) => {
      const matchesSearch =
        tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Semua' || tutorial.category === selectedCategory;

      let matchesProgress = true;
      if (user && filterProgress !== 'all') {
        const status = getTutorialStatus(tutorial.id);
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

  const handleViewDetail = (tutorialId: number) => {
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
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>KT</Text>
            </View>
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
                {user.role && (
                  <View>
                    <Text style={styles.labelSmall}>Peran</Text>
                    <Text style={styles.valueText}>{user.role}</Text>
                  </View>
                )}
                {user.skillLevel && (
                  <View>
                    <Text style={styles.labelSmall}>Tingkat Keahlian</Text>
                    <Badge
                      style={{ backgroundColor: getDifficultyColor(user.skillLevel).bg }}
                      textStyle={{ color: getDifficultyColor(user.skillLevel).text }}
                    >
                      {user.skillLevel}
                    </Badge>
                  </View>
                )}
                {user.interests && user.interests.length > 0 && (
                  <View>
                    <Text style={styles.labelSmall}>Minat DIY</Text>
                    <View style={styles.tagRow}>
                      {user.interests.map((interest: string) => (
                        <Badge key={interest} variant="secondary">{interest}</Badge>
                      ))}
                    </View>
                  </View>
                )}
                {user.address && (
                  <View>
                    <Text style={styles.labelSmall}>Domisili</Text>
                    <Text style={styles.valueTextSm}>{user.address.kecamatan}, {user.address.kabupatenKota}</Text>
                    <Text style={[styles.valueTextSm, { color: '#6b7280' }]}>{user.address.provinsi}</Text>
                  </View>
                )}
                {user.phone && (
                  <View>
                    <Text style={styles.labelSmall}>Nomor Telepon</Text>
                    <Text style={styles.valueText}>{user.phone}</Text>
                  </View>
                )}
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
                <Text style={{ fontSize: 40, color: '#9ca3af' }}>👤</Text>
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
            <Text style={styles.navIcon}>🏠</Text>
            <Text style={styles.navLabel}>Beranda</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => user ? onNavigate('my-learning') : onNavigate('login')}>
            <Text style={styles.navIcon}>📖</Text>
            <Text style={styles.navLabel}>Belajar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
            <Text style={[styles.navIcon]}>👤</Text>
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
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>KT</Text>
          </View>
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
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={{ flex: 1 }}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchTerm(''); setShowSearch(false); }} style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: '#6b7280' }}>✕</Text>
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
            <Text style={{ fontSize: 10, color: '#6b7280' }}>▼</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, showSearch && styles.filterBtnActive]}
            onPress={() => setShowSearch(!showSearch)}
          >
            <Text style={{ fontSize: 16 }}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, (showFilterMenu || filterProgress !== 'all' || filterDifficulty !== 'all') && styles.filterBtnActive]}
            onPress={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
          >
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterBtn, (showSortMenu || sortBy !== 'newest') && styles.filterBtnActive]}
            onPress={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
          >
            <Text style={{ fontSize: 16 }}>↕️</Text>
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

        {filteredAndSortedTutorials.length > 0 ? (
          filteredAndSortedTutorials.map((tutorial) => {
            const status = getTutorialStatus(tutorial.id);
            const diffColor = getDifficultyColor(tutorial.difficulty);
            return (
              <TouchableOpacity
                key={tutorial.id}
                activeOpacity={0.8}
                onPress={() => handleViewDetail(tutorial.id)}
                style={styles.tutorialCard}
              >
                <View style={styles.tutorialImageContainer}>
                  <ImageWithFallback
                    src={tutorial.image}
                    alt={tutorial.title}
                    style={styles.tutorialImage}
                  />
                  <View style={styles.tutorialBadgeRow}>
                    {status === 'completed' && (
                      <Badge style={{ backgroundColor: '#16a34a' }}>
                        <Text style={{ color: '#fff', fontSize: 11 }}>✓ Selesai</Text>
                      </Badge>
                    )}
                    {status === 'ongoing' && (
                      <Badge style={{ backgroundColor: '#ea580c' }}>
                        <Text style={{ color: '#fff', fontSize: 11 }}>▶ Sedang Belajar</Text>
                      </Badge>
                    )}
                    {!status && <View />}
                    <Badge style={{ backgroundColor: tutorial.type === 'video' ? '#dc2626' : '#2563eb' }}>
                      <Text style={{ color: '#fff', fontSize: 11 }}>
                        {tutorial.type === 'video' ? '🎬 Video' : '📄 Artikel'}
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
                    <Text style={styles.durationText}>🕐 {tutorial.duration}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Tidak ada tutorial yang ditemukan</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navLabel, styles.navActive]}>Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => user ? onNavigate('my-learning') : onNavigate('login')}>
          <Text style={styles.navIcon}>📖</Text>
          <Text style={styles.navLabel}>Belajar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <Text style={styles.navIcon}>👤</Text>
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
  emptyStateText: { color: '#6b7280', fontSize: 14 },
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
