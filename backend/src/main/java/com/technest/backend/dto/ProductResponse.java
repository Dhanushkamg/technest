package com.technest.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Long categoryId;
    private String categoryName;
    private Double averageRating;
    private Integer reviewCount;
    private List<String> images;
    private List<ProductVariantDto> variants;

    public ProductResponse() {
    }

    public ProductResponse(Long id, String name, String slug, String description,
                           BigDecimal price, Integer stock,
                           Long categoryId, String categoryName,
                           Double averageRating, Integer reviewCount) {
        this.id          = id;
        this.name        = name;
        this.slug        = slug;
        this.description = description;
        this.price       = price;
        this.stock       = stock;
        this.categoryId  = categoryId;
        this.categoryName = categoryName;
        this.averageRating = averageRating;
        this.reviewCount = reviewCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public List<ProductVariantDto> getVariants() { return variants; }
    public void setVariants(List<ProductVariantDto> variants) { this.variants = variants; }
}
