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
import java.util.NoSuchElementException;

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

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ErrorEnvelope> handleConflictException(ConflictException ex) {
        ErrorEnvelope envelope = ErrorEnvelope.builder()
                .error(ErrorDetails.builder()
                        .code(ex.getCode())
                        .message(ex.getMessage())
                        .details(new ArrayList<>())
                        .build())
                .build();

        return new ResponseEntity<>(envelope, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorEnvelope> handleBadRequestException(IllegalArgumentException ex) {
        ErrorEnvelope envelope = ErrorEnvelope.builder()
                .error(ErrorDetails.builder()
                        .code("BAD_REQUEST")
                        .message(ex.getMessage())
                        .details(new ArrayList<>())
                        .build())
                .build();

        return new ResponseEntity<>(envelope, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorEnvelope> handleNotFoundException(NoSuchElementException ex) {
        ErrorEnvelope envelope = ErrorEnvelope.builder()
                .error(ErrorDetails.builder()
                        .code("NOT_FOUND")
                        .message(ex.getMessage())
                        .details(new ArrayList<>())
                        .build())
                .build();

        return new ResponseEntity<>(envelope, HttpStatus.NOT_FOUND);
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
