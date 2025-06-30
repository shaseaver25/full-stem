
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import VersionHistoryModal from './VersionHistoryModal';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: string;
  file_url: string;
  thumbnail_url: string;
  tags: string[];
  subject: string;
  grade_level: string;
  is_published: boolean;
  version_number: number;
  created_at: string;
  created_by: string;
}

interface ContentVersion {
  id: string;
  version_number: number;
  title: string;
  description: string;
  changes_summary: string;
  created_at: string;
}

const meta: Meta<typeof VersionHistoryModal> = {
  title: 'Content/VersionHistoryModal',
  component: VersionHistoryModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal component that displays the version history of educational content, showing changes over time with summaries and timestamps.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      description: 'Controls whether the modal is open or closed',
      control: 'boolean',
    },
    selectedContent: {
      description: 'The content item whose version history is being displayed',
      control: 'object',
    },
    versions: {
      description: 'Array of version history entries for the content',
      control: 'object',
    },
    onClose: {
      description: 'Function called when the modal is closed',
      action: 'onClose',
    },
  },
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockContentItem: ContentItem = {
  id: '1',
  title: 'Introduction to Algebra',
  description: 'A comprehensive guide to algebraic concepts',
  content_type: 'document',
  file_url: 'https://example.com/algebra.pdf',
  thumbnail_url: 'https://example.com/algebra-thumb.jpg',
  tags: ['math', 'algebra', 'equations'],
  subject: 'Mathematics',
  grade_level: '8th Grade',
  is_published: true,
  version_number: 3,
  created_at: '2024-01-01T00:00:00Z',
  created_by: 'teacher-1',
};

const mockVersions: ContentVersion[] = [
  {
    id: 'v1',
    version_number: 1,
    title: 'Introduction to Basic Algebra',
    description: 'A basic introduction to algebraic concepts',
    changes_summary: 'Initial version created',
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'v2',
    version_number: 2,
    title: 'Introduction to Algebra',
    description: 'An introduction to algebraic concepts with examples',
    changes_summary: 'Added more examples and improved explanations',
    created_at: '2024-01-15T14:30:00Z',
  },
  {
    id: 'v3',
    version_number: 3,
    title: 'Introduction to Algebra',
    description: 'A comprehensive guide to algebraic concepts',
    changes_summary: 'Enhanced content with practice problems and visual aids',
    created_at: '2024-02-01T09:15:00Z',
  },
];

export const OpenWithVersions: Story = {
  args: {
    isOpen: true,
    selectedContent: mockContentItem,
    versions: mockVersions,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal open and displaying version history with multiple versions',
      },
    },
  },
};

export const OpenWithNoVersions: Story = {
  args: {
    isOpen: true,
    selectedContent: mockContentItem,
    versions: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal open but showing no version history entries',
      },
    },
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
    selectedContent: mockContentItem,
    versions: mockVersions,
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal in closed state (not visible)',
      },
    },
  },
};

export const SingleVersion: Story = {
  args: {
    isOpen: true,
    selectedContent: {
      ...mockContentItem,
      version_number: 1,
    },
    versions: [mockVersions[0]],
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal showing content with only one version',
      },
    },
  },
};

export const ManyVersions: Story = {
  args: {
    isOpen: true,
    selectedContent: {
      ...mockContentItem,
      version_number: 5,
    },
    versions: [
      ...mockVersions,
      {
        id: 'v4',
        version_number: 4,
        title: 'Introduction to Algebra - Advanced',
        description: 'A comprehensive guide to algebraic concepts with advanced topics',
        changes_summary: 'Added advanced problem sets and quadratic equations',
        created_at: '2024-02-15T11:20:00Z',
      },
      {
        id: 'v5',
        version_number: 5,
        title: 'Introduction to Algebra - Complete',
        description: 'A complete guide to algebraic concepts for 8th grade',
        changes_summary: 'Final review and optimization for curriculum alignment',
        created_at: '2024-03-01T16:45:00Z',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Modal displaying content with extensive version history',
      },
    },
  },
};
