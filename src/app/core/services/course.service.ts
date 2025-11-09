import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Course, Lesson } from '../models/course.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private supabase: SupabaseService) {}

  // Helper function to convert seconds to readable format (e.g., "5:30", "1h 20m")
  private formatDuration(seconds: number): string {
    if (!seconds || seconds === 0) return 'TBD';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      // For durations over an hour, show "1h 20m" format
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else if (minutes > 0) {
      // For durations under an hour, show "5:30" format
      return secs > 0
        ? `${minutes}:${secs.toString().padStart(2, '0')}`
        : `${minutes}:00`;
    } else {
      // For durations under a minute, show "0:45" format
      return `0:${secs.toString().padStart(2, '0')}`;
    }
  }

  getCourse(id: string): Observable<Course> {
    return from(this.fetchCourseFromSupabase(id));
  }

  private async fetchCourseFromSupabase(courseId: string): Promise<Course> {
    const { data: course, error: courseError } = await this.supabase.client
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) throw courseError;

    // Fetch modules with lessons and resources
    const { data: modules, error: modulesError } = await this.supabase.client
      .from('modules')
      .select(
        `
        *,
        lessons:lessons (
          *,
          resources:resources (*)
        )
      `
      )
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (modulesError) throw modulesError;

    // Transform the data to match your Course model
    const transformedCourse: Course = {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      currency: course.currency || 'USD',
      thumbnail: course.thumbnail,
      duration: course.duration,
      totalLessons: course.total_lessons,
      rating: course.rating,
      studentsEnrolled: course.students_enrolled,
      createdAt: new Date(course.created_at),
      updatedAt: new Date(course.updated_at),
      modules: modules.map((module: any) => {
        const lessons = (module.lessons || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            // Keep "Text Lesson" as-is, or convert Vimeo ID to full URL format
            videoUrl:
              lesson.video_url === 'Text Lesson'
                ? 'Text Lesson'
                : lesson.video_url.includes('http')
                ? lesson.video_url
                : `https://vimeo.com/${lesson.video_url}`,
            duration: this.formatDuration(lesson.duration),
            order: lesson.order_index,
            isPreview: lesson.is_preview,
            resources: (lesson.resources || []).map((resource: any) => ({
              id: resource.id,
              title: resource.title,
              url: resource.url,
              type: resource.type,
            })),
          }));

        // Calculate total module duration from all lessons
        const totalSeconds = (module.lessons || []).reduce(
          (sum: number, lesson: any) => sum + (lesson.duration || 0),
          0
        );

        return {
          id: module.id,
          title: module.title,
          description: module.description,
          order: module.order_index,
          hasQuiz: module.has_quiz,
          duration: this.formatDuration(totalSeconds),
          lessons: lessons,
        };
      }),
    };

    return transformedCourse;
  }

  getAllCourses(): Observable<Course[]> {
    return from(this.fetchAllCoursesFromSupabase());
  }

  private async fetchAllCoursesFromSupabase(): Promise<Course[]> {
    const { data: courses, error } = await this.supabase.client
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For listing, we don't need full module/lesson details
    return courses.map((course: any) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      currency: course.currency || 'USD',
      thumbnail: course.thumbnail,
      duration: course.duration,
      totalLessons: course.total_lessons,
      rating: course.rating,
      studentsEnrolled: course.students_enrolled,
      createdAt: new Date(course.created_at),
      updatedAt: new Date(course.updated_at),
      modules: [], // Will be loaded when viewing course details
    }));
  }

  getLesson(
    courseId: string,
    lessonId: string
  ): Observable<Lesson | undefined> {
    return from(this.fetchLessonFromSupabase(lessonId));
  }

  private async fetchLessonFromSupabase(
    lessonId: string
  ): Promise<Lesson | undefined> {
    const { data: lesson, error } = await this.supabase.client
      .from('lessons')
      .select(
        `
        *,
        resources:resources (*)
      `
      )
      .eq('id', lessonId)
      .single();

    if (error) throw error;
    if (!lesson) return undefined;

    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl:
        lesson.video_url === 'Text Lesson'
          ? 'Text Lesson'
          : lesson.video_url.includes('http')
          ? lesson.video_url
          : `https://vimeo.com/${lesson.video_url}`,
      duration: this.formatDuration(lesson.duration),
      order: lesson.order_index,
      isPreview: lesson.is_preview,
      resources: (lesson.resources || []).map((resource: any) => ({
        id: resource.id,
        title: resource.title,
        url: resource.url,
        type: resource.type,
      })),
    };
  }
}
