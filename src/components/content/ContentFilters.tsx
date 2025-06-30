
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Props interface for ContentFilters component
 * 
 * @interface ContentFiltersProps
 * @property {string} searchTerm - Current search term value
 * @property {Function} setSearchTerm - Function to update search term
 * @property {string} filterType - Current filter type selection
 * @property {Function} setFilterType - Function to update filter type
 */
interface ContentFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
}

/**
 * ContentFilters - A reusable filtering component for content libraries
 * 
 * @description Provides search and filter functionality for content collections.
 * Includes a text search input and a dropdown for content type filtering.
 * 
 * @param {ContentFiltersProps} props - Component props
 * @param {string} props.searchTerm - Current search term for filtering content
 * @param {Function} props.setSearchTerm - Callback to update search term
 * @param {string} props.filterType - Current selected content type filter
 * @param {Function} props.setFilterType - Callback to update content type filter
 * 
 * @returns {JSX.Element} Rendered filter controls
 * 
 * @example
 * ```tsx
 * function ContentLibrary() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const [filterType, setFilterType] = useState('all');
 *   
 *   return (
 *     <div>
 *       <ContentFilters
 *         searchTerm={searchTerm}
 *         setSearchTerm={setSearchTerm}
 *         filterType={filterType}
 *         setFilterType={setFilterType}
 *       />
 *       {/* Content list filtered by searchTerm and filterType */}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @component
 * @category Content Management
 */
const ContentFilters: React.FC<ContentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType
}) => {
  return (
    <div className="flex space-x-4">
      <Input
        placeholder="Search content..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="document">Documents</SelectItem>
          <SelectItem value="video">Videos</SelectItem>
          <SelectItem value="audio">Audio</SelectItem>
          <SelectItem value="image">Images</SelectItem>
          <SelectItem value="interactive">Interactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ContentFilters;
