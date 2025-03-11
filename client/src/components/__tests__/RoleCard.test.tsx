import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleCard } from '../CareerDashboard';
import { describe, it, expect } from 'vitest';

describe('RoleCard', () => {
  const mockSkills = Array.from({ length: 10 }, (_, i) => `Skill ${i + 1}`);
  
  it('should initially show only first 2 skills and a "+X more" button', () => {
    render(
      <RoleCard
        title="Current Role"
        subtitle="Software Engineer"
        skills={mockSkills}
      />
    );

    // Check that only first 2 skills are visible
    expect(screen.getByText('Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Skill 2')).toBeInTheDocument();
    expect(screen.queryByText('Skill 3')).not.toBeInTheDocument();
    
    // Check for the "+8 more skills" text
    expect(screen.getByText('+ 8 more skills')).toBeInTheDocument();
  });

  it('should expand to show all skills when clicking the "+X more" button', () => {
    render(
      <RoleCard
        title="Current Role"
        subtitle="Software Engineer"
        skills={mockSkills}
      />
    );

    // Click the expand button
    fireEvent.click(screen.getByText('+ 8 more skills'));

    // Check that all skills are now visible
    mockSkills.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });

    // Check that there's now a "Show less" button
    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('should collapse back to showing only 2 skills when clicking "Show less"', () => {
    render(
      <RoleCard
        title="Current Role"
        subtitle="Software Engineer"
        skills={mockSkills}
      />
    );

    // First expand
    fireEvent.click(screen.getByText('+ 8 more skills'));
    
    // Then collapse
    fireEvent.click(screen.getByText('Show less'));

    // Check that only first 2 skills are visible again
    expect(screen.getByText('Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Skill 2')).toBeInTheDocument();
    expect(screen.queryByText('Skill 3')).not.toBeInTheDocument();
    
    // Check that the "+8 more skills" text is back
    expect(screen.getByText('+ 8 more skills')).toBeInTheDocument();
  });
}); 