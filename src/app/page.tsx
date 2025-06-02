// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // redirect() is a terminal operation, so technically nothing below it will run.
  // However, to satisfy linters and for clarity, returning null or an empty fragment is common.
  return null; 
}
