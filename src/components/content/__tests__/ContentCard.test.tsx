
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ContentCard from '../ContentCard';

const mockContentItem = {
  id: '1',
  title: 'Test Content',
  description: 'Test Description',
  content_type: 'document',
  file_url: 'http://example.com/file.pdf',
  thumbnail_url: 'http://example.com/thumb.jpg',
  tags: ['math', 'algebra'],
  subject: 'Mathematics',
  grade_level: 'Grade 9',
  is_published: false,
  version_number: 1,
  created_at: '2023-01-01',
  created_by: 'teacher1'
};

describe('ContentCard', () => {
  const mockOnPublishToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnViewVersions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (item = mockContentItem) => {
    render(
      <ContentCard
        item={item}
        onPublishToggle={mockOnPublishToggle}
        onDelete={mockOnDelete}
        onViewVersions={mockOnViewVersions}
      />
    );
  };

  it('renders content information correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Mathematics • Grade 9')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
  });

  it('displays tags correctly', () => {
    renderComponent();
    
    expect(screen.getByText('math')).toBeInTheDocument();
    expect(screen.getByText('algebra')).toBeInTheDocument();
  });

  it('shows Draft badge for unpublished content', () => {
    renderComponent();
    
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows Published badge for published content', () => {
    const publishedItem = { ...mockContentItem, is_published: true };
    renderComponent(publishedItem);
    
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('calls onPublishToggle when publish button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const publishButton = screen.getByRole('button', { name: /publish/i });
    await user.click(publishButton);
    
    expect(mockOnPublishToggle).toHaveBeenCalledWith('1', false);
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const deleteButton = screen.getAllByRole('button').find(button => 
      button.querySelector('.lucide-trash-2')
    );
    if (deleteButton) {
      await user.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    }
  });

  it('calls onViewVersions when version history button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const versionButton = screen.getAllByRole('button').find(button => 
      button.querySelector('.lucide-clock')
    );
    if (versionButton) {
      await user.click(versionButton);
      expect(mockOnViewVersions).toHaveBeenCalledWith(mockContentItem);
    }
  });
});
