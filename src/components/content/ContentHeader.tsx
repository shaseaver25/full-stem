
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import ContentForm from './ContentForm';

/**
 * Props interface for ContentHeader component
 * 
 * @interface ContentHeaderProps
 * @property {boolean} isCreateModalOpen - Controls modal open/close state
 * @property {Function} setIsCreateModalOpen - Function to toggle modal state
 * @property {Object} formData - Current form data for content creation
 * @property {Function} setFormData - Function to update form data
 * @property {Function} onCreateContent - Callback executed when content is created
 */
interface ContentHeaderProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  formData: any;
  setFormData: (data: any) => void;
  onCreateContent: () => void;
}

/**
 * ContentHeader - Header component for content management pages
 * 
 * @description Displays the page title and provides access to content creation functionality
 * through a modal dialog. Integrates with ContentForm for the creation process.
 * 
 * @param {ContentHeaderProps} props - Component props
 * @param {boolean} props.isCreateModalOpen - Whether the creation modal is currently open
 * @param {Function} props.setIsCreateModalOpen - Function to control modal visibility
 * @param {Object} props.formData - Current state of the content creation form
 * @param {Function} props.setFormData - Function to update form data
 * @param {Function} props.onCreateContent - Callback triggered when content creation is submitted
 * 
 * @returns {JSX.Element} Rendered header with title and create button
 * 
 * @example
 * ```tsx
 * function ContentManagementPage() {
 *   const [isModalOpen, setIsModalOpen] = useState(false);
 *   const [formData, setFormData] = useState(initialFormData);
 *   
 *   const handleCreateContent = async () => {
 *     // Handle content creation logic
 *     await createContent(formData);
 *     setIsModalOpen(false);
 *   };
 *   
 *   return (
 *     <div>
 *       <ContentHeader
 *         isCreateModalOpen={isModalOpen}
 *         setIsCreateModalOpen={setIsModalOpen}
 *         formData={formData}
 *         setFormData={setFormData}
 *         onCreateContent={handleCreateContent}
 *       />
 *       {/* Rest of content management interface */}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @component
 * @category Content Management
 */
const ContentHeader: React.FC<ContentHeaderProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  formData,
  setFormData,
  onCreateContent
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Content Library</h1>
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogTrigger asChild>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>
              Add new educational content to your library
            </DialogDescription>
          </DialogHeader>
          <ContentForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={onCreateContent}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentHeader;
