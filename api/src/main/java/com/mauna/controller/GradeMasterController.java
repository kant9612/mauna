package com.mauna.controller;

import com.mauna.domain.GradeMaster;
import com.mauna.dto.GradeMasterResponse;
import com.mauna.service.GradeMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/grade-masters")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}, allowCredentials = "true")
public class GradeMasterController {

    @Autowired
    private GradeMasterService gradeMasterService;

    @GetMapping
    public ResponseEntity<List<GradeMasterResponse>> getAllGradeMasters() {
        List<GradeMaster> gradeMasters = gradeMasterService.getAllGradeMasters();
        List<GradeMasterResponse> response = gradeMasters.stream()
                .map(GradeMasterResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GradeMasterResponse> getGradeMasterById(@PathVariable Long id) {
        GradeMaster gradeMaster = gradeMasterService.getGradeMasterById(id);
        return ResponseEntity.ok(GradeMasterResponse.fromDomain(gradeMaster));
    }
}
