
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import VersionHistoryModal from '../VersionHistoryModal';

const mockContentItem = {
  id: '1',
  title: 'Test Content',
  description: 'Test Description',
  content_type: 'document',
  file_url: 'http://example.com/file.pdf',
  thumbnail_url: 'http://example.com/thumb.jpg',
  tags: ['math'],
  subject: 'Mathematics',
  grade_level: 'Grade 9',
  is_published: false,
  version_number: 2,
  created_at: '2023-01-01',
  created_by: 'teacher1'
};

const mockVersions = [
  {
    id: '1',
    version_number: 2,
    title: 'Test Content v2',
    description: 'Updated version',
    changes_summary: 'Fixed typos and added examples',
    created_at: '2023-01-02'
  },
  {
    id: '2',
    version_number: 1,
    title: 'Test Content v1',
    description: 'Initial version',
    changes_summary: '',
    created_at: '2023-01-01'
  }
];

describe('VersionHistoryModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (isOpen = true, selectedContent = mockContentItem, versions = mockVersions) => {
    render(
      <VersionHistoryModal
        isOpen={isOpen}
        onClose={mockOnClose}
        selectedContent={selectedContent}
        versions={versions}
      />
    );
  };

  it('renders modal title and description when open', () => {
    renderComponent();
    
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.getByText('Test Content - Version tracking')).toBeInTheDocument();
  });

  it('displays all version entries', () => {
    renderComponent();
    
    expect(screen.getByText('Version 2')).toBeInTheDocument();
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('Test Content v2')).toBeInTheDocument();
    expect(screen.getByText('Test Content v1')).toBeInTheDocument();
  });

  it('shows changes summary when available', () => {
    renderComponent();
    
    expect(screen.getByText('Changes: Fixed typos and added examples')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    renderComponent();
    
    expect(screen.getByText('1/2/2023')).toBeInTheDocument();
    expect(screen.getByText('1/1/2023')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    renderComponent(false);
    
    expect(screen.queryByText('Version History')).not.toBeInTheDocument();
  });

  it('handles empty versions list', () => {
    renderComponent(true, mockContentItem, []);
    
    expect(screen.getByText('Version History')).toBeInTheDocument();
    expect(screen.queryByText('Version 1')).not.toBeInTheDocument();
  });
});
