import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Check,
  HelpCircle,
  Loader,
  ShieldAlert,
  XCircle,
  XOctagon,
} from 'lucide-react';
import React from 'react';

import { ValidationDetails, ValidationLevel as _ValidationLevel } from '../app/types';
import {
  getValidationColor,
  getValidationIcon as _getValidationIcon,
} from '../lib/validationUtils';

interface ValidationStatusIndicatorProps {
  details: ValidationDetails;
  className?: string;
  showTooltip?: boolean;
}

const ValidationStatusIndicator: React.FC<ValidationStatusIndicatorProps> = ({
  details,
  className = '',
  showTooltip = true,
}) => {
  if (!details) {
    return null;
  }

  // Sélectionner l'icône en fonction du niveau
  const renderIcon = () => {
    switch (details.level) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'success-with-options':
        return <Check className="h-5 w-5" />;
      case 'warning-options':
        return <AlertTriangle className="h-5 w-5" />;
      case 'warning-syntax':
        return <AlertCircle className="h-5 w-5" />;
      case 'error-name':
        return <XCircle className="h-5 w-5" />;
      case 'error-manager':
        return <AlertOctagon className="h-5 w-5" />;
      case 'error-security':
        return <ShieldAlert className="h-5 w-5" />;
      case 'error-syntax':
        return <XOctagon className="h-5 w-5" />;
      case 'loading':
        return <Loader className="h-5 w-5 animate-spin" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  // Obtenir la couleur associée au niveau
  const color = getValidationColor(details.level);
  const baseClassName = `flex items-center ${color} ${className}`;

  // Retourner l'icône avec ou sans titre
  return (
    <div className={baseClassName} title={showTooltip ? details.message : undefined}>
      {renderIcon()}
    </div>
  );
};

export default ValidationStatusIndicator;
