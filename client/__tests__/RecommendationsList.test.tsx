import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecommendationsList } from '../components/RecommendationsList';

describe('RecommendationsList', () => {
  const mockRecommendations = [
    'Learn system design principles',
    'Study software architecture patterns',
    'Develop leadership skills',
    'Practice coding interviews',
    'Build a portfolio project'
  ];

  it('should render all recommendations when there are 3 or fewer', () => {
    const shortRecommendations = mockRecommendations.slice(0, 3);
    render(<RecommendationsList recommendations={shortRecommendations} />);
    
    shortRecommendations.forEach(rec => {
      expect(screen.getByText(rec)).toBeInTheDocument();
    });
    expect(screen.queryByText('See more')).not.toBeInTheDocument();
  });

  it('should initially show only 3 recommendations when there are more than 3', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    // First 3 recommendations should be visible
    expect(screen.getByText(mockRecommendations[0])).toBeInTheDocument();
    expect(screen.getByText(mockRecommendations[1])).toBeInTheDocument();
    expect(screen.getByText(mockRecommendations[2])).toBeInTheDocument();
    
    // 4th and 5th recommendations should not be visible initially
    expect(screen.queryByText(mockRecommendations[3])).not.toBeInTheDocument();
    expect(screen.queryByText(mockRecommendations[4])).not.toBeInTheDocument();
    
    // "See more" button should be present
    expect(screen.getByText('See more')).toBeInTheDocument();
  });

  it('should show all recommendations when "See more" is clicked', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    // Click "See more" button
    fireEvent.click(screen.getByText('See more'));
    
    // All recommendations should now be visible
    mockRecommendations.forEach(rec => {
      expect(screen.getByText(rec)).toBeInTheDocument();
    });
    
    // "See more" should be replaced with "Show less"
    expect(screen.queryByText('See more')).not.toBeInTheDocument();
    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('should collapse back to 3 recommendations when "Show less" is clicked', () => {
    render(<RecommendationsList recommendations={mockRecommendations} />);
    
    // Expand
    fireEvent.click(screen.getByText('See more'));
    // Collapse
    fireEvent.click(screen.getByText('Show less'));
    
    // Only first 3 recommendations should be visible
    expect(screen.getByText(mockRecommendations[0])).toBeInTheDocument();
    expect(screen.getByText(mockRecommendations[1])).toBeInTheDocument();
    expect(screen.getByText(mockRecommendations[2])).toBeInTheDocument();
    
    // 4th and 5th recommendations should be hidden
    expect(screen.queryByText(mockRecommendations[3])).not.toBeInTheDocument();
    expect(screen.queryByText(mockRecommendations[4])).not.toBeInTheDocument();
    
    // "See more" button should be back
    expect(screen.getByText('See more')).toBeInTheDocument();
  });
}); 