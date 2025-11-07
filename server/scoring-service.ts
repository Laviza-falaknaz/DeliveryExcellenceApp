import { storage } from "./storage";
import type { EnvironmentalImpact, GamificationSetting } from "@shared/schema";

interface ScoringWeights {
  carbon: number;
  water: number;
  resources: number;
  social: number;
}

interface ScoringMultipliers {
  baseUnit: number;
  carbonMultiplier: number;
  waterMultiplier: number;
  resourcesMultiplier: number;
  socialMultiplier: number;
}

interface ScoreBreakdown {
  carbon: number;
  water: number;
  resources: number;
  social: number;
}

interface ESGScoreResult {
  totalScore: number;
  breakdown: ScoreBreakdown;
  tierId: number | null;
  tierName: string;
  previousScore?: number;
  scoreChange?: number;
}

export class ScoringService {
  private defaultWeights: ScoringWeights = {
    carbon: 40,
    water: 25,
    resources: 20,
    social: 15
  };

  private defaultMultipliers: ScoringMultipliers = {
    baseUnit: 1000,
    carbonMultiplier: 1,
    waterMultiplier: 0.5,
    resourcesMultiplier: 0.8,
    socialMultiplier: 2
  };

  async getScoringWeights(): Promise<ScoringWeights> {
    const setting = await storage.getGamificationSetting('scoring_weights');
    if (setting?.settingValue) {
      return setting.settingValue as ScoringWeights;
    }
    return this.defaultWeights;
  }

  async getScoringMultipliers(): Promise<ScoringMultipliers> {
    const setting = await storage.getGamificationSetting('scoring_normalization');
    if (setting?.settingValue) {
      return setting.settingValue as ScoringMultipliers;
    }
    return this.defaultMultipliers;
  }

  async calculateUserESGScore(userId: number): Promise<ESGScoreResult> {
    const impacts = await storage.getEnvironmentalImpactByUserId(userId);
    const totalImpact = await storage.getTotalEnvironmentalImpact(userId);
    
    const weights = await this.getScoringWeights();
    const multipliers = await this.getScoringMultipliers();

    const carbonScore = this.calculatePillarScore(
      totalImpact.carbonSaved,
      multipliers.carbonMultiplier,
      multipliers.baseUnit
    );

    const waterScore = this.calculatePillarScore(
      totalImpact.waterProvided,
      multipliers.waterMultiplier,
      multipliers.baseUnit
    );

    const resourcesScore = this.calculatePillarScore(
      totalImpact.mineralsSaved,
      multipliers.resourcesMultiplier,
      multipliers.baseUnit
    );

    const socialScore = this.calculatePillarScore(
      totalImpact.familiesHelped,
      multipliers.socialMultiplier,
      1
    );

    const breakdown: ScoreBreakdown = {
      carbon: carbonScore,
      water: waterScore,
      resources: resourcesScore,
      social: socialScore
    };

    const weightedCarbon = carbonScore * (weights.carbon / 100);
    const weightedWater = waterScore * (weights.water / 100);
    const weightedResources = resourcesScore * (weights.resources / 100);
    const weightedSocial = socialScore * (weights.social / 100);

    const totalScore = Math.round(
      weightedCarbon + weightedWater + weightedResources + weightedSocial
    );

    const tier = await storage.getTierByScore(totalScore);

    const previousScore = await storage.getCurrentUserEsgScore(userId);

    return {
      totalScore,
      breakdown,
      tierId: tier?.id || null,
      tierName: tier?.name || 'Explorer',
      previousScore: previousScore?.totalScore || 0,
      scoreChange: totalScore - (previousScore?.totalScore || 0)
    };
  }

  private calculatePillarScore(
    value: number,
    multiplier: number,
    baseUnit: number
  ): number {
    return Math.round((value / baseUnit) * multiplier);
  }

  async updateUserESGScore(userId: number): Promise<void> {
    const scoreResult = await this.calculateUserESGScore(userId);
    
    const existingScore = await storage.getCurrentUserEsgScore(userId);
    
    if (existingScore) {
      await storage.updateEsgScore(existingScore.id, {
        totalScore: scoreResult.totalScore,
        tierId: scoreResult.tierId,
        breakdown: scoreResult.breakdown,
        calculatedAt: new Date()
      });
    } else {
      await storage.createEsgScore({
        userId,
        period: 'current',
        totalScore: scoreResult.totalScore,
        tierId: scoreResult.tierId,
        breakdown: scoreResult.breakdown
      });
    }

    await this.checkAndUnlockAchievements(userId);
    await this.checkAndReachMilestones(userId, scoreResult.totalScore);
  }

