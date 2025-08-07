export interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: number | null;
  color: string;
  href: string;
}

export interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
} 