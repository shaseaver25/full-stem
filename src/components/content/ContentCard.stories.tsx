
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ContentCard from './ContentCard';

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

const meta: Meta<typeof ContentCard> = {
  title: 'Content/ContentCard',
  component: ContentCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component that displays educational content information with action buttons for publishing, editing, viewing versions, and deleting.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    item: {
      description: 'Content item object with all content details',
      control: 'object',
    },
    onPublishToggle: {
      description: 'Function called when publish/unpublish button is clicked',
      action: 'onPublishToggle',
    },
    onDelete: {
      description: 'Function called when delete button is clicked',
      action: 'onDelete',
    },
    onViewVersions: {
      description: 'Function called when version history button is clicked',
      action: 'onViewVersions',
    },
  },
  args: {
    onPublishToggle: fn(),
    onDelete: fn(),
    onViewVersions: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const baseDraftItem: ContentItem = {
  id: '1',
  title: 'Introduction to Photosynthesis',
  description: 'Learn how plants convert sunlight into energy through the process of photosynthesis.',
  content_type: 'document',
  file_url: 'https://example.com/photosynthesis.pdf',
  thumbnail_url: 'https://example.com/photosynthesis-thumb.jpg',
  tags: ['biology', 'plants', 'science', 'photosynthesis'],
  subject: 'Biology',
  grade_level: '7th Grade',
  is_published: false,
  version_number: 1,
  created_at: '2024-01-15T10:00:00Z',
  created_by: 'teacher-1',
};

const basePublishedItem: ContentItem = {
  id: '2',
  title: 'Shakespeare\'s Romeo and Juliet',
  description: 'Explore the themes, characters, and literary devices in Shakespeare\'s famous tragedy.',
  content_type: 'video',
  file_url: 'https://example.com/romeo-juliet.mp4',
  thumbnail_url: 'https://example.com/romeo-juliet-thumb.jpg',
  tags: ['literature', 'shakespeare', 'drama', 'english'],
  subject: 'English Literature',
  grade_level: '9th Grade',
  is_published: true,
  version_number: 3,
  created_at: '2024-01-10T14:30:00Z',
  created_by: 'teacher-2',
};

export const DraftContent: Story = {
  args: {
    item: baseDraftItem,
  },
  parameters: {
    docs: {
      description: {
        story: 'Content card showing a draft item that hasn\'t been published yet',
      },
    },
  },
};

export const PublishedContent: Story = {
  args: {
    item: basePublishedItem,
  },
  parameters: {
    docs: {
      description: {
        story: 'Content card showing a published item available to students',
      },
    },
  },
};

export const VideoContent: Story = {
  args: {
    item: {
      ...baseDraftItem,
      id: '3',
      title: 'Chemical Reactions Explained',
      description: 'Visual demonstration of various chemical reactions and their properties.',
      content_type: 'video',
      subject: 'Chemistry',
      tags: ['chemistry', 'reactions', 'experiments'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Content card displaying video content with appropriate icon',
      },
    },
  },
};

export const AudioContent: Story = {
  args: {
    item: {
      ...basePublishedItem,
      id: '4',
      title: 'Spanish Pronunciation Guide',
      description: 'Audio guide for proper Spanish pronunciation and accent marks.',
      content_type: 'audio',
      subject: 'Spanish',
      tags: ['spanish', 'pronunciation', 'language'],
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Content card displaying audio content with appropriate icon',
      },
    },
  },
};
