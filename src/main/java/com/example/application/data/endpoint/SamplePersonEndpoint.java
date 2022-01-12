package com.example.application.data.endpoint;

import com.example.application.data.entity.SamplePerson;
import com.example.application.data.service.SamplePersonService;
import com.example.application.data.service.SamplePersonSpecification;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.fusion.Endpoint;
import com.vaadin.fusion.Nonnull;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Endpoint
@AnonymousAllowed
public class SamplePersonEndpoint {

    private SamplePersonService service;

    public SamplePersonEndpoint(@Autowired SamplePersonService service) {
        this.service = service;
    }

    @Nonnull
    public Page<@Nonnull SamplePerson> list(Pageable page, List<Filter> filters) {
        return service.list(page, filters);
    }

    public Optional<SamplePerson> get(@Nonnull UUID id) {
        return service.get(id);
    }

    @Nonnull
    public SamplePerson update(@Nonnull SamplePerson entity) {
        return service.update(entity);
    }

    public void delete(@Nonnull UUID id) {
        service.delete(id);
    }

    public int count() {
        return service.count();
    }

}
