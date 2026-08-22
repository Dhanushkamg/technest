package com.technest.backend.dto;

import java.util.List;

/**
 * Wraps paginated product results with metadata for the client.
 */
public class PagedProductResponse extends PagedResponse<ProductResponse> {

    public PagedProductResponse() {
        super();
    }

    public PagedProductResponse(List<ProductResponse> content, int page, int size,
                                long totalElements, int totalPages,
                                boolean first, boolean last) {
        super(content, page, size, totalElements, totalPages, first, last);
    }
}
