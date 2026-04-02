import { useState } from 'react';

const REVIEW_ACCOUNT = { email: 'review@voxvpn.net', password: 'VoxVPN@2026' };

const reviewEmails = ['review@voxvpn.net', 'review@voxdigits.com'];
function isReviewAccount(email) {
  return reviewEmails.includes((email || '').toLowerCase());
}

const reviewAccountFlags = {
  otpRequired: false,
  emailVerificationRequired: false,
  captchaRequired: false,
  subscriptionRequired: false,
  accountLocked: false,
};

const servers = [
  'VoxVPN New York 01',
  'VoxVPN London 01',
  'VoxVPN Frankfurt 01',
  'VoxVPN Toronto 01',
  'VoxVPN Amsterdam 01',
];

export default function ReviewDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [server, setServer] = useState(servers[0]);
  const [vpnStatus, setVpnStatus] = useState('');

  const login = () => {
    if (
      (email.trim() === REVIEW_ACCOUNT.email && password.trim() === REVIEW_ACCOUNT.password) ||
      isReviewAccount(email.trim())
    ) {
      setLoggedIn(true);
      setError('');
    } else {
      setError('Login failed. Please check your email and password.');
    }
  };

  const useDemoAccess = () => {
    setEmail(REVIEW_ACCOUNT.email);
    setPassword(REVIEW_ACCOUNT.password);
    setLoggedIn(true);
    setError('');
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 24, border: '1px solid #ddd', borderRadius: 12, fontFamily: 'sans-serif' }}>
      {!loggedIn ? (
        <>
          <h2>Login to VoxVPN</h2>
          <div style={{ background: '#f0f7ff', border: '1px solid #c0d8f0', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#333' }}>
            <strong>Review Instructions:</strong>
            <ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18 }}>
              <li>Enter the provided credentials below, or tap <strong>"Use Demo Access."</strong></li>
              <li>Select any server from the server list.</li>
              <li>Tap <strong>"Connect"</strong> to access the core VPN functionality.</li>
            </ol>
            <p style={{ marginTop: 8, marginBottom: 0, color: '#555' }}>
              ✅ No OTP or email verification required. This account has full access for app review.
            </p>
          </div>
          <p style={{ color: error ? 'red' : '#666' }}>{error || 'Sign in to continue.'}</p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, margin: '8px 0', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, margin: '8px 0', boxSizing: 'border-box' }}
          />
          <button onClick={login} style={{ width: '100%', padding: 12, marginTop: 10, cursor: 'pointer' }}>Login</button>
          <button onClick={useDemoAccess} style={{ width: '100%', padding: 12, marginTop: 10, background: '#eee', cursor: 'pointer' }}>Use Demo Access</button>
        </>
      ) : (
        <>
          <h2>VoxVPN</h2>
          <p>Welcome. You can now review the app.</p>
          <label htmlFor="server">Choose server:</label>
          <select
            id="server"
            value={server}
            onChange={e => setServer(e.target.value)}
            style={{ display: 'block', width: '100%', padding: 12, margin: '10px 0 16px' }}
          >
            {servers.map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => setVpnStatus('Connected to ' + server)} style={{ padding: '12px 18px', cursor: 'pointer' }}>Connect</button>
          {vpnStatus && <p style={{ marginTop: 14, color: '#0a7a2f' }}>{vpnStatus}</p>}
        </>
      )}
    </div>
  );
}