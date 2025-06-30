
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContentFilters from '../ContentFilters';

describe('ContentFilters', () => {
  const mockSetSearchTerm = vi.fn();
  const mockSetFilterType = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (searchTerm = '', filterType = 'all') => {
    render(
      <ContentFilters
        searchTerm={searchTerm}
        setSearchTerm={mockSetSearchTerm}
        filterType={filterType}
        setFilterType={mockSetFilterType}
      />
    );
  };

  it('renders search input and filter select', () => {
    renderComponent();
    
    expect(screen.getByPlaceholderText(/search content/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('displays current search term', () => {
    renderComponent('test search');
    
    expect(screen.getByDisplayValue('test search')).toBeInTheDocument();
  });

  it('calls setSearchTerm when search input changes', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText(/search content/i);
    await user.type(searchInput, 'new search');
    
    expect(mockSetSearchTerm).toHaveBeenCalled();
  });

  it('displays filter options when select is opened', async () => {
    const user = userEvent.setup();
    renderComponent();
    
    const selectTrigger = screen.getByRole('combobox');
    await user.click(selectTrigger);
    
    expect(screen.getByText('All Types')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Images')).toBeInTheDocument();
    expect(screen.getByText('Interactive')).toBeInTheDocument();
  });
});
