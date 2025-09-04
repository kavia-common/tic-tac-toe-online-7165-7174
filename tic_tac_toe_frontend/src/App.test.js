import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const title = screen.getByText(/Tic Tac Toe/i);
  expect(title).toBeInTheDocument();
});

test('shows initial turn status', () => {
  render(<App />);
  const status = screen.getByText(/Turn: X/i);
  expect(status).toBeInTheDocument();
});
