package com.example.application.data.endpoint;

import com.vaadin.fusion.Nonnull;

public class Filter {
    public enum FilterType {
        STRING, BOOLEAN
    }

    @Nonnull
    private String path;
    private String value;
    private FilterType type;

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public FilterType getType() {
        return type;
    }

    public void setType(FilterType type) {
        this.type = type;
    }
}
