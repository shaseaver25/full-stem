
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ContentHeader from '../ContentHeader';

const mockFormData = {
  title: '',
  description: '',
  content_type: 'document',
  subject: '',
  grade_level: '',
  tags: '',
  file_url: '',
  thumbnail_url: ''
};

describe('ContentHeader', () => {
  const mockSetIsCreateModalOpen = vi.fn();
  const mockSetFormData = vi.fn();
  const mockOnCreateContent = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (isCreateModalOpen = false) => {
    render(
      <ContentHeader
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={mockSetIsCreateModalOpen}
        formData={mockFormData}
        setFormData={mockSetFormData}
        onCreateContent={mockOnCreateContent}
      />
    );
  };

  it('renders header title and add content button', () => {
    renderComponent();
    
    expect(screen.getByText('Content Library')).toBeInTheDocument();
    expect(screen.getByText('Add Content')).toBeInTheDocument();
  });

  it('opens modal when Add Content button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const addButton = screen.getByText('Add Content');
    await user.click(addButton);
    
    expect(mockSetIsCreateModalOpen).toHaveBeenCalledWith(true);
  });

  it('shows modal when isCreateModalOpen is true', () => {
    renderComponent(true);
    
    expect(screen.getByText('Create New Content')).toBeInTheDocument();
    expect(screen.getByText('Add new educational content to your library')).toBeInTheDocument();
  });

  it('renders ContentForm inside modal when open', () => {
    renderComponent(true);
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
});
