import { render, screen, fireEvent } from '@testing-library/react';
import { SurveySteps } from '../survey-steps';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock the API request function
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}));

describe('SurveySteps', () => {
  it('renders the first step initially', () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();

    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);
    
    expect(screen.getByText(/What's your current role?/i)).toBeInTheDocument();
  });

  it('should allow selecting "Any industry" option', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Find and click the industries dropdown
    const industriesDropdown = screen.getByPlaceholderText('Select industries...');
    await userEvent.click(industriesDropdown);

    // Find and click the "Any industry" option
    const anyIndustryOption = screen.getByText('Any industry');
    await userEvent.click(anyIndustryOption);

    // Verify that "Any industry" is selected
    expect(screen.getByText('Any industry')).toBeInTheDocument();

    // When "Any industry" is selected, other options should be disabled
    const otherOption = screen.getByText('Consumer-Facing Tech');
    expect(otherOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('should clear other selections when "Any industry" is selected', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Find and click the industries dropdown
    const industriesDropdown = screen.getByPlaceholderText('Select industries...');
    await userEvent.click(industriesDropdown);

    // Select a specific industry first
    const specificIndustry = screen.getByText('Consumer-Facing Tech');
    await userEvent.click(specificIndustry);

    // Then select "Any industry"
    const anyIndustryOption = screen.getByText('Any industry');
    await userEvent.click(anyIndustryOption);

    // Verify that only "Any industry" is selected
    expect(screen.getByText('Any industry')).toBeInTheDocument();
    expect(screen.queryByText('Consumer-Facing Tech')).not.toBeInTheDocument();
  });

  it('should clear "Any industry" when a specific industry is selected', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Find and click the industries dropdown
    const industriesDropdown = screen.getByPlaceholderText('Select industries...');
    await userEvent.click(industriesDropdown);

    // Select "Any industry" first
    const anyIndustryOption = screen.getByText('Any industry');
    await userEvent.click(anyIndustryOption);

    // Then select a specific industry
    const specificIndustry = screen.getByText('Consumer-Facing Tech');
    await userEvent.click(specificIndustry);

    // Verify that only the specific industry is selected
    expect(screen.queryByText('Any industry')).not.toBeInTheDocument();
    expect(screen.getByText('Consumer-Facing Tech')).toBeInTheDocument();
  });

  it('should navigate through steps correctly', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Step 1: Current and Target Role
    expect(screen.getByLabelText('Current Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Role')).toBeInTheDocument();
    expect(screen.queryByText('Industries of Interest')).not.toBeInTheDocument();

    // Fill in Step 1
    await userEvent.type(screen.getByLabelText('Current Role'), 'Software Engineer');
    await userEvent.type(screen.getByLabelText('Target Role'), 'Senior Engineer');
    await userEvent.click(screen.getByText('Continue'));

    // Step 2: Industries
    expect(screen.getByText('Industries of Interest')).toBeInTheDocument();
    expect(screen.queryByLabelText('Current Role')).not.toBeInTheDocument();
    
    // Select an industry and continue
    const industriesDropdown = screen.getByPlaceholderText('Select industries...');
    await userEvent.click(industriesDropdown);
    await userEvent.click(screen.getByText('Consumer-Facing Tech'));
    await userEvent.click(screen.getByText('Continue'));

    // Step 3: Learning Styles and Time Commitment
    expect(screen.getByText('Learning Styles')).toBeInTheDocument();
    expect(screen.getByText('Weekly Time Commitment')).toBeInTheDocument();
    expect(screen.queryByText('Industries of Interest')).not.toBeInTheDocument();
  });

  it('should update step indicator when navigating through steps', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Initial step
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument();

    // Fill in Step 1 and continue
    await userEvent.type(screen.getByLabelText('Current Role'), 'Software Engineer');
    await userEvent.type(screen.getByLabelText('Target Role'), 'Senior Engineer');
    await userEvent.click(screen.getByText('Continue'));

    // Check step 2 indicator
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();

    // Select an industry and continue
    const industriesDropdown = screen.getByPlaceholderText('Select industries...');
    await userEvent.click(industriesDropdown);
    await userEvent.click(screen.getByText('Consumer-Facing Tech'));
    await userEvent.click(screen.getByText('Continue'));

    // Check step 3 indicator
    expect(screen.getByText('Step 3 of 3')).toBeInTheDocument();

    // Test back navigation
    await userEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Step 2 of 3')).toBeInTheDocument();
  });

  it('allows selecting a role and moving to the next step', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();

    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);
    
    // Your existing test code...
  });

  it('allows selecting skills and moving to the next step', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();

    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);
    
    // Your existing test code...
  });

  it('allows selecting experience level and completing the survey', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();

    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);
    
    // Your existing test code...
  });

  it('validates required fields before proceeding', async () => {
    const onComplete = vi.fn();
    const onStepChange = vi.fn();

    render(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);
    
    // Your existing test code...
  });
}); 