import { JobCategory } from '../types/job';

export interface CategoryInfo {
  id: JobCategory;
  name: string;
  iconName: string;
  description: string;
  colorClass: string;
  badgeBg: string;
  accentBorder: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'Delivery',
    name: 'Delivery',
    iconName: 'Bike',
    description: 'Local food, package, and document courier helpers',
    colorClass: 'text-amber-300',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    accentBorder: 'hover:border-amber-500/40',
  },
  {
    id: 'Retail',
    name: 'Retail',
    iconName: 'ShoppingBag',
    description: 'Boutiques, apparel stores, and shelf stocking',
    colorClass: 'text-blue-300',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    accentBorder: 'hover:border-blue-500/40',
  },
  {
    id: 'Shop Management',
    name: 'Shop Management',
    iconName: 'Store',
    description: 'Store cashier, inventory check & counter assistance',
    colorClass: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    accentBorder: 'hover:border-emerald-500/40',
  },
  {
    id: 'Cafe & Restaurant',
    name: 'Cafe & Restaurant',
    iconName: 'Coffee',
    description: 'Barista assistant, table service, counter staff',
    colorClass: 'text-orange-300',
    badgeBg: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    accentBorder: 'hover:border-orange-500/40',
  },
  {
    id: 'Office Assistant',
    name: 'Office Assistant',
    iconName: 'Briefcase',
    description: 'Filing, coordination, and office logistics',
    colorClass: 'text-indigo-300',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    accentBorder: 'hover:border-indigo-500/40',
  },
  {
    id: 'Data Entry',
    name: 'Data Entry',
    iconName: 'Database',
    description: 'Catalog updates, invoices, and digital record keeping',
    colorClass: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    accentBorder: 'hover:border-cyan-500/40',
  },
  {
    id: 'Reception',
    name: 'Reception',
    iconName: 'Users',
    description: 'Front desk greeter, visitor entry, call handling',
    colorClass: 'text-purple-300',
    badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    accentBorder: 'hover:border-purple-500/40',
  },
  {
    id: 'Customer Support',
    name: 'Customer Support',
    iconName: 'Headphones',
    description: 'In-store inquiry desk, order tracking help',
    colorClass: 'text-teal-300',
    badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    accentBorder: 'hover:border-teal-500/40',
  },
  {
    id: 'Event Work',
    name: 'Event Work',
    iconName: 'Calendar',
    description: 'Festivals, college expos, booth management',
    colorClass: 'text-pink-300',
    badgeBg: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    accentBorder: 'hover:border-pink-500/40',
  },
  {
    id: 'Tutoring',
    name: 'Tutoring',
    iconName: 'GraduationCap',
    description: 'School level maths, science & evening homework help',
    colorClass: 'text-violet-300',
    badgeBg: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    accentBorder: 'hover:border-violet-500/40',
  },
  {
    id: 'Warehouse',
    name: 'Warehouse',
    iconName: 'Package',
    description: 'Sorting parcels, packing boxes, inventory counts',
    colorClass: 'text-yellow-300',
    badgeBg: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
    accentBorder: 'hover:border-yellow-500/40',
  },
  {
    id: 'Other',
    name: 'Other Local Gigs',
    iconName: 'Sparkles',
    description: 'Flyer distribution, library cataloging, seasonal tasks',
    colorClass: 'text-slate-300',
    badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    accentBorder: 'hover:border-slate-500/40',
  }
];
