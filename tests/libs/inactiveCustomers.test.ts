import { describe, expect, it } from 'vitest';
import {
  computeSelectionWeight,
  computeYieldScore,
  formatPromptLine,
  recencyMultiplier,
  weightedRandomSample,
} from '@/libs/inactiveCustomers';

describe('inactiveCustomers', () => {
  describe('recencyMultiplier', () => {
    it('returns lower multipliers for recent contact', () => {
      expect(recencyMultiplier(10)).toBe(0.2);
      expect(recencyMultiplier(45)).toBe(0.5);
      expect(recencyMultiplier(75)).toBe(0.8);
      expect(recencyMultiplier(120)).toBe(1.0);
    });
  });

  describe('computeYieldScore', () => {
    it('ranks high won revenue above small accounts', () => {
      const highWon = computeYieldScore({
        wonTotal: 5_000_000,
        totalITUsers: 10,
        numberOfBranch: 1,
        slaCount: 0,
      });
      const lowWon = computeYieldScore({
        wonTotal: 0,
        totalITUsers: 10,
        numberOfBranch: 1,
        slaCount: 0,
      });
      expect(highWon).toBeGreaterThan(lowWon);
    });
  });

  describe('computeSelectionWeight', () => {
    it('applies SLA penalty without zeroing weight', () => {
      const base = {
        daysSinceTouch: 100,
        wonTotal: 1_000_000,
        totalITUsers: 50,
        numberOfBranch: 2,
        slaCount: 1,
      };
      const withSla = computeSelectionWeight({ ...base, hasActiveSla: 1 });
      const withoutSla = computeSelectionWeight({ ...base, hasActiveSla: 0 });
      expect(withSla).toBeLessThan(withoutSla);
      expect(withSla).toBeGreaterThan(0);
    });

    it('weights dormant high-yield above recent low-yield', () => {
      const dormant = computeSelectionWeight({
        daysSinceTouch: 120,
        wonTotal: 2_000_000,
        totalITUsers: 80,
        numberOfBranch: 3,
        slaCount: 2,
        hasActiveSla: 0,
      });
      const recent = computeSelectionWeight({
        daysSinceTouch: 15,
        wonTotal: 50_000,
        totalITUsers: 5,
        numberOfBranch: 1,
        slaCount: 0,
        hasActiveSla: 0,
      });
      expect(dormant).toBeGreaterThan(recent);
    });
  });

  describe('formatPromptLine', () => {
    it('prefers won revenue in prompt copy', () => {
      expect(
        formatPromptLine({
          daysSinceTouch: 94,
          wonTotal: 1_800_000,
          totalITUsers: 10,
          numberOfBranch: 1,
        })
      ).toContain('won');
      expect(
        formatPromptLine({
          daysSinceTouch: 94,
          wonTotal: 1_800_000,
          totalITUsers: 10,
          numberOfBranch: 1,
        })
      ).toContain('94 days quiet');
    });

    it('falls back to IT users when no won revenue', () => {
      expect(
        formatPromptLine({
          daysSinceTouch: 61,
          wonTotal: 0,
          totalITUsers: 120,
          numberOfBranch: null,
        })
      ).toBe('120 IT users · 61 days quiet');
    });
  });

  describe('weightedRandomSample', () => {
    it('returns at most count items without replacement', () => {
      const items = ['a', 'b', 'c', 'd'];
      const picked = weightedRandomSample(
        items,
        (id) => (id === 'a' ? 100 : 1),
        2,
        () => 0.01
      );
      expect(picked).toHaveLength(2);
      expect(new Set(picked).size).toBe(2);
    });

    it('favors higher weights over many draws', () => {
      const items = ['heavy', 'light'];
      let heavyCount = 0;
      for (let i = 0; i < 200; i++) {
        const [pick] = weightedRandomSample(
          items,
          (id) => (id === 'heavy' ? 50 : 1),
          1
        );
        if (pick === 'heavy') heavyCount++;
      }
      expect(heavyCount).toBeGreaterThan(150);
    });
  });
});
