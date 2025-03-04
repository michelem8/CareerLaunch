import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleCard } from '../../src/components/CareerDashboard';

// The RoleCard component is now properly exported from CareerDashboard.tsx

describe('RoleCard Component', () => {
  const mockSkills = ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5'];
  
  it('should initially show only first 2 skills and a "+X more" button', () => {
    render(
      <RoleCard
        title="Current Role"
        subtitle="Software Engineer"
        skills={mockSkills}
        skillCount={mockSkills.length}
      />
    );

    // Check that only first 2 skills are visible
    expect(screen.getByText('Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Skill 2')).toBeInTheDocument();
    expect(screen.queryByText('Skill 3')).not.toBeInTheDocument();
    
    // Check for the "+ 3 more skills" text
    expect(screen.getByText('+ 3 more skills')).toBeInTheDocument();
  });

  it('should expand to show all skills when clicking the "+X more" button', () => {
    render(
      <RoleCard
        title="Current Role"
        subtitle="Software Engineer"
        skills={mockSkills}
        skillCount={mockSkills.length}
      />
    );

    // Click the expand button
    fireEvent.click(screen.getByText('+ 3 more skills'));

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
        skillCount={mockSkills.length}
      />
    );

    // First expand
    fireEvent.click(screen.getByText('+ 3 more skills'));
    
    // Then collapse
    fireEvent.click(screen.getByText('Show less'));

    // Check that only first 2 skills are visible again
    expect(screen.getByText('Skill 1')).toBeInTheDocument();
    expect(screen.getByText('Skill 2')).toBeInTheDocument();
    expect(screen.queryByText('Skill 3')).not.toBeInTheDocument();
    
    // Check that the "+ 3 more skills" text is back
    expect(screen.getByText('+ 3 more skills')).toBeInTheDocument();
  });

  it('should handle roles text correctly for "Suggested Roles"', () => {
    render(
      <RoleCard
        title="Suggested Roles"
        subtitle="Based on your skills"
        skills={mockSkills}
        skillCount={mockSkills.length}
      />
    );
    
    expect(screen.getByText('+ 3 more roles')).toBeInTheDocument();
  });
}); 