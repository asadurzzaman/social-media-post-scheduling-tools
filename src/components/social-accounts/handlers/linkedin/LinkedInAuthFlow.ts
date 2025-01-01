export const initializeLinkedInAuth = () => {
  const redirectUri = `${window.location.origin}/linkedin-callback.html`;
  const scope = 'r_liteprofile w_member_social';
  const state = crypto.randomUUID();
  sessionStorage.setItem('linkedin_state', state);
  
  return { redirectUri, scope, state };
};

export const verifyState = (receivedState: string) => {
  const storedState = sessionStorage.getItem('linkedin_state');
  return receivedState === storedState;
};

export const createAuthWindow = (authUrl: string) => {
  return window.open(authUrl, 'LinkedIn Login', 'width=600,height=700');
};