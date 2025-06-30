
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ContentForm from '../ContentForm';

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

describe('ContentForm', () => {
  const mockSetFormData = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (formData = mockFormData) => {
    render(
      <ContentForm
        formData={formData}
        setFormData={mockSetFormData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
  };

  it('renders all form fields', () => {
    renderComponent();
    
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/grade level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/file url/i)).toBeInTheDocument();
  });

  it('displays form data values correctly', () => {
    const filledFormData = {
      ...mockFormData,
      title: 'Test Title',
      description: 'Test Description'
    };
    
    renderComponent(filledFormData);
    
    expect(screen.getByDisplayValue('Test Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('calls setFormData when input values change', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New Title');
    
    expect(mockSetFormData).toHaveBeenCalled();
  });

  it('calls onSubmit when Create Content button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const submitButton = screen.getByRole('button', { name: /create content/i });
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledOnce();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledOnce();
  });
});