  async checkAndUnlockAchievements(userId: number): Promise<void> {
    const achievements = await storage.getActiveGamificationAchievements();
    const totalImpact = await storage.getTotalEnvironmentalImpact(userId);
    const userOrders = await storage.getOrdersByUserId(userId);

    const metrics: Record<string, number> = {
      carbon_saved: totalImpact.carbonSaved,
      water_provided: totalImpact.waterProvided,
      minerals_saved: totalImpact.mineralsSaved,
      families_helped: totalImpact.familiesHelped,
      orders_count: userOrders.length
    };

    for (const achievement of achievements) {
      const metricValue = metrics[achievement.thresholdType] || 0;
      const thresholdValue = parseFloat(achievement.thresholdValue);
      
      const existingProgress = await storage.getUserAchievementProgressForAchievement(
        userId,
        achievement.id
      );

      const currentValue = metricValue.toString();
      const progressPercent = Math.min(
        Math.round((metricValue / thresholdValue) * 100),
        100
      );

      if (existingProgress) {
        if (metricValue >= thresholdValue && !existingProgress.isUnlocked) {
          await storage.unlockGamificationAchievement(userId, achievement.id);
        } else if (metricValue < thresholdValue) {
          await storage.updateUserAchievementProgress(existingProgress.id, {
            currentValue,
            progressPercent
          });
        }
      } else {
        if (metricValue >= thresholdValue) {
          await storage.unlockGamificationAchievement(userId, achievement.id);
        } else {
          await storage.createUserAchievementProgress({
            userId,
            achievementId: achievement.id,
            currentValue,
            progressPercent,
            isUnlocked: false
          });
        }
      }
    }
  }

  async checkAndReachMilestones(userId: number, currentScore: number): Promise<void> {
    const milestones = await storage.getActiveGamificationMilestones();
    
    for (const milestone of milestones) {
      if (milestone.requiredScore !== null && currentScore >= milestone.requiredScore) {
        const hasReached = await storage.hasReachedMilestone(userId, milestone.id);
        
        if (!hasReached) {
          await storage.createUserMilestoneEvent({
            userId,
            milestoneId: milestone.id,
            metadata: {
              score: currentScore,
              reachedAt: new Date()
            }
          });
        }
      }
    }
  }

  async getLeaderboard(limit: number = 10, period: string = 'current'): Promise<any[]> {
    const topScores = await storage.getTopEsgScores(limit, period);
    
    const leaderboardConfig = await storage.getGamificationSetting('leaderboard_config');
    const anonymizeNames = leaderboardConfig?.settingValue?.anonymizeNames ?? true;

    const leaderboardData = await Promise.all(
      topScores.map(async (score, index) => {
        const user = await storage.getUser(score.userId);
        const tier = score.tierId ? await storage.getGamificationTier(score.tierId) : null;

        return {
          rank: index + 1,
          userId: score.userId,
          name: anonymizeNames ? `User ${score.userId}` : user?.name || 'Anonymous',
          company: anonymizeNames ? undefined : user?.company,
          totalScore: score.totalScore,
          tier: tier?.name || 'Explorer',
          tierColor: tier?.colorAccent || '#78909C',
          breakdown: score.breakdown
        };
      })
    );

    return leaderboardData;
  }

  async getUserRank(userId: number, period: string = 'current'): Promise<number> {
    const allScores = await storage.getTopEsgScores(1000, period);
    const userScoreIndex = allScores.findIndex(score => score.userId === userId);
    
    return userScoreIndex >= 0 ? userScoreIndex + 1 : -1;
  }

  async getBenchmarkComparison(userId: number): Promise<{
    userScore: number;
    averageScore: number;
    percentile: number;
    rank: number;
    totalUsers: number;
  }> {
    const allScores = await storage.getTopEsgScores(1000, 'current');
    const userScore = await storage.getCurrentUserEsgScore(userId);

    const totalUsers = allScores.length;
    const userRank = await this.getUserRank(userId);
    
    const averageScore = totalUsers > 0
      ? Math.round(allScores.reduce((sum, s) => sum + s.totalScore, 0) / totalUsers)
      : 0;

    const percentile = userRank > 0 && totalUsers > 0
      ? Math.round(((totalUsers - userRank + 1) / totalUsers) * 100)
      : 0;

    return {
      userScore: userScore?.totalScore || 0,
      averageScore,
      percentile,
      rank: userRank,
      totalUsers
    };
  }

  async awardShippingBonus(userId: number, orderId: number): Promise<void> {
    const existingScore = await storage.getCurrentUserEsgScore(userId);
    
    if (!existingScore) {
      await this.updateUserESGScore(userId);
      const newScore = await storage.getCurrentUserEsgScore(userId);
      if (!newScore) return;
      
      const metadata = newScore.metadata || {};
      const shippingBonuses = metadata.shippingBonuses || [];
      
      if (!shippingBonuses.includes(orderId)) {
        shippingBonuses.push(orderId);
        await storage.updateEsgScore(newScore.id, {
          totalScore: newScore.totalScore + 1000,
          metadata: { ...metadata, shippingBonuses }
        });
      }
      return;
    }

    const metadata = existingScore.metadata || {};
    const shippingBonuses = metadata.shippingBonuses || [];
    
    if (shippingBonuses.includes(orderId)) {
      return;
    }

    shippingBonuses.push(orderId);
    const newTotalScore = existingScore.totalScore + 1000;
    const tier = await storage.getTierByScore(newTotalScore);

    await storage.updateEsgScore(existingScore.id, {
      totalScore: newTotalScore,
      tierId: tier?.id || existingScore.tierId,
      metadata: { ...metadata, shippingBonuses },
      calculatedAt: new Date()
    });

    await this.checkAndUnlockAchievements(userId);
    await this.checkAndReachMilestones(userId, newTotalScore);
  }
}

export const scoringService = new ScoringService();
