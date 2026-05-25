package com.parking.pbms.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorEnvelope {
        private ErrorDetails error;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetails {
        private String code;
        private String message;
        private List<String> details;
    }

    // Handles validation annotation exceptions (e.g. @NotBlank, @Size)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorEnvelope> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<String> details = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            details.add(fieldName + ": " + errorMessage);
        });

        ErrorEnvelope envelope = ErrorEnvelope.builder()
                .error(ErrorDetails.builder()
                        .code("VALIDATION_FAILED")
                        .message("Input parameter validation failed.")
                        .details(details)
                        .build())
                .build();

        return new ResponseEntity<>(envelope, HttpStatus.BAD_REQUEST);
    }

    // General Fallback Handler
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorEnvelope> handleAllExceptions(Exception ex) {
        ErrorEnvelope envelope = ErrorEnvelope.builder()
                .error(ErrorDetails.builder()
                        .code("INTERNAL_SERVER_ERROR")
                        .message(ex.getMessage() != null ? ex.getMessage() : "An unexpected server error occurred.")
                        .details(new ArrayList<>())
                        .build())
                .build();

        return new ResponseEntity<>(envelope, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
