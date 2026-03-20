import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * WorkOS AuthKit handles both login and signup in the same flow.
 * Redirect to login screen which uses the universal AuthKit flow.
 */
export default function SignupScreen() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(auth)/login');
  }, [router]);
  return null;
}
