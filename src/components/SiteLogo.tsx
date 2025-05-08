import { Eye } from 'lucide-react';
import Link from 'next/link';

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Eye className="h-8 w-8 text-primary" />
      <span className="text-2xl font-bold text-primary">
        Netram<span className="font-normal text-foreground">Vision</span>
      </span>
    </Link>
  );
}
