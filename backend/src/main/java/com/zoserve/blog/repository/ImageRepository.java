package com.zoserve.blog.repository;

import com.zoserve.blog.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {
    
    // Custom query to fetch only image metadata (excluding the binary LONGBLOB 'data' field) 
    // to improve performance during lists.
    @Query("SELECT i.id, i.name, i.contentType, i.size, i.createdAt FROM Image i ORDER BY i.createdAt DESC")
    List<Object[]> findAllMetadata();
}
