import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  FileText,
  FileSpreadsheet,
  Image,
  Video,
  File,
  Download,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
} from 'lucide-angular';
import { CourseService } from '../../../../core/services/course.service';
import { ResourceService } from '../../../../core/services/resource.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { Course } from '../../../../core/models/course.model';
import { Resource } from '../../../../core/models/resource.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardSkeletonComponent } from '../../../../shared/components/skeleton-loader/skeletons/dashboard-skeleton.component';

interface ModuleWithResources {
  id: string;
  title: string;
  resources: Resource[];
  expanded: boolean;
}

interface CourseWithResources {
  course: Course;
  modules: ModuleWithResources[];
  totalResources: number;
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DashboardSkeletonComponent,
  ],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
})
export class ResourcesComponent implements OnInit {
  // Icons
  FileText = FileText;
  FileSpreadsheet = FileSpreadsheet;
  Image = Image;
  Video = Video;
  File = File;
  Download = Download;
  ChevronDown = ChevronDown;
  ChevronUp = ChevronUp;
  Filter = Filter;
  Search = Search;

  enrolledCourses: Course[] = [];
  coursesWithResources: CourseWithResources[] = [];
  filteredCoursesWithResources: CourseWithResources[] = [];

  selectedCourseId: string = 'all';
  searchQuery: string = '';
  selectedResourceType: string = 'all';

  isLoading: boolean = true;

  constructor(
    private courseService: CourseService,
    private resourceService: ResourceService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.loadEnrolledCoursesAndResources();
  }

