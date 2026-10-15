import { TimelineData } from '../types';

/**
 * Calculates the maximum horizontal coordinate used by any event, axis label, or drawing.
 */
export function calculateMaxPosition(data: TimelineData): number {
  let maxX = 0;
  if (data.events && Array.isArray(data.events)) {
    for (const e of data.events) {
      if (typeof e.positionX === 'number' && !isNaN(e.positionX)) {
        if (e.positionX > maxX) maxX = e.positionX;
      }
    }
  }
  if (data.axisLabels && Array.isArray(data.axisLabels)) {
    for (const l of data.axisLabels) {
      if (typeof l.positionX === 'number' && !isNaN(l.positionX)) {
        if (l.positionX > maxX) maxX = l.positionX;
      }
    }
  }
  if (data.drawings && Array.isArray(data.drawings)) {
    for (const d of data.drawings) {
      if (typeof d.startX === 'number' && !isNaN(d.startX) && d.startX > maxX) maxX = d.startX;
      if (typeof d.endX === 'number' && !isNaN(d.endX) && d.endX > maxX) maxX = d.endX;
      if (typeof d.controlX === 'number' && !isNaN(d.controlX) && d.controlX > maxX) maxX = d.controlX;
    }
  }
  return maxX;
}

/**
 * Computes the effective timeline total length in units (minimum 100).
 * If the furthest event/element reaches or exceeds 90% of the current scale,
 * it extends rightward by 20% increments (unbounded rightward expansion).
 * The left origin is strictly locked at 0.
 */
export function getEffectiveTimelineUnits(data: TimelineData): number {
  let units = Math.max(100, data.timelineLength || 100);
  const maxX = calculateMaxPosition(data);

  // If maximum element position is approaching within 10% of the right boundary (>= 90%)
  // or already exceeds it, expand rightward in 20% steps
  while (maxX >= units * 0.9) {
    units = Math.round(units * 1.2 * 10) / 10;
  }

  return units;
}

/**
 * Manually or programmatically expand the timeline rightward by 20%.
 * Preserves all existing event positions and coordinates intact.
 */
export function expandTimelineRight(data: TimelineData): TimelineData {
  const currentUnits = getEffectiveTimelineUnits(data);
  const newUnits = Math.round(currentUnits * 1.2 * 10) / 10;
  return {
    ...data,
    timelineLength: newUnits,
  };
}
