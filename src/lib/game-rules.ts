/**
 * Game Rules Engine
 * 
 * Provides pattern detection and rule validation for Tambola game.
 * Supports all standard winning patterns:
 * - Early Five: First 5 numbers marked
 * - Top/Middle/Bottom Line: Complete row
 * - Corners: All 4 corner numbers
 * - Full House: All 15 numbers
 */

import type { PrizePattern, GameRule, WinnerInfo } from '@/types';

/**
 * Pattern definitions for winning conditions
 */
export const PATTERN_DEFINITIONS: Record<PrizePattern, { name: string; description: string }> = {
  early_five: {
    name: 'Early Five',
    description: 'First player to mark any 5 numbers',
  },
  top_line: {
    name: 'Top Line',
    description: 'Complete the first row',
  },
  middle_line: {
    name: 'Middle Line',
    description: 'Complete the second row',
  },
  bottom_line: {
    name: 'Bottom Line',
    description: 'Complete the third row',
  },
  first_row: {
    name: 'First Row',
    description: 'Complete the first row (same as Top Line)',
  },
  second_row: {
    name: 'Second Row',
    description: 'Complete the second row (same as Middle Line)',
  },
  third_row: {
    name: 'Third Row',
    description: 'Complete the third row (same as Bottom Line)',
  },
  corners: {
    name: 'Corners',
    description: 'Mark all 4 corner numbers',
  },
  full_house: {
    name: 'Full House',
    description: 'Mark all 15 numbers',
  },
};

/**
 * Gets the numbers in a specific row of the ticket
 * @param ticket The ticket (3x9 grid)
 * @param rowIndex The row index (0, 1, or 2)
 * @returns Array of numbers in that row (excluding empty cells)
 */
export function getRowNumbers(ticket: number[][], rowIndex: number): number[] {
  if (rowIndex < 0 || rowIndex > 2) return [];
  return ticket[rowIndex].filter(n => n !== 0);
}

/**
 * Gets the corner numbers of a ticket
 * @param ticket The ticket (3x9 grid)
 * @returns Array of corner numbers
 */
export function getCornerNumbers(ticket: number[][]): number[] {
  const corners: number[] = [];

  // Find first and last non-zero in first row
  const firstRow = ticket[0];
  for (let i = 0; i < 9; i++) {
    if (firstRow[i] !== 0) {
      corners.push(firstRow[i]);
      break;
    }
  }
  for (let i = 8; i >= 0; i--) {
    if (firstRow[i] !== 0) {
      corners.push(firstRow[i]);
      break;
    }
  }

  // Find first and last non-zero in last row
  const lastRow = ticket[2];
  for (let i = 0; i < 9; i++) {
    if (lastRow[i] !== 0) {
      corners.push(lastRow[i]);
      break;
    }
  }
  for (let i = 8; i >= 0; i--) {
    if (lastRow[i] !== 0) {
      corners.push(lastRow[i]);
      break;
    }
  }

  return corners;
}

/**
 * Gets all numbers on a ticket
 * @param ticket The ticket (3x9 grid)
 * @returns Array of all 15 numbers
 */
export function getAllTicketNumbers(ticket: number[][]): number[] {
  return ticket.flat().filter(n => n !== 0);
}

/**
 * Checks if all required numbers are in the called numbers set
 * @param requiredNumbers Numbers that need to be called
 * @param calledNumbers Numbers that have been called
 * @returns True if all required numbers have been called
 */
export function areAllNumbersCalled(requiredNumbers: number[], calledNumbers: number[]): boolean {
  const calledSet = new Set(calledNumbers);
  return requiredNumbers.every(num => calledSet.has(num));
}

/**
 * Counts how many of the required numbers have been called
 * @param requiredNumbers Numbers that need to be called
 * @param calledNumbers Numbers that have been called
 * @returns Count of matched numbers
 */
export function countCalledNumbers(requiredNumbers: number[], calledNumbers: number[]): number {
  const calledSet = new Set(calledNumbers);
  return requiredNumbers.filter(num => calledSet.has(num)).length;
}

/**
 * Checks if a specific pattern is complete on a ticket
 * @param ticket The ticket (3x9 grid)
 * @param calledNumbers Numbers that have been called
 * @param pattern The pattern to check
 * @returns True if the pattern is complete
 */
export function isPatternComplete(
  ticket: number[][],
  calledNumbers: number[],
  pattern: PrizePattern
): boolean {
  switch (pattern) {
    case 'early_five': {
      const ticketNumbers = getAllTicketNumbers(ticket);
      return countCalledNumbers(ticketNumbers, calledNumbers) >= 5;
    }

    case 'top_line':
    case 'first_row': {
      const rowNumbers = getRowNumbers(ticket, 0);
      return areAllNumbersCalled(rowNumbers, calledNumbers);
    }

    case 'middle_line':
    case 'second_row': {
      const rowNumbers = getRowNumbers(ticket, 1);
      return areAllNumbersCalled(rowNumbers, calledNumbers);
    }

    case 'bottom_line':
    case 'third_row': {
      const rowNumbers = getRowNumbers(ticket, 2);
      return areAllNumbersCalled(rowNumbers, calledNumbers);
    }

    case 'corners': {
      const cornerNumbers = getCornerNumbers(ticket);
      return areAllNumbersCalled(cornerNumbers, calledNumbers);
    }

    case 'full_house': {
      const allNumbers = getAllTicketNumbers(ticket);
      return areAllNumbersCalled(allNumbers, calledNumbers);
    }

    default:
      return false;
  }
}

