import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { SkeletonCard, SkeletonGrid, SkeletonList } from './SkeletonLoader';

describe('SkeletonCard', () => {
  test('renders with default 3 skeleton lines', () => {
    const { container } = render(<SkeletonCard />);
    const lines = container.querySelectorAll('.skeleton-line');
    expect(lines).toHaveLength(3);
  });

  test('renders custom number of lines', () => {
    const { container } = render(<SkeletonCard lines={5} />);
    const lines = container.querySelectorAll('.skeleton-line');
    expect(lines).toHaveLength(5);
  });

  test('renders skeleton image when hasImage is true', () => {
    const { container } = render(<SkeletonCard hasImage />);
    expect(container.querySelector('.skeleton-image')).toBeInTheDocument();
  });

  test('does not render skeleton image by default', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.skeleton-image')).not.toBeInTheDocument();
  });

  test('has skeleton-card class', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.skeleton-card')).toBeInTheDocument();
  });
});

describe('SkeletonGrid', () => {
  test('renders default 4 stat cards', () => {
    const { container } = render(<SkeletonGrid />);
    const cards = container.querySelectorAll('.stat-card');
    expect(cards).toHaveLength(4);
  });

  test('renders custom count of stat cards', () => {
    const { container } = render(<SkeletonGrid count={6} />);
    const cards = container.querySelectorAll('.stat-card');
    expect(cards).toHaveLength(6);
  });

  test('each stat card has skeleton-value and skeleton-label', () => {
    const { container } = render(<SkeletonGrid count={2} />);
    expect(container.querySelectorAll('.skeleton-value')).toHaveLength(2);
    expect(container.querySelectorAll('.skeleton-label')).toHaveLength(2);
  });

  test('uses correct grid class based on columns prop', () => {
    const { container } = render(<SkeletonGrid columns={3} />);
    expect(container.querySelector('.grid-3')).toBeInTheDocument();
  });
});

describe('SkeletonList', () => {
  test('renders default 5 skeleton cards', () => {
    const { container } = render(<SkeletonList />);
    const cards = container.querySelectorAll('.skeleton-card');
    expect(cards).toHaveLength(5);
  });

  test('renders custom count of skeleton cards', () => {
    const { container } = render(<SkeletonList count={3} />);
    const cards = container.querySelectorAll('.skeleton-card');
    expect(cards).toHaveLength(3);
  });

  test('renders skeleton images by default', () => {
    const { container } = render(<SkeletonList count={2} />);
    expect(container.querySelectorAll('.skeleton-image')).toHaveLength(2);
  });

  test('hides skeleton images when hasImage is false', () => {
    const { container } = render(<SkeletonList count={2} hasImage={false} />);
    expect(container.querySelectorAll('.skeleton-image')).toHaveLength(0);
  });
});
