package com.zoserve.blog.controller;

import com.zoserve.blog.dto.ImageResponse;
import com.zoserve.blog.dto.MessageResponse;
import com.zoserve.blog.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/v1/admin/media")
public class AdminMediaController {

    @Autowired
    private ImageService imageService;

    // Upload an image
    @PostMapping("/upload")
    public ResponseEntity<ImageResponse> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        ImageResponse response = imageService.uploadImage(file);
        return ResponseEntity.ok(response);
    }

    // List all media files metadata
    @GetMapping
    public ResponseEntity<List<ImageResponse>> listMedia() {
        List<ImageResponse> mediaList = imageService.getAllImagesMetadata();
        return ResponseEntity.ok(mediaList);
    }

    // Delete a media file
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteMedia(@PathVariable Long id) {
        imageService.deleteImage(id);
        return ResponseEntity.ok(new MessageResponse("Image deleted successfully from database"));
    }
}