/**
 * Gets the progress of a pattern (completed/total)
 * @param ticket The ticket (3x9 grid)
 * @param calledNumbers Numbers that have been called
 * @param pattern The pattern to check
 * @returns Object with completed and total counts
 */
export function getPatternProgress(
  ticket: number[][],
  calledNumbers: number[],
  pattern: PrizePattern
): { completed: number; total: number; percentage: number } {
  let requiredNumbers: number[];

  switch (pattern) {
    case 'early_five':
      requiredNumbers = getAllTicketNumbers(ticket);
      const early5Count = Math.min(countCalledNumbers(requiredNumbers, calledNumbers), 5);
      return { completed: early5Count, total: 5, percentage: (early5Count / 5) * 100 };

    case 'top_line':
    case 'first_row':
      requiredNumbers = getRowNumbers(ticket, 0);
      break;

    case 'middle_line':
    case 'second_row':
      requiredNumbers = getRowNumbers(ticket, 1);
      break;

    case 'bottom_line':
    case 'third_row':
      requiredNumbers = getRowNumbers(ticket, 2);
      break;

    case 'corners':
      requiredNumbers = getCornerNumbers(ticket);
      break;

    case 'full_house':
      requiredNumbers = getAllTicketNumbers(ticket);
      break;

    default:
      return { completed: 0, total: 0, percentage: 0 };
  }

  const completed = countCalledNumbers(requiredNumbers, calledNumbers);
  const total = requiredNumbers.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return { completed, total, percentage };
}

/**
 * Gets all completed rules for a ticket
 * @param ticket The ticket (3x9 grid)
 * @param calledNumbers Numbers that have been called
 * @param rules Game rules to check
 * @returns Array of completed rule IDs
 */
export function getCompletedRules(
  ticket: number[][],
  calledNumbers: number[],
  rules: GameRule[]
): string[] {
  return rules
    .filter(rule => !rule.isCompleted && isPatternComplete(ticket, calledNumbers, rule.pattern))
    .map(rule => rule.id);
}

/**
 * Checks if all rules are completed
 * @param rules Game rules
 * @returns True if all rules have winners
 */
export function areAllRulesCompleted(rules: GameRule[]): boolean {
  return rules.every(rule => rule.isCompleted);
}

/**
 * Gets the next uncompleted rule in order
 * @param rules Game rules
 * @returns The next rule that needs a winner, or null if all complete
 */
export function getNextUncompletedRule(rules: GameRule[]): GameRule | null {
  const sortedRules = [...rules].sort((a, b) => a.order - b.order);
  return sortedRules.find(rule => !rule.isCompleted) || null;
}

/**
 * Creates a winner info object
 * @param userId User ID
 * @param userName User name
 * @param ticketId Ticket ID
 * @returns WinnerInfo object
 */
export function createWinnerInfo(
  userId: string,
  userName: string,
  ticketId: string
): WinnerInfo {
  return {
    userId,
    userName,
    ticketId,
    claimedAt: new Date().toISOString(),
  };
}

/**
 * Validates if a claim is valid
 * @param ticket The ticket being claimed
 * @param calledNumbers Numbers that have been called
 * @param pattern The pattern being claimed
 * @returns Object with isValid flag and error message if invalid
 */
export function validateClaim(
  ticket: number[][],
  calledNumbers: number[],
  pattern: PrizePattern
): { isValid: boolean; error?: string } {
  if (!isPatternComplete(ticket, calledNumbers, pattern)) {
    return {
      isValid: false,
      error: `Pattern "${PATTERN_DEFINITIONS[pattern].name}" is not complete on your ticket`,
    };
  }

  return { isValid: true };
}

/**
 * Gets the default rules for a new game
 * @returns Array of default game rules
 */
export function getDefaultRules(): Omit<GameRule, 'id' | 'isCompleted' | 'winner'>[] {
  return [
    { pattern: 'early_five', name: 'Early Five', order: 1, prizeAmount: 500 },
    { pattern: 'top_line', name: 'Top Line', order: 2, prizeAmount: 1000 },
    { pattern: 'middle_line', name: 'Middle Line', order: 3, prizeAmount: 1000 },
    { pattern: 'bottom_line', name: 'Bottom Line', order: 4, prizeAmount: 1000 },
    { pattern: 'full_house', name: 'Full House', order: 5, prizeAmount: 2500 },
  ];
}

/**
 * Gets default game settings
 * @returns Default GameSettings object
 */
export function getDefaultSettings() {
  return {
    minTickets: 5,
    maxTickets: 200,
    maxTicketsPerUser: 5,
    autoPlay: true,
    autoPlayInterval: 5000,
  };
}

export default {
  PATTERN_DEFINITIONS,
  getRowNumbers,
  getCornerNumbers,
  getAllTicketNumbers,
  areAllNumbersCalled,
  countCalledNumbers,
  isPatternComplete,
  getPatternProgress,
  getCompletedRules,
  areAllRulesCompleted,
  getNextUncompletedRule,
  createWinnerInfo,
  validateClaim,
  getDefaultRules,
  getDefaultSettings,
};
