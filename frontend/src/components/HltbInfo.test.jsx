import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import HltbInfo from './HltbInfo';

describe('HltbInfo', () => {
  test('renders all three time values when provided', () => {
    render(<HltbInfo mainStory={10} mainPlusExtras={20} completionist={50} />);
    expect(screen.getByText('10h')).toBeInTheDocument();
    expect(screen.getByText('Main Story')).toBeInTheDocument();
    expect(screen.getByText('20h')).toBeInTheDocument();
    expect(screen.getByText('Main + Extras')).toBeInTheDocument();
    expect(screen.getByText('50h')).toBeInTheDocument();
    expect(screen.getByText('Completionist')).toBeInTheDocument();
  });

  test('renders only mainStory when others are missing', () => {
    render(<HltbInfo mainStory={15} />);
    expect(screen.getByText('15h')).toBeInTheDocument();
    expect(screen.getByText('Main Story')).toBeInTheDocument();
    expect(screen.queryByText('Main + Extras')).not.toBeInTheDocument();
    expect(screen.queryByText('Completionist')).not.toBeInTheDocument();
  });

  test('shows "HLTB data unknown" when no props provided', () => {
    render(<HltbInfo />);
    expect(screen.getByText('HLTB data unknown')).toBeInTheDocument();
  });

  test('shows "HLTB data unknown" when all props are null', () => {
    render(<HltbInfo mainStory={null} mainPlusExtras={null} completionist={null} />);
    expect(screen.getByText('HLTB data unknown')).toBeInTheDocument();
  });

  test('renders partial data (mainStory + completionist only)', () => {
    render(<HltbInfo mainStory={8} completionist={40} />);
    expect(screen.getByText('8h')).toBeInTheDocument();
    expect(screen.getByText('40h')).toBeInTheDocument();
    expect(screen.queryByText('Main + Extras')).not.toBeInTheDocument();
  });
});
