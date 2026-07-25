package com.zoserve.blog.dto;

import java.util.List;

public class DashboardStatsResponse {
    private long totalBlogs;
    private long publishedBlogs;
    private long draftBlogs;
    private long totalCategories;
    private long totalViews;
    private List<BlogResponse> recentBlogs;

    // Constructors
    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalBlogs, long publishedBlogs, long draftBlogs, long totalCategories,
                                  long totalViews, List<BlogResponse> recentBlogs) {
        this.totalBlogs = totalBlogs;
        this.publishedBlogs = publishedBlogs;
        this.draftBlogs = draftBlogs;
        this.totalCategories = totalCategories;
        this.totalViews = totalViews;
        this.recentBlogs = recentBlogs;
    }

    // Getters and Setters
    public long getTotalBlogs() { return totalBlogs; }
    public void setTotalBlogs(long totalBlogs) { this.totalBlogs = totalBlogs; }

    public long getPublishedBlogs() { return publishedBlogs; }
    public void setPublishedBlogs(long publishedBlogs) { this.publishedBlogs = publishedBlogs; }

    public long getDraftBlogs() { return draftBlogs; }
    public void setDraftBlogs(long draftBlogs) { this.draftBlogs = draftBlogs; }

    public long getTotalCategories() { return totalCategories; }
    public void setTotalCategories(long totalCategories) { this.totalCategories = totalCategories; }

    public long getTotalViews() { return totalViews; }
    public void setTotalViews(long totalViews) { this.totalViews = totalViews; }

    public List<BlogResponse> getRecentBlogs() { return recentBlogs; }
    public void setRecentBlogs(List<BlogResponse> recentBlogs) { this.recentBlogs = recentBlogs; }

    // Static Builder
    public static DashboardStatsResponseBuilder builder() {
        return new DashboardStatsResponseBuilder();
    }

    public static class DashboardStatsResponseBuilder {
        private long totalBlogs;
        private long publishedBlogs;
        private long draftBlogs;
        private long totalCategories;
        private long totalViews;
        private List<BlogResponse> recentBlogs;

        public DashboardStatsResponseBuilder totalBlogs(long totalBlogs) { this.totalBlogs = totalBlogs; return this; }
        public DashboardStatsResponseBuilder publishedBlogs(long publishedBlogs) { this.publishedBlogs = publishedBlogs; return this; }
        public DashboardStatsResponseBuilder draftBlogs(long draftBlogs) { this.draftBlogs = draftBlogs; return this; }
        public DashboardStatsResponseBuilder totalCategories(long totalCategories) { this.totalCategories = totalCategories; return this; }
        public DashboardStatsResponseBuilder totalViews(long totalViews) { this.totalViews = totalViews; return this; }
        public DashboardStatsResponseBuilder recentBlogs(List<BlogResponse> recentBlogs) { this.recentBlogs = recentBlogs; return this; }

        public DashboardStatsResponse build() {
            return new DashboardStatsResponse(totalBlogs, publishedBlogs, draftBlogs, totalCategories, totalViews, recentBlogs);
        }
    }
}
