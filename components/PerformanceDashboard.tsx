import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Clock, 
  Star, 
  DollarSign,
  Calendar,
  Award,
  AlertTriangle,
} from 'lucide-react-native';
import { Colors } from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

interface PerformanceMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface DailyStats {
  date: string;
  deliveries: number;
  earnings: number;
  rating: number;
  distance: number;
}

interface PerformanceDashboardProps {
  driverId?: string;
  period?: 'today' | 'week' | 'month';
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  driverId,
  period = 'week',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [selectedMetric, setSelectedMetric] = useState<string>('deliveries');

  // Mock data - in real app, this would come from API
  const metrics: PerformanceMetric[] = useMemo(() => [
    {
      label: 'Deliveries',
      value: selectedPeriod === 'today' ? 12 : selectedPeriod === 'week' ? 78 : 312,
      change: 15,
      trend: 'up',
      icon: <Package size={20} color={Colors.primary} />,
      color: Colors.primary,
    },
    {
      label: 'Earnings',
      value: selectedPeriod === 'today' ? '₦12,500' : selectedPeriod === 'week' ? '₦87,300' : '₦348,200',
      change: 22,
      trend: 'up',
      icon: <DollarSign size={20} color={Colors.success} />,
      color: Colors.success,
    },
    {
      label: 'Avg. Time',
      value: selectedPeriod === 'today' ? '28 min' : selectedPeriod === 'week' ? '31 min' : '29 min',
      change: -5,
      trend: 'down',
      icon: <Clock size={20} color={Colors.info} />,
      color: Colors.info,
    },
    {
      label: 'Rating',
      value: 4.8,
      change: 0.2,
      trend: 'up',
      icon: <Star size={20} color={Colors.warning} />,
      color: Colors.warning,
    },
  ], [selectedPeriod]);

  const dailyStats: DailyStats[] = [
    { date: 'Mon', deliveries: 15, earnings: 15000, rating: 4.7, distance: 45 },
    { date: 'Tue', deliveries: 18, earnings: 18500, rating: 4.8, distance: 52 },
    { date: 'Wed', deliveries: 12, earnings: 12000, rating: 4.9, distance: 38 },
    { date: 'Thu', deliveries: 20, earnings: 21000, rating: 4.6, distance: 58 },
    { date: 'Fri', deliveries: 22, earnings: 24000, rating: 4.8, distance: 65 },
    { date: 'Sat', deliveries: 25, earnings: 28000, rating: 4.9, distance: 72 },
    { date: 'Sun', deliveries: 19, earnings: 19500, rating: 4.7, distance: 55 },
  ];

  const achievements = [
    { id: '1', title: 'Speed Demon', description: '100 deliveries under 30 min', icon: '⚡', unlocked: true },
    { id: '2', title: 'Five Star', description: 'Maintain 5.0 rating for a week', icon: '⭐', unlocked: true },
    { id: '3', title: 'Marathon', description: 'Complete 500km in a month', icon: '🏃', unlocked: false },
    { id: '4', title: 'Early Bird', description: '50 morning deliveries', icon: '🌅', unlocked: true },
  ];

  const getChartHeight = (value: number, max: number) => {
    return (value / max) * 100;
  };

  const maxDeliveries = Math.max(...dailyStats.map(d => d.deliveries));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['today', 'week', 'month'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              selectedPeriod === p && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(p)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === p && styles.periodButtonTextActive,
            ]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.metricCard,
              selectedMetric === metric.label.toLowerCase() && styles.metricCardActive,
            ]}
            onPress={() => setSelectedMetric(metric.label.toLowerCase())}
          >
            <View style={styles.metricHeader}>
              {metric.icon}
              <View style={[
                styles.trendBadge,
                { backgroundColor: metric.trend === 'up' ? Colors.success : Colors.error }
              ]}>
                {metric.trend === 'up' ? (
                  <TrendingUp size={12} color="white" />
                ) : (
                  <TrendingDown size={12} color="white" />
                )}
                <Text style={styles.trendText}>
                  {Math.abs(metric.change)}%
                </Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Daily Performance</Text>
        <View style={styles.chart}>
          {dailyStats.map((day, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: `${getChartHeight(day.deliveries, maxDeliveries)}%`,
                      backgroundColor: index === new Date().getDay() - 1 ? Colors.primary : Colors.primaryLight,
                    }
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{day.date}</Text>
              <Text style={styles.chartValue}>{day.deliveries}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Performance Insights */}
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>Performance Insights</Text>
        
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <TrendingUp size={20} color={Colors.success} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Great Progress!</Text>
            <Text style={styles.insightText}>
              Your delivery speed improved by 15% this week. Keep it up!
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={[styles.insightIcon, { backgroundColor: `${Colors.warning}20` }]}>
            <AlertTriangle size={20} color={Colors.warning} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Peak Hours Alert</Text>
            <Text style={styles.insightText}>
              Consider working 5-7 PM for 30% higher earnings potential.
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={[styles.insightIcon, { backgroundColor: `${Colors.info}20` }]}>
            <Calendar size={20} color={Colors.info} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Weekend Bonus</Text>
            <Text style={styles.insightText}>
              Complete 10 more deliveries this weekend to unlock bonus rewards.
            </Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.achievementsContainer}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementCardLocked,
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={[
                styles.achievementTitle,
                !achievement.unlocked && styles.achievementTitleLocked,
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                styles.achievementDescription,
                !achievement.unlocked && styles.achievementDescriptionLocked,
              ]}>
                {achievement.description}
              </Text>
              {achievement.unlocked && (
                <View style={styles.unlockedBadge}>
                  <Award size={12} color={Colors.success} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Leaderboard Position */}
      <View style={styles.leaderboardCard}>
        <View style={styles.leaderboardHeader}>
          <Award size={24} color={Colors.warning} />
          <Text style={styles.leaderboardTitle}>Leaderboard Position</Text>
        </View>
        <View style={styles.leaderboardStats}>
          <View style={styles.leaderboardStat}>
            <Text style={styles.leaderboardRank}>#3</Text>
            <Text style={styles.leaderboardLabel}>This Week</Text>
          </View>
          <View style={styles.leaderboardDivider} />
          <View style={styles.leaderboardStat}>
            <Text style={styles.leaderboardRank}>#12</Text>
            <Text style={styles.leaderboardLabel}>All Time</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.viewLeaderboardButton}>
          <Text style={styles.viewLeaderboardText}>View Full Leaderboard</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  periodButtonTextActive: {
    color: 'white',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  metricCard: {
    width: (screenWidth - 44) / 2,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  trendText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  chartContainer: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 8,
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  insightsContainer: {
    padding: 16,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 18,
  },
  achievementsContainer: {
    paddingLeft: 16,
    paddingBottom: 16,
  },
  achievementCard: {
    width: 120,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementCardLocked: {
    opacity: 0.6,
    backgroundColor: Colors.background,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: Colors.textLight,
  },
  achievementDescription: {
    fontSize: 10,
    color: Colors.textLight,
    textAlign: 'center',
  },
  achievementDescriptionLocked: {
    color: Colors.textLight,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  leaderboardCard: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  leaderboardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  leaderboardStat: {
    alignItems: 'center',
  },
  leaderboardRank: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  leaderboardLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  leaderboardDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  viewLeaderboardButton: {
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewLeaderboardText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});