import * as LucideIcons from 'lucide-react';


export const IconRenderer = ({ icon }: { icon?: React.ReactNode | string }) => {
  if (!icon) return null;

  if (typeof icon === 'string') {
    // Try to find the icon in Lucide icons
    const IconComponent = (LucideIcons as any)[icon];
    if (IconComponent) {
      return <IconComponent className="h-4 w-4 text-primary" />;
    }
    // If not found, return the string (could be a class name or other identifier)
    return <span className="h-4 w-4 flex items-center justify-center">{icon}</span>;
  }

  // If it's already a React element, just return it
  return <>{icon}</>;
};
