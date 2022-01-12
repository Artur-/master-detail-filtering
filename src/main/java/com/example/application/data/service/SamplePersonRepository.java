package com.example.application.data.service;

import java.util.UUID;

import com.example.application.data.entity.SamplePerson;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SamplePersonRepository
        extends JpaRepository<SamplePerson, UUID>, JpaSpecificationExecutor<SamplePerson> {

    
}
