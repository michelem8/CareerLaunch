import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SurveySteps } from '../survey-steps';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithClient } from '../../test/utils';

const queryClient = new QueryClient();

const renderWithQueryClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('SurveySteps', () => {
  const onComplete = vi.fn();
  const onStepChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillFirstStep = async () => {
    const currentRoleInput = screen.getByLabelText('Current Role');
    const targetRoleInput = screen.getByLabelText('Target Role');
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    await userEvent.type(currentRoleInput, 'Software Engineer');
    await userEvent.type(targetRoleInput, 'Senior Software Engineer');
    await userEvent.click(continueButton);
  };

  it('renders the first step initially', () => {
    renderWithClient(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);
    
    expect(screen.getByLabelText(/Current Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Target Role/i)).toBeInTheDocument();
  });

  it('should allow selecting "Any industry" option', async () => {
    renderWithQueryClient(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Fill in Step 1 to get to Step 2
    await fillFirstStep();

    // Open the dropdown
    const dropdown = screen.getByLabelText('Industries of Interest');
    await userEvent.click(dropdown);

    // Select "Any industry"
    const anyIndustryOption = screen.getByRole('option', { name: 'Any industry' });
    await userEvent.click(anyIndustryOption);

    // Verify "Any industry" is selected
    expect(screen.getByText('Any industry')).toBeInTheDocument();
  });

  it('should clear other selections when "Any industry" is selected', async () => {
    renderWithQueryClient(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Fill in Step 1 to get to Step 2
    await fillFirstStep();

    // Open the dropdown
    const dropdown = screen.getByLabelText('Industries of Interest');
    await userEvent.click(dropdown);

    // Select a specific industry first
    const enterpriseOption = screen.getByRole('option', { name: 'Enterprise Software' });
    await userEvent.click(enterpriseOption);

    // Select "Any industry"
    const anyIndustryOption = screen.getByRole('option', { name: 'Any industry' });
    await userEvent.click(anyIndustryOption);

    // Verify only "Any industry" is selected
    expect(screen.getByText('Any industry')).toBeInTheDocument();
    expect(screen.queryByText('Enterprise Software')).not.toBeInTheDocument();
  });

  it('should clear "Any industry" when a specific industry is selected', async () => {
    renderWithQueryClient(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Fill in Step 1 to get to Step 2
    await fillFirstStep();

    // Open the dropdown
    const dropdown = screen.getByLabelText('Industries of Interest');
    await userEvent.click(dropdown);

    // Select "Any industry" first
    const anyIndustryOption = screen.getByRole('option', { name: 'Any industry' });
    await userEvent.click(anyIndustryOption);

    // Select a specific industry
    const enterpriseOption = screen.getByRole('option', { name: 'Enterprise Software' });
    await userEvent.click(enterpriseOption);

    // Verify only the specific industry is selected
    expect(screen.queryByText('Any industry')).not.toBeInTheDocument();
    expect(screen.getByText('Enterprise Software')).toBeInTheDocument();
  });

  it('should navigate through steps correctly', async () => {
    renderWithQueryClient(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Fill in Step 1
    await fillFirstStep();

    // Fill in Step 2
    const industriesDropdown = screen.getByLabelText('Industries of Interest');
    await userEvent.click(industriesDropdown);
    const anyIndustryOption = screen.getByRole('option', { name: 'Any industry' });
    await userEvent.click(anyIndustryOption);

    // Continue to Step 3
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    // Fill in Step 3
    const timeCommitmentDropdown = screen.getByLabelText('Weekly Time Commitment');
    await userEvent.click(timeCommitmentDropdown);
    const timeOption = screen.getByRole('option', { name: '5-10 hours' });
    await userEvent.click(timeOption);

    const learningStylesDropdown = screen.getByLabelText('Learning Styles');
    await userEvent.click(learningStylesDropdown);
    const styleOption = screen.getByRole('option', { name: 'Visual Learning' });
    await userEvent.click(styleOption);

    // Submit the form
    await userEvent.click(continueButton);

    // Verify onComplete was called
    expect(onComplete).toHaveBeenCalled();
  });

  it('validates required fields before proceeding', async () => {
    renderWithQueryClient(<SurveySteps onComplete={onComplete} onStepChange={onStepChange} />);

    // Try to continue without filling in required fields
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);

    // Verify error messages are shown
    expect(screen.getByText('String must contain at least 1 character(s)')).toBeInTheDocument();
  });
}); 