import {
  LucideIcon as _LucideIcon,
  Package,
  GitBranch,
  Code,
  Layers,
  Globe,
  Terminal,
  Zap,
  Server,
} from 'lucide-react';
import React from 'react';

// Composant Icon qui reçoit l'identifiant d'icône et les propriétés génériques
interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: string;
  className?: string;
  size?: number;
}

// Import dynamique pour les icônes de Lucide React
export const Icon: React.FC<IconProps> = ({
  icon,
  className = '',
  size = 24,
  ..._props // Renommer props en _props puisqu'il n'est pas utilisé
}) => {
  // Map des icônes par identifiant
  const getIconComponent = () => {
    switch (icon) {
      case 'git-branch':
        return <GitBranch size={size} className={className} />;
      case 'nodejs':
      case 'code':
      case 'python':
      case 'pen-tool':
        return <Code size={size} className={className} />;
      case 'docker':
        return <Layers size={size} className={className} />;
      case 'chrome':
      case 'firefox':
      case 'brave':
      case 'edge':
        return <Globe size={size} className={className} />;
      case 'terminal':
      case 'terminal-square':
      case 'linux':
        return <Terminal size={size} className={className} />;
      case 'search':
        return <Zap size={size} className={className} />;
      case 'server':
        return <Server size={size} className={className} />;
      case 'package':
      default:
        return <Package size={size} className={className} />;
    }
  };

  return getIconComponent();
};

export default Icon;
