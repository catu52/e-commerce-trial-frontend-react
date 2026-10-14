import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import { server } from '../test/server';
import { API, TEST_TOKEN } from '../test/handlers';
import { renderWithProviders } from '../test/utils';
import { getToken } from '../lib/api';
import { AuthModal } from './AuthModal';

const setup = (props: Partial<React.ComponentProps<typeof AuthModal>> = {}) => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const utils = renderWithProviders(<AuthModal onClose={onClose} onSuccess={onSuccess} {...props} />);
  return { onClose, onSuccess, ...utils };
};

describe('AuthModal', () => {
  it('starts in login mode with email/password only', () => {
    setup();
    expect(screen.getByText('ARCHIVIST ACCESS')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('EMAIL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('PASSWORD (MIN 8)')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('FULL NAME')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('CONFIRM PASSWORD')).not.toBeInTheDocument();
  });

  it('can start in register mode', () => {
    setup({ initialMode: 'register' });
    expect(screen.getByPlaceholderText('FULL NAME')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CREATE ACCOUNT' })).toBeInTheDocument();
  });

  it('toggles between modes', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'NO ACCOUNT? REGISTER' }));
    expect(screen.getByText('REGISTER NEW ARCHIVIST')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'ALREADY REGISTERED? LOG IN' }));
    expect(screen.getByText('ARCHIVIST ACCESS')).toBeInTheDocument();
  });

  it('logs in, stores the token, then calls onSuccess and onClose', async () => {
    const { user, onClose, onSuccess } = setup();
    await user.type(screen.getByPlaceholderText('EMAIL'), 'ada@example.com');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'password123');
    await user.click(screen.getByRole('button', { name: 'LOG IN' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(getToken()).toBe(TEST_TOKEN);
  });

  it('shows the API message on bad credentials and stays open', async () => {
    const { user, onClose, onSuccess } = setup();
    await user.type(screen.getByPlaceholderText('EMAIL'), 'ada@example.com');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'LOG IN' }));
    expect(await screen.findByText('Invalid credentials.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'LOG IN' })).toBeEnabled();
  });

  it('shows network errors', async () => {
    server.use(http.post(`${API}/client/login`, () => HttpResponse.error()));
    const { user } = setup();
    await user.type(screen.getByPlaceholderText('EMAIL'), 'a@b.c');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'password123');
    await user.click(screen.getByRole('button', { name: 'LOG IN' }));
    expect(await screen.findByText(/unable to reach the server/i)).toBeInTheDocument();
  });

  it('disables submit and shows a busy label while the request is in flight', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    server.use(
      http.post(`${API}/client/login`, async () => {
        await gate;
        return HttpResponse.json({ token: TEST_TOKEN, client: { id: 1, email: 'a@b.c', name: 'A' } });
      }),
    );
    const { user, onClose } = setup();
    await user.type(screen.getByPlaceholderText('EMAIL'), 'a@b.c');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'password123');
    await user.click(screen.getByRole('button', { name: 'LOG IN' }));
    const busy = await screen.findByRole('button', { name: 'TRANSMITTING...' });
    expect(busy).toBeDisabled();
    release();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('registers splitting the full name and sending confirmation', async () => {
    let body: Record<string, string> = {};
    server.use(
      http.post(`${API}/client/register`, async ({ request }) => {
        body = (await request.json()) as Record<string, string>;
        return HttpResponse.json({ token: TEST_TOKEN, client: { id: 2, email: body.email, name: 'x' } }, { status: 201 });
      }),
    );
    const { user, onClose } = setup({ initialMode: 'register' });
    await user.type(screen.getByPlaceholderText('FULL NAME'), 'Grace Brewster Hopper');
    await user.type(screen.getByPlaceholderText('EMAIL'), 'g@h.io');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'password123');
    await user.type(screen.getByPlaceholderText('CONFIRM PASSWORD'), 'password123');
    await user.click(screen.getByRole('button', { name: 'CREATE ACCOUNT' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      first_name: 'Grace',
      last_name: 'Brewster Hopper',
      email: 'g@h.io',
      password: 'password123',
      password_confirmation: 'password123',
    });
  });

  it('renders per-field validation errors instead of the generic message', async () => {
    server.use(
      http.post(`${API}/client/register`, () =>
        HttpResponse.json(
          { message: 'The given data was invalid.', errors: { email: ['The email has already been taken.'], password: ['Too short.'] } },
          { status: 422 },
        ),
      ),
    );
    const { user, onClose } = setup({ initialMode: 'register' });
    await user.type(screen.getByPlaceholderText('FULL NAME'), 'A B');
    await user.type(screen.getByPlaceholderText('EMAIL'), 'taken@example.com');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'x');
    await user.type(screen.getByPlaceholderText('CONFIRM PASSWORD'), 'x');
    await user.click(screen.getByRole('button', { name: 'CREATE ACCOUNT' }));
    expect(await screen.findByText('The email has already been taken.')).toBeInTheDocument();
    expect(screen.getByText('Too short.')).toBeInTheDocument();
    expect(screen.queryByText('The given data was invalid.')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('clears errors when switching modes', async () => {
    const { user } = setup();
    await user.type(screen.getByPlaceholderText('EMAIL'), 'a@b.c');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: 'LOG IN' }));
    await screen.findByText('Invalid credentials.');
    await user.click(screen.getByRole('button', { name: 'NO ACCOUNT? REGISTER' }));
    expect(screen.queryByText('Invalid credentials.')).not.toBeInTheDocument();
  });

  it('close button calls onClose without submitting', async () => {
    const { user, onClose } = setup();
    await user.click(screen.getByRole('button', { name: '✕' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('works without onSuccess', async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(<AuthModal onClose={onClose} />);
    await user.type(screen.getByPlaceholderText('EMAIL'), 'a@b.c');
    await user.type(screen.getByPlaceholderText('PASSWORD (MIN 8)'), 'password123');
    await user.click(screen.getByRole('button', { name: 'LOG IN' }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