  /**
   * Load enrolled courses and their resources
   */
  loadEnrolledCoursesAndResources(): void {
    this.isLoading = true;

    // Get all courses (user's enrolled courses)
    this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {

        if (courses.length === 0) {
          this.isLoading = false;
          return;
        }

        // Fetch full course details with modules for each course
        const courseDetailRequests = courses.map((course) =>
          this.courseService.getCourse(course.id)
        );

        forkJoin(courseDetailRequests).subscribe({
          next: (fullCourses) => {
            this.enrolledCourses = fullCourses;
            // Load resources for each course
            this.loadResourcesForCourses();
          },
          error: (error) => {
            this.isLoading = false;
          },
        });
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  /**
   * Load resources for all enrolled courses
   */
  loadResourcesForCourses(): void {
    if (this.enrolledCourses.length === 0) {
      this.isLoading = false;
      return;
    }

    const resourceRequests = this.enrolledCourses.map((course) =>
      this.resourceService.getCourseResources(course.id).pipe(
        map((resources) => {

          // Group resources by module
          const moduleMap = new Map<string, Resource[]>();

          resources.forEach((resource) => {
            if (!moduleMap.has(resource.moduleId)) {
              moduleMap.set(resource.moduleId, []);
            }
            moduleMap.get(resource.moduleId)!.push(resource);
          });

          // Get module details from course
          const modulesWithResources: ModuleWithResources[] = (
            course.modules || []
          )
            .map((module) => {
              const moduleResources = moduleMap.get(module.id) || [];
              return {
                id: module.id,
                title: module.title,
                resources: moduleResources,
                expanded: false,
              };
            })
            .filter((module) => module.resources.length > 0); // Only include modules with resources

          const totalResources = resources.length;

          return {
            course,
            modules: modulesWithResources,
            totalResources,
          } as CourseWithResources;
        }),
        catchError((error) => {
          return of({
            course,
            modules: [],
            totalResources: 0,
          } as CourseWithResources);
        })
      )
    );

    forkJoin(resourceRequests).subscribe({
      next: (coursesWithResources) => {
        this.coursesWithResources = coursesWithResources.filter(
          (c) => c.totalResources > 0
        );
        this.filteredCoursesWithResources = [...this.coursesWithResources];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  /**
   * Filter courses based on selected course, search query, and resource type
   */
  applyFilters(): void {
    let filtered = [...this.coursesWithResources];

    // Filter by selected course
    if (this.selectedCourseId !== 'all') {
      filtered = filtered.filter((c) => c.course.id === this.selectedCourseId);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered
        .map((courseWithResources) => {
          const filteredModules = courseWithResources.modules
            .map((module) => ({
              ...module,
              resources: module.resources.filter((resource) =>
                resource.title.toLowerCase().includes(query)
              ),
            }))
            .filter((module) => module.resources.length > 0);

          return {
            ...courseWithResources,
            modules: filteredModules,
            totalResources: filteredModules.reduce(
              (sum, m) => sum + m.resources.length,
              0
            ),
          };
        })
        .filter((c) => c.totalResources > 0);
    }

    // Filter by resource type
    if (this.selectedResourceType !== 'all') {
      filtered = filtered
        .map((courseWithResources) => {
          const filteredModules = courseWithResources.modules
            .map((module) => ({
              ...module,
              resources: module.resources.filter((resource) =>
                this.matchesResourceType(
                  resource.type,
                  this.selectedResourceType
                )
              ),
            }))
            .filter((module) => module.resources.length > 0);

          return {
            ...courseWithResources,
            modules: filteredModules,
            totalResources: filteredModules.reduce(
              (sum, m) => sum + m.resources.length,
              0
            ),
          };
        })
        .filter((c) => c.totalResources > 0);
    }

    this.filteredCoursesWithResources = filtered;
  }

  /**
   * Check if a resource type matches the selected filter
   */
  private matchesResourceType(
    resourceType: string,
    filterType: string
  ): boolean {
    const type = resourceType.toLowerCase();
    const filter = filterType.toLowerCase();

    switch (filter) {
      case 'pdf':
        return type === 'pdf';
      case 'excel':
        return ['excel', 'xlsx', 'xls'].includes(type);
      case 'word':
        return ['word', 'doc', 'docx'].includes(type);
      case 'image':
        return ['image', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(
          type
        );
      case 'video':
        return ['video', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(
          type
        );
      case 'other':
        // Other is anything that doesn't match the above categories
        return ![
          'pdf',
          'excel',
          'xlsx',
          'xls',
          'word',
          'doc',
          'docx',
          'image',
          'jpg',
          'jpeg',
          'png',
          'gif',
          'svg',
          'webp',
          'video',
          'mp4',
          'avi',
          'mov',
          'wmv',
          'flv',
          'webm',
        ].includes(type);
      default:
        return type === filter;
    }
  }

  /**
   * Toggle module expansion
   */
  toggleModule(courseIndex: number, moduleIndex: number): void {
    this.filteredCoursesWithResources[courseIndex].modules[
      moduleIndex
    ].expanded =
      !this.filteredCoursesWithResources[courseIndex].modules[moduleIndex]
        .expanded;
  }

  /**
   * Download a resource
   */
  downloadResource(resource: Resource): void {
    this.resourceService.downloadResource(resource);
  }

  /**
   * Get icon for resource type
   */
  getResourceIcon(type: string): any {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'word':
      case 'doc':
      case 'docx':
        return FileText;
      case 'excel':
      case 'xlsx':
      case 'xls':
        return FileSpreadsheet;
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return Image;
      case 'video':
      case 'mp4':
      case 'avi':
        return Video;
      default:
        return File;
    }
  }

  /**
   * Get formatted file type label
   */
  getFileTypeLabel(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'PDF';
      case 'excel':
      case 'xlsx':
      case 'xls':
        return 'Excel';
      case 'word':
      case 'doc':
      case 'docx':
        return 'Word';
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'Image';
      case 'video':
      case 'mp4':
      case 'avi':
        return 'Video';
      default:
        return 'File';
    }
  }

  /**
   * Get total resource count
   */
  getTotalResourceCount(): number {
    return this.filteredCoursesWithResources.reduce(
      (sum, c) => sum + c.totalResources,
      0
    );
  }
}
