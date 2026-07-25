package com.zoserve.blog.service;

import com.zoserve.blog.dto.ImageResponse;
import com.zoserve.blog.entity.Image;
import com.zoserve.blog.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ImageService {

    @Autowired
    private ImageRepository imageRepository;

    @Transactional
    public ImageResponse uploadImage(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            fileName = "uploaded_file_" + System.currentTimeMillis();
        }

        Image image = Image.builder()
                .name(fileName)
                .contentType(file.getContentType())
                .data(file.getBytes())
                .size(file.getSize())
                .build();

        Image savedImage = imageRepository.save(image);

        return ImageResponse.builder()
                .id(savedImage.getId())
                .name(savedImage.getName())
                .contentType(savedImage.getContentType())
                .size(savedImage.getSize())
                .createdAt(savedImage.getCreatedAt())
                .url("/api/v1/public/images/" + savedImage.getId())
                .build();
    }

    public Optional<Image> getImageById(Long id) {
        return imageRepository.findById(id);
    }

    public List<ImageResponse> getAllImagesMetadata() {
        List<Object[]> list = imageRepository.findAllMetadata();
        return list.stream().map(obj -> ImageResponse.builder()
                .id((Long) obj[0])
                .name((String) obj[1])
                .contentType((String) obj[2])
                .size((Long) obj[3])
                .createdAt((LocalDateTime) obj[4])
                .url("/api/v1/public/images/" + (Long) obj[0])
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public void deleteImage(Long id) {
        if (!imageRepository.existsById(id)) {
            throw new RuntimeException("Image not found with id: " + id);
        }
        imageRepository.deleteById(id);
    }
}
