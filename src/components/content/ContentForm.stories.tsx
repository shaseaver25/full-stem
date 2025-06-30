
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ContentForm from './ContentForm';

const meta: Meta<typeof ContentForm> = {
  title: 'Content/ContentForm',
  component: ContentForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form component for creating and editing educational content with various fields including title, description, content type, subject, grade level, tags, and file URL.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    formData: {
      description: 'Form data object containing all form field values',
      control: 'object',
    },
    setFormData: {
      description: 'Function to update form data',
      action: 'setFormData',
    },
    onSubmit: {
      description: 'Function called when form is submitted',
      action: 'onSubmit',
    },
    onCancel: {
      description: 'Function called when form is cancelled',
      action: 'onCancel',
    },
  },
  args: {
    setFormData: fn(),
    onSubmit: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const emptyFormData = {
  title: '',
  description: '',
  content_type: 'document',
  subject: '',
  grade_level: '',
  tags: '',
  file_url: '',
  thumbnail_url: '',
};

const preFilledFormData = {
  title: 'Introduction to Algebra',
  description: 'A comprehensive introduction to basic algebraic concepts including variables, equations, and problem-solving strategies.',
  content_type: 'video',
  subject: 'Mathematics',
  grade_level: '8th Grade',
  tags: 'algebra, math, equations, variables',
  file_url: 'https://example.com/algebra-intro.mp4',
  thumbnail_url: 'https://example.com/algebra-thumb.jpg',
};

export const EmptyForm: Story = {
  args: {
    formData: emptyFormData,
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty form ready for new content creation',
      },
    },
  },
};

export const PreFilledForm: Story = {
  args: {
    formData: preFilledFormData,
  },
  parameters: {
    docs: {
      description: {
        story: 'Form with pre-filled data for editing existing content',
      },
    },
  },
};
