package com.zoserve.blog.service;

import com.zoserve.blog.entity.Newsletter;
import com.zoserve.blog.repository.NewsletterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NewsletterService {

    @Autowired
    private NewsletterRepository newsletterRepository;

    @Transactional
    public void subscribe(String email) {
        if (newsletterRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already subscribed to the newsletter!");
        }

        Newsletter subscriber = Newsletter.builder()
                .email(email)
                .build();
        newsletterRepository.save(subscriber);
    }

    public List<Newsletter> getAllSubscribers() {
        return newsletterRepository.findAll();
    }
}
