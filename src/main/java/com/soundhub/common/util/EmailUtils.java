package com.soundhub.common.util;

/**
 * Email e sempre guardado em minusculo e sem espacos nas pontas, para que
 * "Joao@Email.com " e "joao@email.com" sejam tratados como o mesmo usuario.
 */
public final class EmailUtils {

    private EmailUtils() {
    }

    public static String normalizar(String email) {
        return email.trim().toLowerCase();
    }
}
