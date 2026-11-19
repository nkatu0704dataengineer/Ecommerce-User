package com.ecomflow.store.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * POJO Entity ánh xạ bảng dbo.reviews (Đánh giá khách hàng & Phân tích sắc thái NLP).
 */
public class Review implements Serializable {

    private static final long serialVersionUID = 1L;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private String reviewId;
    private Order order;
    private Product product;
    private String reviewStatus; // APPROVED, PENDING, HIDDEN, PUBLISHED
    private BigDecimal reviewScore;
    private String reviewTitle;
    private String reviewMessage;
    private String repliedAt;
    private String createdAt;
    private String updatedAt;
    private String ingestionTime;

    // 8 Cờ Boolean NLP & Sắc thái
    private Boolean hasReply = false;
    private Boolean isMissingComment = false;
    private Boolean hasTitleOnly = false;
    private Boolean hasMessageOnly = false;
    private Boolean isCompleteReview = false;
    private Boolean isPositiveReview = false;
    private Boolean isNeutralReview = false;
    private Boolean isNegativeReview = false;
    private String reviewSentiment; // "Positive", "Neutral", "Negative"

    public Review() {
        String now = LocalDateTime.now().format(FORMATTER);
        this.createdAt = now;
        this.updatedAt = now;
        this.ingestionTime = now;
        this.reviewStatus = "APPROVED";
    }

    public Review(String reviewId, Order order, Product product, BigDecimal reviewScore,
                  String reviewTitle, String reviewMessage) {
        this();
        this.reviewId = reviewId;
        this.order = order;
        this.product = product;
        this.reviewScore = reviewScore;
        this.reviewTitle = reviewTitle;
        this.reviewMessage = reviewMessage;
        evaluateSentimentFlags();
    }

    public String getReviewId() {
        return reviewId;
    }

    public void setReviewId(String reviewId) {
        this.reviewId = reviewId;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public BigDecimal getReviewScore() {
        return reviewScore;
    }

    public void setReviewScore(BigDecimal reviewScore) {
        this.reviewScore = reviewScore;
        evaluateSentimentFlags();
    }

    public String getReviewTitle() {
        return reviewTitle;
    }

    public void setReviewTitle(String reviewTitle) {
        this.reviewTitle = reviewTitle;
        evaluateSentimentFlags();
    }

    public String getReviewMessage() {
        return reviewMessage;
    }

    public void setReviewMessage(String reviewMessage) {
        this.reviewMessage = reviewMessage;
        evaluateSentimentFlags();
    }

    public String getRepliedAt() {
        return repliedAt;
    }

    public void setRepliedAt(String repliedAt) {
        this.repliedAt = repliedAt;
        this.hasReply = (repliedAt != null && !repliedAt.isBlank());
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getIngestionTime() {
        return ingestionTime;
    }

    public void setIngestionTime(String ingestionTime) {
        this.ingestionTime = ingestionTime;
    }

    public Boolean getHasReply() {
        return hasReply;
    }

    public void setHasReply(Boolean hasReply) {
        this.hasReply = hasReply;
    }

    public Boolean getIsMissingComment() {
        return isMissingComment;
    }

    public void setIsMissingComment(Boolean missingComment) {
        isMissingComment = missingComment;
    }

    public Boolean getHasTitleOnly() {
        return hasTitleOnly;
    }

    public void setHasTitleOnly(Boolean hasTitleOnly) {
        this.hasTitleOnly = hasTitleOnly;
    }

    public Boolean getHasMessageOnly() {
        return hasMessageOnly;
    }

    public void setHasMessageOnly(Boolean hasMessageOnly) {
        this.hasMessageOnly = hasMessageOnly;
    }

    public Boolean getIsCompleteReview() {
        return isCompleteReview;
    }

    public void setIsCompleteReview(Boolean completeReview) {
        isCompleteReview = completeReview;
    }

    public Boolean getIsPositiveReview() {
        return isPositiveReview;
    }

    public void setIsPositiveReview(Boolean positiveReview) {
        isPositiveReview = positiveReview;
    }

    public Boolean getIsNeutralReview() {
        return isNeutralReview;
    }

    public void setIsNeutralReview(Boolean neutralReview) {
        isNeutralReview = neutralReview;
    }

    public Boolean getIsNegativeReview() {
        return isNegativeReview;
    }

    public void setIsNegativeReview(Boolean negativeReview) {
        isNegativeReview = negativeReview;
    }

    public String getReviewSentiment() {
        return reviewSentiment;
    }

    public void setReviewSentiment(String reviewSentiment) {
        this.reviewSentiment = reviewSentiment;
    }

    /**
     * Tự động phân loại 8 cờ NLP và nhãn cảm xúc từ điểm sao và nội dung chữ.
     */
    public void evaluateSentimentFlags() {
        boolean hasTitle = (reviewTitle != null && !reviewTitle.trim().isEmpty());
        boolean hasMsg = (reviewMessage != null && !reviewMessage.trim().isEmpty());

        this.isMissingComment = (!hasTitle && !hasMsg);
        this.hasTitleOnly = (hasTitle && !hasMsg);
        this.hasMessageOnly = (!hasTitle && hasMsg);
        this.isCompleteReview = (hasTitle && hasMsg);

        if (reviewScore != null) {
            double score = reviewScore.doubleValue();
            if (score >= 4.0) {
                this.isPositiveReview = true;
                this.isNeutralReview = false;
                this.isNegativeReview = false;
                this.reviewSentiment = "Positive";
            } else if (score >= 3.0) {
                this.isPositiveReview = false;
                this.isNeutralReview = true;
                this.isNegativeReview = false;
                this.reviewSentiment = "Neutral";
            } else {
                this.isPositiveReview = false;
                this.isNeutralReview = false;
                this.isNegativeReview = true;
                this.reviewSentiment = "Negative";
            }
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Review review = (Review) o;
        return Objects.equals(reviewId, review.reviewId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reviewId);
    }

    @Override
    public String toString() {
        return "Review{" +
                "reviewId='" + reviewId + '\'' +
                ", score=" + reviewScore +
                ", sentiment='" + reviewSentiment + '\'' +
                ", title='" + reviewTitle + '\'' +
                '}';
    }
}
