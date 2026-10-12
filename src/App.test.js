import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Homie Photobooth header', () => {
  render(<App />);
  const heading = screen.getByText(/Homie Photobooth/i);
  expect(heading).toBeInTheDocument();
});
