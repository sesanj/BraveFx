export interface Resource {
  id: string;
  moduleId: string;
  title: string;
  url: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'video' | 'other';
  createdAt: Date;
}
