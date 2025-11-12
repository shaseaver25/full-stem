import type { Meta, StoryObj } from '@storybook/react';
import { EditorShell } from './EditorShell';
import { useState } from 'react';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

const meta = {
  title: 'Lesson Editors/EditorShell',
  component: EditorShell,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <AccessibilityProvider>
        <Story />
      </AccessibilityProvider>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof EditorShell>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle state for interactive stories
const EditorWrapper = (props: any) => {
  const [code, setCode] = useState(props.value || '');
  return <EditorShell {...props} value={code} onChange={setCode} />;
};

const sampleJavaScript = `function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("World");`;

const samplePython = `def greet(name):
    print(f"Hello, {name}!")

greet("World")`;

export const KidMode: Story = {
  args: {
    mode: 'kid',
    language: 'javascript',
    value: sampleJavaScript,
    onChange: (value) => console.log('Code changed:', value),
    height: '400px',
  },
  render: (args) => <EditorWrapper {...args} />,
};

export const ProMode: Story = {
  args: {
    mode: 'pro',
    language: 'javascript',
    value: sampleJavaScript,
    onChange: (value) => console.log('Code changed:', value),
    height: '400px',
  },
  render: (args) => <EditorWrapper {...args} />,
};

export const AccessibilityMode: Story = {
  args: {
    mode: 'kid',
    language: 'javascript',
    value: sampleJavaScript,
    onChange: (value) => console.log('Code changed:', value),
    height: '400px',
    accessibilitySettings: {
      fontSize: 20,
      highContrast: true,
      dyslexiaFont: true,
    },
  },
  render: (args) => <EditorWrapper {...args} />,
};

export const PythonKidMode: Story = {
  args: {
    mode: 'kid',
    language: 'python',
    value: samplePython,
    onChange: (value) => console.log('Code changed:', value),
    height: '400px',
  },
  render: (args) => <EditorWrapper {...args} />,
};

export const PythonProMode: Story = {
  args: {
    mode: 'pro',
    language: 'python',
    value: samplePython,
    onChange: (value) => console.log('Code changed:', value),
    height: '400px',
  },
  render: (args) => <EditorWrapper {...args} />,
};

export const ReadOnly: Story = {
  args: {
    mode: 'pro',
    language: 'javascript',
    value: sampleJavaScript,
    onChange: (value) => console.log('Code changed:', value),
    readOnly: true,
    height: '400px',
  },
  render: (args) => <EditorWrapper {...args} />,
};

export const CustomHeight: Story = {
  args: {
    mode: 'kid',
    language: 'javascript',
    value: sampleJavaScript,
    onChange: (value) => console.log('Code changed:', value),
    height: '600px',
  },
  render: (args) => <EditorWrapper {...args} />,
};
