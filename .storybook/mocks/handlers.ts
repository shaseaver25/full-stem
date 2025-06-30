
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase auth endpoint
  http.get('/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'teacher@example.com',
      role: 'teacher',
    });
  }),

  // Mock content library endpoint
  http.get('/rest/v1/content_library*', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Sample Content',
        description: 'Sample description',
        content_type: 'document',
        is_published: true,
        version_number: 1,
      },
    ]);
  }),

  // Mock content versions endpoint
  http.get('/rest/v1/content_versions*', () => {
    return HttpResponse.json([
      {
        id: 'v1',
        version_number: 1,
        title: 'Initial Version',
        changes_summary: 'Initial creation',
        created_at: '2024-01-01T00:00:00Z',
      },
    ]);
  }),
];
