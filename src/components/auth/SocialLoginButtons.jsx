export default function SocialLoginButtons() {
  const handleSocialLogin = (provider) => {
    // Placeholder for backend social login handler
    console.log(`Social login with ${provider}`);
    // When backend is ready: window.location.href = `/api/auth/oauth/${provider}`;
  };

  const providers = [
    {
      id: 'google',
      name: 'Google',
      emoji: '🔍',
      color: 'bg-white hover:bg-gray-100 text-gray-900',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      emoji: '👤',
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
      id: 'apple',
      name: 'Apple',
      emoji: '🍎',
      color: 'bg-black hover:bg-gray-900 text-white',
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      emoji: '⊞',
      color: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
  ];

  return (
    <div className="space-y-3">
      {providers.map(provider => (
        <button
          key={provider.id}
          onClick={() => handleSocialLogin(provider.id)}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${provider.color}`}
        >
          <span>{provider.emoji}</span>
          Continue with {provider.name}
        </button>
      ))}
    </div>
  );
}