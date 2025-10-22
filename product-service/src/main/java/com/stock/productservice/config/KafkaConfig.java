package com.stock.productservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Product Topics
    public static final String PRODUCT_CREATED_TOPIC = "product.created";
    public static final String PRODUCT_UPDATED_TOPIC = "product.updated";
    public static final String PRODUCT_DELETED_TOPIC = "product.deleted";

    // Category Topics
    public static final String CATEGORY_CREATED_TOPIC = "category.created";
    public static final String CATEGORY_UPDATED_TOPIC = "category.updated";
    public static final String CATEGORY_DELETED_TOPIC = "category.deleted";

    // Supplier Topics
    public static final String SUPPLIER_CREATED_TOPIC = "supplier.created";
    public static final String SUPPLIER_UPDATED_TOPIC = "supplier.updated";
    public static final String SUPPLIER_DELETED_TOPIC = "supplier.deleted";

    // Product Topics
    @Bean
    public NewTopic productCreatedTopic() {
        return TopicBuilder
                .name(PRODUCT_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic productUpdatedTopic() {
        return TopicBuilder
                .name(PRODUCT_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic productDeletedTopic() {
        return TopicBuilder
                .name(PRODUCT_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Category Topics
    @Bean
    public NewTopic categoryCreatedTopic() {
        return TopicBuilder
                .name(CATEGORY_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic categoryUpdatedTopic() {
        return TopicBuilder
                .name(CATEGORY_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic categoryDeletedTopic() {
        return TopicBuilder
                .name(CATEGORY_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Supplier Topics
    @Bean
    public NewTopic supplierCreatedTopic() {
        return TopicBuilder
                .name(SUPPLIER_CREATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic supplierUpdatedTopic() {
        return TopicBuilder
                .name(SUPPLIER_UPDATED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic supplierDeletedTopic() {
        return TopicBuilder
                .name(SUPPLIER_DELETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
