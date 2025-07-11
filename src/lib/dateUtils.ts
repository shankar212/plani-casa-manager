/**
 * Utility functions for date calculations and formatting
 */

/**
 * Calculates the end date by adding estimated duration days to the start date
 * @param startDate - Date in Brazilian format (DD/MM/YYYY) or ISO string
 * @param estimatedDays - Number of days to add (as string or number)
 * @returns End date in Brazilian format (DD/MM/YYYY) or "-" if calculation fails
 */
export function calculateEndDate(startDate: string | null, estimatedDays: string | number | null): string {
  if (!startDate || !estimatedDays) {
    return "-";
  }

  try {
    let date: Date;
    
    // Check if startDate is in Brazilian format (DD/MM/YYYY)
    if (startDate.includes('/')) {
      const [day, month, year] = startDate.split('/');
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
      // Assume ISO format
      date = new Date(startDate);
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      return "-";
    }

    // Convert estimated days to number
    const daysToAdd = typeof estimatedDays === 'string' ? parseInt(estimatedDays) : estimatedDays;
    
    if (isNaN(daysToAdd) || daysToAdd <= 0) {
      return "-";
    }

    // Add the estimated days
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + daysToAdd);

    // Format to Brazilian format (DD/MM/YYYY)
    const day = endDate.getDate().toString().padStart(2, '0');
    const month = (endDate.getMonth() + 1).toString().padStart(2, '0');
    const year = endDate.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error calculating end date:', error);
    return "-";
  }
}