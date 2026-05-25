package com.parking.pbms.exception;

public class ConflictException extends RuntimeException {
    private String code;

    public ConflictException(String message) {
        super(message);
        this.code = "CONFLICT";
    }

    public ConflictException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
