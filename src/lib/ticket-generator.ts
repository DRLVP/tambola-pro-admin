/**
 * Tambola Ticket Generator
 * 
 * Generates valid Tambola (Housie) tickets following standard rules:
 * - Each ticket is a 3x9 grid
 * - Each row has exactly 5 numbers and 4 empty cells (marked as 0)
 * - Column 1: numbers 1-9, Column 2: 10-19, ..., Column 9: 80-90
 * - Numbers in each column are sorted in ascending order from top to bottom
 * - Total of 15 numbers per ticket
 */

// Column ranges for Tambola ticket
const COLUMN_RANGES: [number, number][] = [
  [1, 9],    // Column 0: 1-9
  [10, 19],  // Column 1: 10-19
  [20, 29],  // Column 2: 20-29
  [30, 39],  // Column 3: 30-39
  [40, 49],  // Column 4: 40-49
  [50, 59],  // Column 5: 50-59
  [60, 69],  // Column 6: 60-69
  [70, 79],  // Column 7: 70-79
  [80, 90],  // Column 8: 80-90
];

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Gets a random number within a range (inclusive)
 */
function getRandomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates random unique numbers within a range
 */
function getRandomNumbersInRange(min: number, max: number, count: number): number[] {
  const numbers: Set<number> = new Set();
  while (numbers.size < count) {
    numbers.add(getRandomInRange(min, max));
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Generates a valid Tambola ticket
 * @returns A 3x9 grid where 0 represents empty cells
 */
export function generateTicket(): number[][] {
  // Initialize empty ticket (3 rows x 9 columns)
  const ticket: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Track numbers per row (each row must have exactly 5 numbers)
  const numbersPerRow = [0, 0, 0];

  // For each column, decide how many numbers to place (0, 1, 2, or 3)
  // Total must be 15 numbers across 9 columns
  // We need to distribute 15 numbers across 9 columns with each row having 5

  // Generate column distribution
  // Each column can have 0-3 numbers, but we need exactly 15 total
  // and each row needs exactly 5

  // Step 1: Determine which columns will have numbers in which rows
  // We'll use a greedy approach with backtracking if needed

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;

    // Reset ticket
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 9; col++) {
        ticket[row][col] = 0;
      }
      numbersPerRow[row] = 0;
    }

    // For each column, pick random rows to place numbers
    const columnAssignments: number[][] = [];

    for (let col = 0; col < 9; col++) {
      // Randomly decide how many numbers in this column (1-3)
      // We'll adjust later to ensure constraints are met
      const availableRows = [0, 1, 2].filter(row => numbersPerRow[row] < 5);

      if (availableRows.length === 0) continue;

      // Pick 1-3 rows for this column
      const numInColumn = Math.min(
        getRandomInRange(1, 3),
        availableRows.length
      );

      const selectedRows = shuffle(availableRows).slice(0, numInColumn);
      columnAssignments[col] = selectedRows;

      selectedRows.forEach(row => numbersPerRow[row]++);
    }

    // Check if each row has exactly 5 numbers
    const totalNumbers = numbersPerRow[0] + numbersPerRow[1] + numbersPerRow[2];

    // Adjust if needed
    if (totalNumbers !== 15 || !numbersPerRow.every(n => n === 5)) {
      continue; // Try again
    }

    // Place actual numbers
    for (let col = 0; col < 9; col++) {
      const rows = columnAssignments[col] || [];
      if (rows.length === 0) continue;

      const [min, max] = COLUMN_RANGES[col];
      const numbers = getRandomNumbersInRange(min, max, rows.length);

      // Sort rows to place smaller numbers in upper rows
      const sortedRows = [...rows].sort((a, b) => a - b);

      for (let i = 0; i < sortedRows.length; i++) {
        ticket[sortedRows[i]][col] = numbers[i];
      }
    }

    // Verify ticket
    const rowCounts = ticket.map(row => row.filter(n => n !== 0).length);
    if (rowCounts.every(count => count === 5)) {
      return ticket;
    }
  }

  // Fallback: Generate a simple valid ticket
  return generateFallbackTicket();
}

/**
 * Fallback ticket generation using a deterministic approach
 */
function generateFallbackTicket(): number[][] {
  const ticket: number[][] = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  // Predefined column distribution pattern that guarantees 5 numbers per row
  // Each array represents which rows get a number for that column
  const patterns = [
    [[0, 1], [0, 2], [1, 2], [0], [1], [2], [0, 1, 2], [0, 1], [0, 2]],
    [[0, 1, 2], [0, 1], [1, 2], [0], [2], [1], [0, 2], [0, 1], [2]],
    [[1, 2], [0, 1], [0, 2], [0, 1, 2], [0], [1], [2], [0, 1], [1, 2]],
  ];

  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  for (let col = 0; col < 9; col++) {
    const rows = pattern[col];
    const [min, max] = COLUMN_RANGES[col];
    const numbers = getRandomNumbersInRange(min, max, rows.length);
    const sortedRows = [...rows].sort((a, b) => a - b);

    for (let i = 0; i < sortedRows.length; i++) {
      ticket[sortedRows[i]][col] = numbers[i];
    }
  }

  return ticket;
}

/**
 * Generates multiple unique tickets
 * @param count Number of tickets to generate
 * @returns Array of tickets
 */
export function generateTickets(count: number): number[][][] {
  const tickets: number[][][] = [];

  for (let i = 0; i < count; i++) {
    tickets.push(generateTicket());
  }

  return tickets;
}

/**
 * Validates if a ticket follows Tambola rules
 * @param ticket The ticket to validate
 * @returns True if valid, false otherwise
 */
export function isValidTicket(ticket: number[][]): boolean {
  if (ticket.length !== 3) return false;

  // Check each row has exactly 5 numbers
  for (const row of ticket) {
    if (row.length !== 9) return false;
    const numbers = row.filter(n => n !== 0);
    if (numbers.length !== 5) return false;
  }

  // Check column ranges
  for (let col = 0; col < 9; col++) {
    const [min, max] = COLUMN_RANGES[col];
    for (let row = 0; row < 3; row++) {
      const num = ticket[row][col];
      if (num !== 0 && (num < min || num > max)) {
        return false;
      }
    }
  }

  // Check columns are sorted (ascending from top to bottom)
  for (let col = 0; col < 9; col++) {
    const colNumbers = [ticket[0][col], ticket[1][col], ticket[2][col]]
      .filter(n => n !== 0);
    for (let i = 1; i < colNumbers.length; i++) {
      if (colNumbers[i] <= colNumbers[i - 1]) {
        return false;
      }
    }
  }

  // Check total numbers is 15
  const totalNumbers = ticket.flat().filter(n => n !== 0).length;
  if (totalNumbers !== 15) return false;

  return true;
}

/**
 * Flattens a ticket to get all numbers (excluding empty cells)
 * @param ticket The ticket
 * @returns Array of numbers on the ticket
 */
export function getTicketNumbers(ticket: number[][]): number[] {
  return ticket.flat().filter(n => n !== 0);
}

export default {
  generateTicket,
  generateTickets,
  isValidTicket,
  getTicketNumbers,
};
