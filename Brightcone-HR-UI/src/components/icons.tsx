import React from 'react';
import {
  FileText,
  PenTool,
  Check,
  Clock,
  X,
  Send,
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  Eye,
  FileCheck,
  Shield,
  Layers,
  Award,
} from 'lucide-react';

export const ic = (name: string, size: number = 16): React.ReactNode => {
  const props = { size, className: 'shrink-0 inline-block align-middle' };

  switch (name) {
    case 'doc':
      return <FileText {...props} />;
    case 'pen':
      return <PenTool {...props} />;
    case 'check':
      return <Check {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'x':
      return <X {...props} />;
    case 'send':
      return <Send {...props} />;
    case 'download':
      return <Download {...props} />;
    case 'plus':
      return <Plus {...props} />;
    case 'search':
      return <Search {...props} />;
    case 'edit':
      return <Edit2 {...props} />;
    case 'trash':
      return <Trash2 {...props} />;
    case 'swap':
      return <RotateCcw {...props} />;
    case 'eye':
      return <Eye {...props} />;
    case 'file-check':
      return <FileCheck {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'layers':
      return <Layers {...props} />;
    case 'award':
      return <Award {...props} />;
    default:
      return <FileText {...props} />;
  }
};

export default ic;
