import { redirect } from 'next/navigation';

export default function RootRedirect() {
  // Redirige la raíz a la página de login/register
  redirect('/login-register');
}