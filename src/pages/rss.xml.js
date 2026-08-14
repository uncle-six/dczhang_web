import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return rss({
    title: '章徳川 · 笔记与思考',
    description: '章徳川的个人博客，记录技术、阅读与生活中的思考。',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/posts/${post.id.replace(/\.md$/, '')}/`,
    })),
  });
}
