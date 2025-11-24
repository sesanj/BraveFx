import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { Resource } from '../models/resource.model';

@Injectable({
  providedIn: 'root',
})
export class ResourceService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get all resources for a specific module
   */
  getModuleResources(moduleId: string): Observable<Resource[]> {
    return from(
      this.supabase.client
        .from('resources')
        .select('*')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          // Silently return empty array if table doesn't exist yet
          return [];
        }

        return (data || []).map((resource: any) => ({
          id: resource.id,
          moduleId: resource.module_id,
          title: resource.title,
          url: resource.url,
          type: resource.type,
          createdAt: new Date(resource.created_at),
        }));
      }),
      catchError((error) => {
        // Silently fail - table might not exist yet before migration
        return of([]);
      })
    );
  }

  /**
   * Get all resources for a course (across all modules)
   */
  getCourseResources(courseId: string): Observable<Resource[]> {
    return from(
      this.supabase.client
        .from('resources')
        .select(
          `
          *,
          modules!inner(
            id,
            title,
            course_id
          )
        `
        )
        .eq('modules.course_id', courseId)
        .order('created_at', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching course resources:', error);
          return [];
        }

        return (data || []).map((resource: any) => ({
          id: resource.id,
          moduleId: resource.module_id,
          title: resource.title,
          url: resource.url,
          type: resource.type,
          createdAt: new Date(resource.created_at),
        }));
      }),
      catchError((error) => {
        console.error('Error in getCourseResources:', error);
        return of([]);
      })
    );
  }

  /**
   * Get resource icon based on type
   */
  getResourceIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'file-text';
      case 'excel':
      case 'xlsx':
      case 'xls':
        return 'file-spreadsheet';
      case 'word':
      case 'doc':
      case 'docx':
        return 'file-text';
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'video':
      case 'mp4':
      case 'avi':
        return 'video';
      default:
        return 'file';
    }
  }

  /**
   * Download a resource
   */
  downloadResource(resource: Resource): void {
    window.open(resource.url, '_blank');
  }
}
