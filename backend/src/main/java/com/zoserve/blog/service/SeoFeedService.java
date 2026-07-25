package com.zoserve.blog.service;

import com.zoserve.blog.entity.Blog;
import com.zoserve.blog.repository.BlogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SeoFeedService {

    @Autowired
    private BlogRepository blogRepository;

    public String generateRobotsTxt() {
        return "User-agent: *\n" +
                "Allow: /\n" +
                "Disallow: /blog/admin/\n" +
                "Disallow: /blog/login\n" +
                "\n" +
                "Sitemap: https://blog.zoserve.com/sitemap.xml\n";
    }

    public String generateSitemapXml() {
        // Fetch all published blogs
        List<Blog> blogs = blogRepository.findAll().stream()
                .filter(Blog::getIsPublished)
                .toList();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");

        // Add main blog listing URL
        xml.append("  <url>\n");
        xml.append("    <loc>https://blog.zoserve.com/blog</loc>\n");
        xml.append("    <changefreq>daily</changefreq>\n");
        xml.append("    <priority>1.0</priority>\n");
        xml.append("  </url>\n");

        // Add blog details URLs
        for (Blog blog : blogs) {
            String lastmod = blog.getUpdatedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            xml.append("  <url>\n");
            xml.append("    <loc>https://blog.zoserve.com/blog/").append(blog.getSlug()).append("</loc>\n");
            xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
            xml.append("    <changefreq>weekly</changefreq>\n");
            xml.append("    <priority>0.8</priority>\n");
            xml.append("  </url>\n");
        }

        xml.append("</urlset>");
        return xml.toString();
    }

    public String generateRssFeedXml() {
        List<Blog> blogs = blogRepository.findAll().stream()
                .filter(Blog::getIsPublished)
                .sorted((b1, b2) -> b2.getPublishedAt().compareTo(b1.getPublishedAt()))
                .toList();

        String nowFormatted = ZonedDateTime.now().format(DateTimeFormatter.RFC_1123_DATE_TIME);

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\" ?>\n");
        xml.append("<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n");
        xml.append("<channel>\n");
        xml.append("  <title>ZoServe Blog</title>\n");
        xml.append("  <link>https://blog.zoserve.com/blog</link>\n");
        xml.append("  <description>Latest technology insights, software engineering guides, and company news from ZoServe.</description>\n");
        xml.append("  <language>en-us</language>\n");
        xml.append("  <lastBuildDate>").append(nowFormatted).append("</lastBuildDate>\n");
        xml.append("  <atom:link href=\"https://blog.zoserve.com/rss.xml\" rel=\"self\" type=\"application/rss+xml\" />\n");

        for (Blog blog : blogs) {
            String pubDate = blog.getPublishedAt().atZone(ZoneId.systemDefault()).format(DateTimeFormatter.RFC_1123_DATE_TIME);
            xml.append("  <item>\n");
            xml.append("    <title>").append(escapeXml(blog.getTitle())).append("</title>\n");
            xml.append("    <link>https://blog.zoserve.com/blog/").append(blog.getSlug()).append("</link>\n");
            xml.append("    <description>").append(escapeXml(blog.getShortDescription())).append("</description>\n");
            xml.append("    <pubDate>").append(pubDate).append("</pubDate>\n");
            xml.append("    <guid>https://blog.zoserve.com/blog/").append(blog.getSlug()).append("</guid>\n");
            xml.append("  </item>\n");
        }

        xml.append("</channel>\n");
        xml.append("</rss>");
        return xml.toString();
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }
}
