// Edit labels, icons and links here.
// URLs are placeholders: point each one at the matching Lookout Digital page when it exists.
export const SERVICES = [
  { id: 'web-design', label: 'Web Design', icon: 'monitor', url: 'services.html#websites' },
  { id: 'app-development', label: 'App Development', icon: 'phone', url: 'services.html#digital-products' },
  { id: 'digital-marketing', label: 'Digital Marketing', icon: 'megaphone', url: 'services.html' },
  { id: 'creative-design', label: 'Creative Design', icon: 'palette', url: 'services.html' },
  { id: 'website-care', label: 'Website Care', icon: 'wrench', url: 'services.html#ongoing-support' },
  { id: 'digital-training', label: 'Digital Training', icon: 'cap', url: 'services.html' },
];

// 24x24 line icons: stroked paths plus optional filled dots.
export const ICONS = {
  monitor: { paths: ['M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M8 21h8', 'M12 17v4'] },
  phone: { paths: ['M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z', 'M11 18h2'] },
  megaphone: { paths: ['m3 11 18-5v12L3 14v-3z', 'M11.6 16.8a3 3 0 1 1-5.8-1.6'] },
  palette: {
    paths: ['M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z'],
    dots: [[13.5, 6.5], [17.5, 10.5], [8.5, 7.5], [6.5, 12.5]],
  },
  wrench: { paths: ['M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'] },
  cap: { paths: ['M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z', 'M22 10v6', 'M6 12.5V16a6 3 0 0 0 12 0v-3.5'] },
};

export const COLORS = {
  purple: '#6B4EFF',
  offWhite: '#F4F3F1',
  charcoal: '#242424',
  white: '#FFFFFF',
};
