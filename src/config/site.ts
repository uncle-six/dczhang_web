export type Contact = {
  label: string;
  detail: string;
  href: string;
  external?: boolean;
};

// 在这里增删联系方式。示例：
// { label: '抖音', detail: '@你的抖音号', href: 'https://www.douyin.com/user/你的主页标识', external: true },
export const contacts: Contact[] = [
  {
    label: '邮箱',
    detail: 'dczhang01@gmail.com',
    href: 'mailto:dczhang01@gmail.com',
  },
  {
    label: 'GitHub',
    detail: '@uncle-six',
    href: 'https://github.com/uncle-six',
    external: true,
  },
];
