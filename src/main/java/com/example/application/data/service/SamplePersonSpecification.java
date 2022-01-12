package com.example.application.data.service;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import com.example.application.data.endpoint.Filter;
import com.example.application.data.endpoint.Filter.FilterType;
import com.example.application.data.entity.SamplePerson;

import org.springframework.data.jpa.domain.Specification;

public class SamplePersonSpecification implements Specification<SamplePerson> {

    private Filter filter;

    public SamplePersonSpecification(Filter filter) {
        this.filter = filter;
    }

    @Override
    public Predicate toPredicate(Root<SamplePerson> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
        // criteriaBuilder.get
        if (filter.getType() == FilterType.BOOLEAN) {
            return criteriaBuilder.equal(root.get(filter.getPath()), Boolean.valueOf(filter.getValue()));
        } else if (filter.getType() == FilterType.STRING) {
            return criteriaBuilder.like(criteriaBuilder.lower(root.get(filter.getPath())), "%" + filter.getValue().toLowerCase() + "%");
        } else {
            throw new IllegalStateException("Unsupported type: " + filter.getType());
        }

    }

}
