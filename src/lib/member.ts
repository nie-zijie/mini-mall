export enum MemberLevel {
  NONE = "NONE",
  XINYUE_1 = "XINYUE_1",
  XINYUE_2 = "XINYUE_2",
  XINYUE_3 = "XINYUE_3",
}

// 等级阈值 (元)
export const MEMBER_THRESHOLDS = {
  XINYUE_1: 8_000,
  XINYUE_2: 80_000,
  XINYUE_3: 800_000,
} as const;

// 等级对应折扣率
export const MEMBER_DISCOUNTS: Record<MemberLevel, number> = {
  [MemberLevel.NONE]: 1.0,
  [MemberLevel.XINYUE_1]: 0.9,
  [MemberLevel.XINYUE_2]: 0.8,
  [MemberLevel.XINYUE_3]: 0.7,
};

// 等级中文名
export const MEMBER_LABELS: Record<MemberLevel, string> = {
  [MemberLevel.NONE]: "普通用户",
  [MemberLevel.XINYUE_1]: "心悦会员 · Lv1",
  [MemberLevel.XINYUE_2]: "心悦会员 · Lv2",
  [MemberLevel.XINYUE_3]: "心悦会员 · Lv3",
};

// 根据累计消费计算等级
export function calcMemberLevel(totalSpent: number): MemberLevel {
  if (totalSpent >= MEMBER_THRESHOLDS.XINYUE_3) return MemberLevel.XINYUE_3;
  if (totalSpent >= MEMBER_THRESHOLDS.XINYUE_2) return MemberLevel.XINYUE_2;
  if (totalSpent >= MEMBER_THRESHOLDS.XINYUE_1) return MemberLevel.XINYUE_1;
  return MemberLevel.NONE;
}

// 获取折扣率
export function getDiscountRate(level: MemberLevel): number {
  return MEMBER_DISCOUNTS[level];
}

// 计算距下一级还需多少消费
export function getNextLevelProgress(totalSpent: number): {
  nextLevel: MemberLevel;
  need: number;
} | null {
  const levels: { level: MemberLevel; threshold: number }[] = [
    { level: MemberLevel.XINYUE_1, threshold: MEMBER_THRESHOLDS.XINYUE_1 },
    { level: MemberLevel.XINYUE_2, threshold: MEMBER_THRESHOLDS.XINYUE_2 },
    { level: MemberLevel.XINYUE_3, threshold: MEMBER_THRESHOLDS.XINYUE_3 },
  ];
  for (const l of levels) {
    if (totalSpent < l.threshold) {
      return { nextLevel: l.level, need: l.threshold - totalSpent };
    }
  }
  return null; // 已满级
}
