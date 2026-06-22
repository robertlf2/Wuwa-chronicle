export interface AxisLabel {
  id: string;
  text: string;
  positionX: number;
}

export interface TimelineEvent {
  id: string; // YYYY-MM-DD
  title: string;
  date: string;
  mediaType: "image" | "youtube";
  mediaUrl: string;
  content: string; // html
  referenceImages: string[];
  backgroundColor: string;
  category: string;
  categoryColor?: string;
  titleSize?: number;
  customDateText?: string;
  positionX?: number;
  tags?: string[];
  characterTags?: string[];
  regionTags?: string[];
  mainStoryTags?: string[];
  referenceText?: string;
}

export interface Drawing {
  id: string;
  startX: number; // percentage
  startY: number; // percentage
  endX: number; // percentage
  endY: number; // percentage
  controlX?: number; // percentage for bezier control point
  controlY?: number; // percentage for bezier control point
  color?: string;
  startEventId?: string;
  endEventId?: string;
  startAttachment?: 'left' | 'center' | 'right';
  endAttachment?: 'left' | 'center' | 'right';
}

export interface TimelineData {
  timelineBackground: string;
  titlePageEnabled?: boolean;
  titlePageTitle?: string;
  titlePageSubtitle?: string;
  titlePageImage?: string;
  events: TimelineEvent[];
  axisLabels?: AxisLabel[];
  drawings?: Drawing[];
  categoryOrder?: string[];
}
